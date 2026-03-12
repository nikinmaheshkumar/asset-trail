"use client";
type Role =
  | "MASTER_ADMIN"
  | "BOARD"
  | "SENIOR_CORE"
  | "JUNIOR_CORE";

interface RoleGuardProps {
  role?: Role;
  allow: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ role, allow, children }: RoleGuardProps) {
  if (!role || !allow.includes(role)) {
    return null;
  }

  return <>{children}</>;
}