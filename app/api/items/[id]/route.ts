export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, requireAuth } from "@/lib/auth";
import { ItemStatus } from "@prisma/client";

const ITEM_STATUSES: ItemStatus[] = ["WORKING", "NEEDS_TESTING", "FAULTY", "SCRAP"];
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
    let { name, category, location } = body;
    const status = body.status as unknown;
    const { quantity_total } = body;

    name = name?.trim();
    category = category?.trim();
    location = location?.trim();

    const parsedStatus =
      status === undefined
        ? undefined
        : typeof status === "string" && ITEM_STATUSES.includes(status as ItemStatus)
          ? (status as ItemStatus)
          : null;

    if (parsedStatus === null) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 },
        );
    }

    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
      select: { quantity_available: true, quantity_total: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (quantity_total !== undefined) {
      const newTotal = Number(quantity_total);

      // Ensure available doesn't go negative if totals change
      const borrowed = existingItem.quantity_total - existingItem.quantity_available;
      const newAvailable = newTotal - borrowed;

      if (
        isNaN(newTotal) ||
        newTotal < 0 ||
        newAvailable < 0
      ) {
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
          quantity_available: Number(quantity_total) - (existingItem.quantity_total - existingItem.quantity_available),
        }),
        ...(location && { location }),
        ...(parsedStatus && { status: parsedStatus }),
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

    await prisma.activityLog.create({
      data: {
        action: "item_updated",
        actor_id: auth.session.user.id,
        target_id: itemId,
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
    const auth = await requireRole(["MASTER_ADMIN"]);

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

    const loansCount = await prisma.loan.count({
      where: { item_id: itemId },
    });

    if (loansCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete item with existing loan history" },
        { status: 400 },
      );
    }

    await prisma.item.delete({ where: { id: itemId } });

    await prisma.activityLog.create({
      data: {
        action: "item_deleted",
        actor_id: auth.session.user.id,
        target_id: itemId,
      },
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
