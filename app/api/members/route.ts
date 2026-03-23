export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

const ROLES: Role[] = ["MASTER_ADMIN", "BOARD", "SENIOR_CORE", "JUNIOR_CORE"];

export async function GET() {
  try {
    const auth = await requireRole(["MASTER_ADMIN"]);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(members);

  } catch (error) {
    console.error("Error fetching members:", error);

    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["MASTER_ADMIN"]);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();

    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 },
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (role != null && (typeof role !== "string" || !ROLES.includes(role as Role))) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password_hash: hashedPassword,
        role: role ?? "JUNIOR_CORE",
        mustChangePwd: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "member_created",
        actor_id: auth.session.user.id,
        target_id: member.id,
      },
    });

    return NextResponse.json(member, { status: 201 });

  } catch (error) {
    console.error("Error creating member:", error);

    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
