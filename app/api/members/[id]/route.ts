export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET(
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
    const memberId = Number(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);

  } catch (error) {
    console.error("Error fetching member:", error);

    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
    const memberId = Number(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, role } = body;

    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
      select: { role: true },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // prevent removing last MASTER_ADMIN
    if (
      existingMember.role === "MASTER_ADMIN" &&
      role &&
      role !== "MASTER_ADMIN"
    ) {
      const masterCount = await prisma.member.count({
        where: { role: "MASTER_ADMIN" },
      });

      if (masterCount <= 1) {
        return NextResponse.json(
          { error: "At least one MASTER_ADMIN must exist" },
          { status: 400 },
        );
      }
    }

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedMember);

  } catch (error) {
    console.error("Error updating member:", error);

    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 },
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
    const memberId = Number(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { role: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.role === "MASTER_ADMIN") {
      const masterCount = await prisma.member.count({
        where: { role: "MASTER_ADMIN" },
      });

      if (masterCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last MASTER_ADMIN" },
          { status: 400 },
        );
      }
    }

    await prisma.member.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ message: "Member deleted successfully" });

  } catch (error) {
    console.error("Error deleting member:", error);

    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 },
    );
  }
}