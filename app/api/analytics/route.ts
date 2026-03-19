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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Run all independent queries in parallel
    const [
      totalItems,
      activeLoans,
      pendingRequests,
      lowStockItems,
      mostBorrowed,
      recentLoans,
      userStats,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.loan.count({ where: { status: "APPROVED" } }),
      prisma.loan.count({ where: { status: "REQUESTED" } }),
      prisma.item.count({ where: { quantity_available: { lte: 2 } } }),
      prisma.loan.groupBy({
        by: ["item_id"],
        _count: { item_id: true },
        orderBy: { _count: { item_id: "desc" } },
        take: 5,
      }),
      prisma.loan.findMany({
        where: { requested_at: { gte: sixMonthsAgo } },
        select: { requested_at: true },
      }),
      prisma.loan.groupBy({
        by: ["member_id"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    const mostBorrowedItemIds = mostBorrowed.map((m: { item_id: number }) => m.item_id);
    const userIds = userStats.map((u: { member_id: number }) => u.member_id);

    // Resolve item names, member names, and active-loan counts in parallel
    const [mostBorrowedItems, members, activeUserLoans] = await Promise.all([
      prisma.item.findMany({
        where: { id: { in: mostBorrowedItemIds } },
        select: { id: true, name: true, category: true },
      }),
      prisma.member.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.loan.groupBy({
        by: ["member_id"],
        where: { status: "APPROVED", member_id: { in: userIds } },
        _count: { id: true },
      }),
    ]);

    const itemMap = Object.fromEntries(
      mostBorrowedItems.map((i: { id: number; name: string; category: string }) => [i.id, i]),
    );
    const mostBorrowedResult = mostBorrowed.map((m: { item_id: number; _count: { item_id: number } }) => ({
      item: itemMap[m.item_id] ?? { id: m.item_id, name: "Unknown", category: "" },
      count: m._count.item_id,
    }));

    // Monthly activity
    const monthlyMap: Record<string, number> = {};
    for (const loan of recentLoans) {
      const key = loan.requested_at.toISOString().slice(0, 7); // "YYYY-MM"
      monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
    }
    const monthlyActivity = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const memberMap = Object.fromEntries(members.map((m: { id: number; name: string; email: string; role: string | null }) => [m.id, m]));
    const activeMap = Object.fromEntries(
      activeUserLoans.map((u: { member_id: number; _count: { id: number } }) => [u.member_id, u._count.id]),
    );
    const userBorrowStats = userStats.map((u: { member_id: number; _count: { id: number } }) => ({
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
