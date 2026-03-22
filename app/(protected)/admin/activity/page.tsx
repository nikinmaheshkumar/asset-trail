"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityTable } from "@/components/loans/ActivityTable";
import { IconHistory } from "@tabler/icons-react";

export default function AdminActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const role = session?.user?.role;
    if (role !== "MASTER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <>
      <PageHeader
        title="Activity Log"
        subtitle="Track all system actions and audit trail"
        icon={<IconHistory size={20} />}
      />
      <ActivityTable />
    </>
  );
}
