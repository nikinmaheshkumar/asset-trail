import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: "Unauthorized",
      status: 401,
    };
  }

  return { session };
}

export async function requireRole(roles: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: "Unauthorized",
      status: 401,
    };
  }

  if (!roles.includes(session.user.role as string)) {
    return {
      error: "Forbidden",
      status: 403,
    };
  }

  return { session };
}