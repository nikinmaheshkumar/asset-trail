export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const memberId = session.user.id;

    const loans = await prisma.loan.findMany({
      where: { member_id: memberId },
      select: {
        id: true,
        item_id: true,
        member_id: true,
        requested_at: true,
        approved_at: true,
        closed_at: true,
        due_date: true,
        cancelled_at: true,
        rejected_at: true,
        rejection_note: true,
        purpose: true,
        status: true,
        approved_by: true,
        item: { select: { id: true, name: true, category: true } },
      },
      orderBy: { requested_at: "desc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Error fetching my loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 },
    );
  }
}
