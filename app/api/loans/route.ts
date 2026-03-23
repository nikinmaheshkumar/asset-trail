export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

import type { Prisma } from "@prisma/client";

const MAX_LIMIT = 100;

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) return fallback;
  return n;
}

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

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 25), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const session = auth.session;
    const userId = session.user.id;
    const role = session.user.role as string;
    const isAdmin = role === "MASTER_ADMIN" || role === "BOARD";

    let memberIdFilter: number | null = null;
    if (memberIdParam) {
      const targetId = Number(memberIdParam);
      if (!Number.isFinite(targetId) || Number.isNaN(targetId)) {
        return NextResponse.json({ error: "Invalid member_id" }, { status: 400 });
      }
      if (!isAdmin && targetId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      memberIdFilter = targetId;
    }

    const where: Prisma.LoanWhereInput | undefined = isAdmin
      ? (memberIdFilter != null ? { member_id: memberIdFilter } : undefined)
      : { member_id: userId };

    const [total, loans] = await Promise.all([
      prisma.loan.count({ where }),
      prisma.loan.findMany({
        where,
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
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: loans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });

  } catch (error) {
    console.error("Error fetching loans:", error);

    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 },
    );
  }
}
