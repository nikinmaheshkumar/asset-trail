export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireRole(["MASTER_ADMIN", "BOARD"]);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const loans = await prisma.loan.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        item_id: true,
        member_id: true,
        quantity: true,
        requested_at: true,
        approved_at: true,
        due_date: true,
        purpose: true,
        status: true,
        approved_by: true,
        item: { select: { id: true, name: true, category: true } },
        member: { select: { id: true, name: true, email: true, role: true } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { approved_at: "desc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Error fetching active loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch active loans" },
      { status: 500 },
    );
  }
}
