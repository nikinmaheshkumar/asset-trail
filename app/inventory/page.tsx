import { Button } from "@mantine/core";
import { PageHeader } from "@/components/layout/PageHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Manage and track all items"
        rightSection={
          <>
            <Button>Add Item</Button>
          </>
        }
      />

        <InventoryTable />
    </>
  );
}