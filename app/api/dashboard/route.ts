export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

type LowStockItem = { id: number; name: string; quantity_available: number; quantity_total: number; location: string };

type MyLoan = {
  id: number;
  requested_at: Date;
  approved_at: Date | null;
  due_date: Date | null;
  status: string;
  item: { id: number; name: string; category: string };
};

/** Returns up to 5 items where quantity_available ≤ 20% of quantity_total, ordered by scarcity. */
function getLowStockItems(): Promise<LowStockItem[]> {
  // Uses raw SQL for a server-side column comparison (Prisma ORM doesn't support comparing two columns directly).
  // All values are hardcoded — no user input is interpolated — so there is no SQL injection risk.
  return prisma.$queryRaw<LowStockItem[]>`
    SELECT id, name, quantity_available, quantity_total, location
    FROM "Item"
    WHERE quantity_total > 0 AND quantity_available <= quantity_total * 0.2
    ORDER BY (quantity_available::float / quantity_total) ASC
    LIMIT 5`;
}

export async function GET() {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const role = session.user.role as string;
    const memberId = session.user.id;

    const isAdmin = role === "MASTER_ADMIN" || role === "BOARD";

    if (isAdmin) {
      // Admin dashboard: all queries run in parallel for speed
      const [totalItems, activeLoansCount, pendingRequestsCount, lowStockItems, pendingRequests, activeLoans] =
        await Promise.all([
          prisma.item.count(),
          prisma.loan.count({ where: { status: "APPROVED" } }),
          prisma.loan.count({ where: { status: "REQUESTED" } }),
          getLowStockItems(),
          prisma.loan.findMany({
            where: { status: "REQUESTED" },
            select: {
              id: true,
              requested_at: true,
              due_date: true,
              purpose: true,
              item: { select: { id: true, name: true, category: true } },
              member: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { requested_at: "asc" },
            take: 5,
          }),
          prisma.loan.findMany({
            where: { status: "APPROVED" },
            select: {
              id: true,
              approved_at: true,
              due_date: true,
              approved_by: true,
              item: { select: { id: true, name: true, category: true } },
              member: { select: { id: true, name: true, email: true, role: true } },
              approver: { select: { id: true, name: true } },
            },
            orderBy: { approved_at: "desc" },
            take: 5,
          }),
        ]);

      return NextResponse.json({
        type: "admin",
        stats: {
          totalItems,
          activeLoans: activeLoansCount,
          pendingRequests: pendingRequestsCount,
          lowStockItems: lowStockItems.length,
        },
        pendingRequests,
        activeLoans,
        lowStockItems,
      });
    } else {
      // User dashboard: personal loan data + low stock — run in parallel
      const [myLoans, lowStockItems] = await Promise.all([
        prisma.loan.findMany({
          where: { member_id: memberId },
          select: {
            id: true,
            requested_at: true,
            approved_at: true,
            due_date: true,
            status: true,
            item: { select: { id: true, name: true, category: true } },
          },
          orderBy: { requested_at: "desc" },
        }),
        getLowStockItems(),
      ]);

      const typedLoans = myLoans as MyLoan[];
      const myActiveLoans = typedLoans.filter((l) => l.status === "APPROVED");
      const myPendingRequests = typedLoans.filter((l) => l.status === "REQUESTED");
      const now = new Date();
      const overdueLoans = myActiveLoans.filter(
        (l) => l.due_date && new Date(l.due_date) < now,
      );

      return NextResponse.json({
        type: "user",
        myActiveLoans,
        myPendingRequests,
        overdueLoans,
        lowStockItems,
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
