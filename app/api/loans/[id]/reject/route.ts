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
      select: { id: true, status: true, member_id: true },
    });

    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (existingLoan.status !== "REQUESTED") {
      return NextResponse.json(
        { error: "Only REQUESTED loans can be rejected" },
        { status: 400 },
      );
    }

    if (adminRole === "BOARD" && existingLoan.member_id === adminId) {
      return NextResponse.json(
        { error: "You cannot reject your own loan request" },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const noteRaw = (body as { note?: unknown }).note;
    const note = typeof noteRaw === "string" ? noteRaw.trim() : "";

    // Required rejection note (keep short and actionable)
    if (note.length < 5 || note.length > 300) {
      return NextResponse.json(
        { error: "Rejection note is required (5-300 characters)" },
        { status: 400 },
      );
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "REJECTED",
        rejected_by: adminId,
        rejected_at: new Date(),
        rejection_note: note,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "loan_rejected",
        actor_id: adminId,
        target_id: loanId,
      },
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error rejecting loan:", error);
    return NextResponse.json(
      { error: "Failed to reject loan" },
      { status: 500 },
    );
  }
}
