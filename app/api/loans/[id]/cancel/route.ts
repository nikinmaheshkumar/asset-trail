export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { LoanStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const memberId = session.user.id;

    const { id } = await context.params;
    const loanId = Number(id);

    if (isNaN(loanId)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: { id: true, status: true, member_id: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.member_id !== memberId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (loan.status !== "REQUESTED") {
      return NextResponse.json(
        { error: "Only REQUESTED loans can be cancelled" },
        { status: 400 },
      );
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.CANCELLED,
        cancelled_at: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "loan_cancelled",
        actor_id: memberId,
        target_id: loanId,
      },
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error cancelling loan:", error);
    return NextResponse.json(
      { error: "Failed to cancel loan" },
      { status: 500 },
    );
  }
}
