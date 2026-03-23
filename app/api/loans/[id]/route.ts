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
        requested_at: true,
        approved_at: true,
        closed_at: true,
        due_date: true,
        purpose: true,
        status: true,
        approved_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const role = auth.session.user.role as string;
    const isAdmin = role === "MASTER_ADMIN" || role === "BOARD";
    if (!isAdmin && loan.member_id !== auth.session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
