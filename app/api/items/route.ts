export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    // Require user to be logged in
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const items = await prisma.item.findMany({
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
    });

    return NextResponse.json(items);

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
    let { name, category, quantity_total, location } = body;

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