export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const memberId = session.user.id;

    const body = await req.json();
    const { item_id, purpose, notes, due_date, quantity } = body;

    if (!item_id || !purpose) {
      return NextResponse.json(
        { error: "item_id and purpose are required" },
        { status: 400 },
      );
    }

    const qty = quantity == null ? 1 : Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return NextResponse.json(
        { error: "quantity must be a positive integer" },
        { status: 400 },
      );
    }

    const purposeText = notes
      ? `${purpose}\n\nNotes: ${notes}`
      : purpose;

    // Run all validation checks in parallel for better performance
    const [item, duplicate, overdueForItem] = await Promise.all([
      prisma.item.findUnique({
        where: { id: Number(item_id) },
        select: { id: true, quantity_available: true, status: true },
      }),
      prisma.loan.findFirst({
        where: {
          member_id: memberId,
          item_id: Number(item_id),
          status: { in: ["REQUESTED", "APPROVED"] },
        },
        select: { id: true },
      }),
      prisma.loan.findFirst({
        where: {
          member_id: memberId,
          item_id: Number(item_id),
          status: "APPROVED",
          due_date: { lt: new Date() },
        },
        select: { id: true },
      }),
    ]);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.quantity_available <= 0) {
      return NextResponse.json(
        { error: "Item is out of stock" },
        { status: 400 },
      );
    }

    if (qty > item.quantity_available) {
      return NextResponse.json(
        { error: `Only ${item.quantity_available} available` },
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
    if (duplicate) {
      return NextResponse.json(
        { error: "You already have an active request or loan for this item" },
        { status: 400 },
      );
    }

    // Check for overdue loans for this item (APPROVED and past due_date)
    if (overdueForItem) {
      return NextResponse.json(
        { error: "You have an overdue loan for this item. Please return it before requesting again." },
        { status: 400 },
      );
    }

    // Create loan request
    const loan = await prisma.loan.create({
      data: {
        item_id: Number(item_id),
        member_id: memberId,
        quantity: qty,
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
