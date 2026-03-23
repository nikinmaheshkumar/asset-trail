export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

const ROLES: Role[] = ["MASTER_ADMIN", "BOARD", "SENIOR_CORE", "JUNIOR_CORE"];

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
    let { name, email } = body;
    const role = body.role as unknown;

    name = name?.trim();
    email = email?.trim()?.toLowerCase();

    if (name != null && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const parsedRole =
      role === undefined
        ? undefined
        : typeof role === "string" && ROLES.includes(role as Role)
          ? (role as Role)
          : null;

    if (parsedRole === null) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (email != null) {
      if (typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }

      const emailOwner = await prisma.member.findFirst({
        where: {
          email,
          id: { not: memberId },
        },
        select: { id: true },
      });

      if (emailOwner) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 },
        );
      }
    }

    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
      select: { role: true },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // prevent removing last MASTER_ADMIN
    if (existingMember.role === "MASTER_ADMIN" && parsedRole && parsedRole !== "MASTER_ADMIN") {
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
        ...(parsedRole && { role: parsedRole }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "member_updated",
        actor_id: auth.session.user.id,
        target_id: memberId,
      },
    });

    if (parsedRole && parsedRole !== existingMember.role) {
      await prisma.activityLog.create({
        data: {
          action: "role_changed",
          actor_id: auth.session.user.id,
          target_id: memberId,
        },
      });
    }

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

    if (memberId === auth.session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
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

    const activeLoansCount = await prisma.loan.count({
      where: {
        member_id: memberId,
        status: { in: ["REQUESTED", "APPROVED"] },
      },
    });

    if (activeLoansCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete member with active loans" },
        { status: 400 },
      );
    }

    await prisma.member.delete({
      where: { id: memberId },
    });

    await prisma.activityLog.create({
      data: {
        action: "member_deleted",
        actor_id: auth.session.user.id,
        target_id: memberId,
      },
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
