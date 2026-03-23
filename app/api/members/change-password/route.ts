export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuth();

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 },
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const email = auth.session.user.email;

    if (!email) {
      return NextResponse.json(
        { error: "Invalid session user" },
        { status: 400 },
      );
    }

    await prisma.member.update({
      where: { email: email },
      data: {
        password_hash: hashedPassword,
        mustChangePwd: false,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "password_changed",
        actor_id: auth.session.user.id,
        target_id: auth.session.user.id,
      },
    });

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);

    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
