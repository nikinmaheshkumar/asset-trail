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

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Number(searchParams.get("per_page") ?? "20");
    const skip = (page - 1) * perPage;

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take: perPage,
      }),
      prisma.activityLog.count(),
    ]);

    // Enrich with actor/target names by fetching members
    const actorIds = [...new Set(logs.map((l) => l.actor_id))];
    const members = await prisma.member.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    });
    const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

    const enriched = logs.map((log) => ({
      ...log,
      actor: memberMap[log.actor_id] ?? null,
    }));

    return NextResponse.json({ logs: enriched, total, page, perPage });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}
