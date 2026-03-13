export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [
      totalItems,
      activeLoans,
      pendingRequests,
      lowStockItems,
    ] = await prisma.$transaction([
      prisma.item.count(),
      prisma.loan.count({ where: { status: "APPROVED" } }),
      prisma.loan.count({ where: { status: "REQUESTED" } }),
      prisma.item.count({ where: { quantity_available: { lte: 2 } } }),
    ]);

    // Most borrowed assets (top 5)
    const mostBorrowed = await prisma.loan.groupBy({
      by: ["item_id"],
      _count: { item_id: true },
      orderBy: { _count: { item_id: "desc" } },
      take: 5,
    });

    const mostBorrowedItemIds = mostBorrowed.map((m) => m.item_id);
    const mostBorrowedItems = await prisma.item.findMany({
      where: { id: { in: mostBorrowedItemIds } },
      select: { id: true, name: true, category: true },
    });
    const itemMap = Object.fromEntries(
      mostBorrowedItems.map((i) => [i.id, i]),
    );
    const mostBorrowedResult = mostBorrowed.map((m) => ({
      item: itemMap[m.item_id] ?? { id: m.item_id, name: "Unknown", category: "" },
      count: m._count.item_id,
    }));

    // Monthly loan activity (last 6 months, inclusive of current month)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentLoans = await prisma.loan.findMany({
      where: { requested_at: { gte: sixMonthsAgo } },
      select: { requested_at: true },
    });

    const monthlyMap: Record<string, number> = {};
    for (const loan of recentLoans) {
      const key = loan.requested_at.toISOString().slice(0, 7); // "YYYY-MM"
      monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
    }
    const monthlyActivity = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    // User borrow statistics (top 10)
    const userStats = await prisma.loan.groupBy({
      by: ["member_id"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const userIds = userStats.map((u) => u.member_id);
    const members = await prisma.member.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

    const activeUserLoans = await prisma.loan.groupBy({
      by: ["member_id"],
      where: { status: "APPROVED", member_id: { in: userIds } },
      _count: { id: true },
    });
    const activeMap = Object.fromEntries(
      activeUserLoans.map((u) => [u.member_id, u._count.id]),
    );

    const userBorrowStats = userStats.map((u) => ({
      member: memberMap[u.member_id] ?? { id: u.member_id, name: "Unknown", email: "", role: null },
      totalLoans: u._count.id,
      activeLoans: activeMap[u.member_id] ?? 0,
    }));

    return NextResponse.json({
      totalItems,
      activeLoans,
      pendingRequests,
      lowStockItems,
      mostBorrowed: mostBorrowedResult,
      monthlyActivity,
      userBorrowStats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
