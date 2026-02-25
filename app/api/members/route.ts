export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/members
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: false,
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

// POST /api/members
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        name,
        email,
        password_hash: password, 
        role: role ?? "MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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