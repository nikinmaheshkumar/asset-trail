export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await requireRole(["MASTER_ADMIN"]);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Number(searchParams.get("per_page") ?? "20");
    const search = searchParams.get("search") ?? "";
    const actionFilter = searchParams.get("action") ?? "";
    const skip = (page - 1) * perPage;

    // For search on actor name/email we need to join — fetch matching member IDs first
    let actorIdFilter: number[] | undefined;
    if (search) {
      const matchingMembers = await prisma.member.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      actorIdFilter = matchingMembers.map((m: { id: number }) => m.id);
    }

    const whereClause = {
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(actorIdFilter !== undefined ? { actor_id: { in: actorIdFilter } } : {}),
    };

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: perPage,
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    // Enrich with actor names
    const actorIds = [...new Set(logs.map((l: { actor_id: number }) => l.actor_id))];
    const members = await prisma.member.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    });
    const memberMap = Object.fromEntries(members.map((m: { id: number; name: string; email: string }) => [m.id, m]));

    const enriched = logs.map((log: { actor_id: number; [key: string]: unknown }) => ({
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
