"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminRequestsTable } from "@/components/loans/AdminRequestsTable";

export default function AdminRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const role = session?.user?.role;
    if (role !== "MASTER_ADMIN" && role !== "BOARD") {
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
        title="Loan Requests"
        subtitle="Review and action pending asset loan requests"
      />
      <AdminRequestsTable />
    </>
  );
}
