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
    const role = session.user.role as string;
    const memberId = session.user.id;

    const isAdmin = role === "MASTER_ADMIN" || role === "BOARD";

    if (isAdmin) {
      // Admin dashboard: system stats + top 5 previews
      const [totalItems, activeLoansCount, pendingRequestsCount] =
        await prisma.$transaction([
          prisma.item.count(),
          prisma.loan.count({ where: { status: "APPROVED" } }),
          prisma.loan.count({ where: { status: "REQUESTED" } }),
        ]);

      // Compute low stock in JS since Prisma doesn't support column comparison directly
      const allItems = await prisma.item.findMany({
        select: {
          id: true,
          name: true,
          quantity_available: true,
          quantity_total: true,
          location: true,
        },
      });
      const lowStockItems = allItems
        .filter(
          (i) =>
            i.quantity_total > 0 &&
            i.quantity_available <= i.quantity_total * 0.2,
        )
        .slice(0, 5);

      const pendingRequests = await prisma.loan.findMany({
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
      });

      const activeLoans = await prisma.loan.findMany({
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
      });

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
      // User dashboard: personal loan data + low stock (view only)
      const myLoans = await prisma.loan.findMany({
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
      });

      const myActiveLoans = myLoans.filter((l) => l.status === "APPROVED");
      const myPendingRequests = myLoans.filter(
        (l) => l.status === "REQUESTED",
      );
      const now = new Date();
      const overdueLoans = myActiveLoans.filter(
        (l) => l.due_date && new Date(l.due_date) < now,
      );

      const allItems = await prisma.item.findMany({
        select: {
          id: true,
          name: true,
          quantity_available: true,
          quantity_total: true,
          location: true,
        },
      });
      const lowStockItems = allItems
        .filter(
          (i) =>
            i.quantity_total > 0 &&
            i.quantity_available <= i.quantity_total * 0.2,
        )
        .slice(0, 5);

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
