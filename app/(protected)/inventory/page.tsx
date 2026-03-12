"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { InventoryTable, Item } from "@/components/inventory/InventoryTable";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { EditItemModal } from "@/components/inventory/EditItemModal";
import { DeleteItemModal } from "@/components/inventory/DeleteItemModal";
import { useSession } from "next-auth/react";

export default function InventoryPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const refreshInventory = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Manage and track all items"
        rightSection={
          <RoleGuard role={userRole} allow={["MASTER_ADMIN", "BOARD"]}>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Item
            </Button>
          </RoleGuard>
        }
      />

      <InventoryTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddItemModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={refreshInventory}
      />

      <EditItemModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={selectedItem}
        onUpdated={refreshInventory}
      />

      <DeleteItemModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        item={selectedItem}
        onDeleted={refreshInventory}
      />
    </>
  );
}