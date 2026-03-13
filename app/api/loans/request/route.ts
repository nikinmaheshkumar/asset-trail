export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const BORROW_LIMITS: Record<string, number> = {
  JUNIOR_CORE: 2,
  SENIOR_CORE: 5,
  BOARD: Infinity,
  MASTER_ADMIN: Infinity,
};

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const memberId = session.user.id;
    const role = session.user.role as string;

    const body = await req.json();
    const { item_id, purpose, notes, due_date } = body;

    if (!item_id || !purpose) {
      return NextResponse.json(
        { error: "item_id and purpose are required" },
        { status: 400 },
      );
    }

    const purposeText = notes
      ? `${purpose}\n\nNotes: ${notes}`
      : purpose;

    // Check item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: Number(item_id) },
      select: { id: true, quantity_available: true, status: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.quantity_available <= 0) {
      return NextResponse.json(
        { error: "Item is out of stock" },
        { status: 400 },
      );
    }

    if (item.status !== "WORKING") {
      return NextResponse.json(
        { error: "Item is not available for borrowing" },
        { status: 400 },
      );
    }

    // Check for duplicate active loan (REQUESTED or APPROVED)
    const duplicate = await prisma.loan.findFirst({
      where: {
        member_id: memberId,
        item_id: Number(item_id),
        status: { in: ["REQUESTED", "APPROVED"] },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "You already have an active request or loan for this item" },
        { status: 400 },
      );
    }

    // Check borrow limit
    const activeCount = await prisma.loan.count({
      where: {
        member_id: memberId,
        status: { in: ["REQUESTED", "APPROVED"] },
      },
    });

    const limit = BORROW_LIMITS[role] ?? 2;
    if (activeCount >= limit) {
      return NextResponse.json(
        { error: `You have reached the maximum borrow limit of ${limit}` },
        { status: 400 },
      );
    }

    // Check for overdue loans (APPROVED and past due_date)
    const overdueLoan = await prisma.loan.findFirst({
      where: {
        member_id: memberId,
        status: "APPROVED",
        due_date: { lt: new Date() },
      },
    });

    if (overdueLoan) {
      return NextResponse.json(
        { error: "You have an overdue loan. Please return the item before requesting a new one." },
        { status: 400 },
      );
    }

    // Create loan request
    const loan = await prisma.loan.create({
      data: {
        item_id: Number(item_id),
        member_id: memberId,
        purpose: purposeText,
        status: "REQUESTED",
        ...(due_date ? { due_date: new Date(due_date) } : {}),
      },
      select: {
        id: true,
        item_id: true,
        member_id: true,
        requested_at: true,
        purpose: true,
        status: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "loan_requested",
        actor_id: memberId,
        target_id: loan.id,
      },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error("Error creating loan request:", error);
    return NextResponse.json(
      { error: "Failed to create loan request" },
      { status: 500 },
    );
  }
}
