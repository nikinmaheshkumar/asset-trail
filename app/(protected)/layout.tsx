import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AppShellLayout } from "@/components/layout/AppShellLayout";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  if (session.user.mustChangePwd) {
    redirect("/change-password");
  }
  return <AppShellLayout>{children}</AppShellLayout>;
}
