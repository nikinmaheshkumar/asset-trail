"use client";

import { Button } from "@mantine/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useSession } from "next-auth/react";

export default function LoansPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    return (
        <PageHeader
                title="Loans"
                subtitle="Manage and track all loan transactions"
                rightSection={
                  <>
                    <RoleGuard role={userRole} allow={["MASTER_ADMIN", "BOARD"]}>
                      <Button>Approve Loan</Button>
                    </RoleGuard>
                  </>
                }
              />
    );
}