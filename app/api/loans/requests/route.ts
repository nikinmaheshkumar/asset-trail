export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await requireRole(["MASTER_ADMIN", "BOARD"]);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const loans = await prisma.loan.findMany({
      where: { status: "REQUESTED" },
      select: {
        id: true,
        item_id: true,
        member_id: true,
        requested_at: true,
        purpose: true,
        status: true,
        item: { select: { id: true, name: true, category: true, quantity_available: true } },
        member: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { requested_at: "asc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Error fetching loan requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch loan requests" },
      { status: 500 },
    );
  }
}
