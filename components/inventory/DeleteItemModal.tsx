"use client";

import { Modal, Button, Stack, Text, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Item } from "./InventoryTable";
import { useState } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  item: Item | null;
  onDeleted: () => void;
};

export function DeleteItemModal({ opened, onClose, item, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/items/${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      notifications.show({
        color: "green",
        title: "Item Deleted",
        message: `${item.name} removed from inventory`,
      });

      onDeleted();
      onClose();
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to delete item",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Item">
      <Stack>
        <Text>
          Are you sure you want to delete{" "}
          <b>{item?.name}</b> from inventory?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>

          <Button color="red" loading={loading} onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}