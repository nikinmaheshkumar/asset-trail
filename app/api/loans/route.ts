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
      orderBy: { requested_at: "desc" },
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