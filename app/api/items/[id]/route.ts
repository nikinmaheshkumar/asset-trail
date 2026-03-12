export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, requireAuth } from "@/lib/auth";
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    const { id } = await context.params;
    const itemId = Number(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
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

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["MASTER_ADMIN", "BOARD"]);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await context.params;
    const itemId = Number(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, category, quantity_total, location, status } = body;

    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
      select: { quantity_available: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (quantity_total !== undefined) {
      const newTotal = Number(quantity_total);

      if (isNaN(newTotal) || newTotal < existingItem.quantity_available) {
        return NextResponse.json(
          { error: "Invalid quantity_total" },
          { status: 400 }
        );
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(quantity_total !== undefined && {
          quantity_total: Number(quantity_total),
        }),
        ...(location && { location }),
        ...(status && { status }),
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(["MASTER_ADMIN", "BOARD"]);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await context.params;
    const itemId = Number(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
