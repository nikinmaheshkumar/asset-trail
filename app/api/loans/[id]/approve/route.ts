export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["MASTER_ADMIN", "BOARD"]);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const adminId = session.user.id;

    const { id } = await context.params;
    const loanId = Number(id);

    if (isNaN(loanId)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: { id: true, item_id: true, status: true },
    });

    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (existingLoan.status !== "REQUESTED") {
      return NextResponse.json(
        { error: "Only REQUESTED loans can be approved" },
        { status: 400 },
      );
    }

    const approvedAt = new Date();
    const dueDate = new Date(approvedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updatedLoan = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: "APPROVED",
          approved_by: adminId,
          approved_at: approvedAt,
          due_date: dueDate,
        },
      });

      await tx.item.update({
        where: { id: existingLoan.item_id },
        data: { quantity_available: { decrement: 1 } },
      });

      return loan;
    });

    await prisma.activityLog.create({
      data: {
        action: "loan_approved",
        actor_id: adminId,
        target_id: loanId,
      },
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error approving loan:", error);
    return NextResponse.json(
      { error: "Failed to approve loan" },
      { status: 500 },
    );
  }
}
