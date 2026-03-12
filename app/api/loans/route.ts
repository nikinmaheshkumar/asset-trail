export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberIdParam = searchParams.get("member_id");

    const loans = await prisma.loan.findMany({
      where: memberIdParam ? { member_id: Number(memberIdParam) } : undefined,
      select: {
        id: true,
        item_id: true,
        member_id: true,
        borrow_date: true,
        due_date: true,
        return_date: true,
        purpose: true,
        status: true,
        damage_notes: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { borrow_date: "desc" },
    });

    return NextResponse.json(loans);

  } catch (error) {
    console.error("Error fetching loans:", error);

    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { item_id, member_id, due_date, purpose } = body;

    if (!item_id || !member_id || !due_date || !purpose) {
      return NextResponse.json(
        { error: "item_id, member_id, due_date, and purpose are required" },
        { status: 400 },
      );
    }

    if (new Date(due_date) <= new Date()) {
      return NextResponse.json(
        { error: "due_date must be in the future" },
        { status: 400 },
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: Number(item_id) },
      select: { id: true, quantity_available: true, status: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.status !== "WORKING" || item.quantity_available <= 0) {
      return NextResponse.json(
        { error: "Item is not available for borrowing" },
        { status: 400 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: Number(member_id) },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const loan = await prisma.$transaction(async (tx) => {
      const createdLoan = await tx.loan.create({
        data: {
          item_id: Number(item_id),
          member_id: Number(member_id),
          due_date: new Date(due_date),
          purpose: purpose,
        },
        select: {
          id: true,
          item_id: true,
          member_id: true,
          borrow_date: true,
          due_date: true,
          purpose: true,
          status: true,
        },
      });

      await tx.item.update({
        where: { id: Number(item_id) },
        data: {
          quantity_available: { decrement: 1 },
        },
      });

      return createdLoan;
    });

    return NextResponse.json(loan, { status: 201 });

  } catch (error) {
    console.error("Error creating loan:", error);

    return NextResponse.json(
      { error: "Failed to create loan" },
      { status: 500 },
    );
  }
}