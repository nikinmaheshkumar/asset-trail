"use client";

import { Button } from "@mantine/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useSession } from "next-auth/react";
export default function InventoryPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Manage and track all items"
        rightSection={
          <>
            <RoleGuard role={userRole} allow={["MASTER_ADMIN", "BOARD"]}>
              <Button>Add Item</Button>
            </RoleGuard>
          </>
        }
      />

        <InventoryTable />
    </>
  );
}