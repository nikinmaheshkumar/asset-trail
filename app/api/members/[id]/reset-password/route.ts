export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
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
      return NextResponse.json(
        { error: "Invalid member ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.member.update({
      where: { id: memberId },
      data: {
        password_hash: hashedPassword,
        mustChangePwd: true,
      },
    });

    return NextResponse.json({
      message: "Password reset successfully"
    });

  } catch (error) {

    console.error("Reset password error:", error);

    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}