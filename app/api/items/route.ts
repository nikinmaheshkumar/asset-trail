export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ItemStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireRole, requireAuth } from "@/lib/auth";

const MAX_LIMIT = 100;

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) return fallback;
  return n;
}

export async function GET(req: Request) {
  try {
    // Require user to be logged in
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 25), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const where: Prisma.ItemWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category;
    if (status) {
      const allowed: ItemStatus[] = ["WORKING", "NEEDS_TESTING", "FAULTY", "SCRAP"];

      const parsedStatus = allowed.includes(status as ItemStatus)
        ? (status as ItemStatus)
        : null;

      if (!parsedStatus) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 },
        );
      }

      where.status = parsedStatus;
    }

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          quantity_total: true,
          quantity_available: true,
          location: true,
          status: true,
          created_at: true,
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });

  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // RBAC check
    const auth = await requireRole(["MASTER_ADMIN", "BOARD"]);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { quantity_total } = body;
    let { name, category, location } = body;

    // Normalize inputs
    name = name?.trim();
    category = category?.trim();
    location = location?.trim();

    if (!name || !category || quantity_total == null || !location) {
      return NextResponse.json(
        { error: "Name, category, quantity_total, and location are required" },
        { status: 400 }
      );
    }

    const total = Number(quantity_total);

    if (isNaN(total) || total < 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    // 🔒 Duplicate protection
    const existingItem = await prisma.item.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        location: {
          equals: location,
          mode: "insensitive",
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "An item with this name already exists at this location" },
        { status: 409 }
      );
    }

    const item = await prisma.item.create({
      data: {
        name,
        category,
        quantity_total: total,
        quantity_available: total,
        location,
        status: "WORKING",
      },
      select: {
        id: true,
        name: true,
        category: true,
        quantity_total: true,
        quantity_available: true,
        location: true,
        status: true,
      },
    });

    return NextResponse.json(item, { status: 201 });

  } catch (error) {
    console.error("Error creating item:", error);

    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
