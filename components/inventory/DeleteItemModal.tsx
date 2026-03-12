"use client";

import {
  Modal,
  Button,
  Stack,
  Text,
  Group,
  Alert,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Item } from "./InventoryTable";
import { useState } from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";

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
    <Modal opened={opened} onClose={onClose} title="Delete Item" centered>
      <Stack>

        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          variant="light"
        >
          This action cannot be undone.
        </Alert>

        {item && (
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              Item
            </Text>

            <Text fw={600}>{item.name}</Text>

            <Badge variant="light" w="fit-content">
              {item.category}
            </Badge>
          </Stack>
        )}

        <Text>
          Are you sure you want to permanently delete this item from inventory?
        </Text>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>

          <Button
            color="red"
            loading={loading}
            leftSection={<IconTrash size={16} />}
            disabled={!item}
            onClick={handleDelete}
          >
            Delete Item
          </Button>
        </Group>

      </Stack>
    </Modal>
  );
}