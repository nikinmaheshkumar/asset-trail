export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await context.params;
    const loanId = Number(id);

    if (isNaN(loanId)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
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
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);

  } catch (error) {
    console.error("Error fetching loan:", error);

    return NextResponse.json(
      { error: "Failed to fetch loan" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await context.params;
    const loanId = Number(id);

    if (isNaN(loanId)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    const body = await req.json();
    const { damage_notes } = body;

    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        item_id: true,
        status: true,
      },
    });

    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (existingLoan.status !== "BORROWED") {
      return NextResponse.json(
        { error: "Loan already returned" },
        { status: 400 },
      );
    }

    const updatedLoan = await prisma.$transaction(async (tx) => {
      const loanUpdate = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: "RETURNED",
          return_date: new Date(),
          damage_notes: damage_notes ?? null,
        },
      });

      await tx.item.update({
        where: { id: existingLoan.item_id },
        data: {
          quantity_available: { increment: 1 },
        },
      });

      return loanUpdate;
    });

    return NextResponse.json(updatedLoan);

  } catch (error) {
    console.error("Error updating loan:", error);

    return NextResponse.json(
      { error: "Failed to update loan" },
      { status: 500 },
    );
  }
}