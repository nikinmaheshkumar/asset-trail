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
    const adminRole = session.user.role;

    const { id } = await context.params;
    const loanId = Number(id);

    if (isNaN(loanId)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        item_id: true,
        member_id: true,
        quantity: true,
        status: true,
        due_date: true,
        item: { select: { quantity_available: true } },
      },
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

    if (adminRole === "BOARD" && existingLoan.member_id === adminId) {
      return NextResponse.json(
        { error: "You cannot approve your own loan request" },
        { status: 403 },
      );
    }

    if (!existingLoan.due_date) {
      return NextResponse.json(
        { error: "Loan request is missing a due date" },
        { status: 400 },
      );
    }

    const approvedAt = new Date();

    const updatedLoan = await prisma.$transaction(async (tx) => {
      // Ensure loan is still REQUESTED (prevents double approval)
      const loanUpdate = await tx.loan.updateMany({
        where: { id: loanId, status: "REQUESTED" },
        data: {
          status: "APPROVED",
          approved_by: adminId,
          approved_at: approvedAt,
          // IMPORTANT: do not override due_date; it is set by requester on creation.
        },
      });

      if (loanUpdate.count !== 1) {
        throw new Error("LOAN_NOT_REQUESTED");
      }

      // Atomic stock decrement (prevents negative inventory)
      const itemUpdate = await tx.item.updateMany({
        where: {
          id: existingLoan.item_id,
          quantity_available: { gte: existingLoan.quantity },
        },
        data: { quantity_available: { decrement: existingLoan.quantity } },
      });

      if (itemUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const loan = await tx.loan.findUnique({
        where: { id: loanId },
      });

      return loan;
    }).catch((err) => {
      if (err instanceof Error && err.message === "LOAN_NOT_REQUESTED") {
        return null;
      }
      if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
        return "INSUFFICIENT_STOCK" as const;
      }
      throw err;
    });

    if (updatedLoan === null) {
      return NextResponse.json(
        { error: "Only REQUESTED loans can be approved" },
        { status: 400 },
      );
    }

    if (updatedLoan === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Insufficient stock to approve this loan" },
        { status: 400 },
      );
    }

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
