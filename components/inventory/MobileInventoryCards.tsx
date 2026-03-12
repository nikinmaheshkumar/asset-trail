"use client";

import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Tooltip,
  Divider,
  Box,
} from "@mantine/core";
import { Item } from "./InventoryTable";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useSession } from "next-auth/react";
import { IconEdit, IconTrash } from "@tabler/icons-react";

type Props = {
  items: Item[];
  borrowingId: number | null;
  onBorrow: (id: number) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function MobileInventoryCards({
  items,
  borrowingId,
  onBorrow,
  onEdit,
  onDelete,
}: Props) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <Stack gap="md">
      {items.map((item, index) => {
        const unavailable =
          item.quantity_available === 0 || item.status !== "WORKING";

        const lowStock =
          item.quantity_available > 0 &&
          item.quantity_available <= item.quantity_total * 0.2;

        const borrowed =
          item.quantity_total - item.quantity_available;

        return (
          <Card key={item.id} radius="xl" shadow="xs" withBorder p="lg">
            {/* Header */}
            <Group justify="space-between">
              <Box>
                <Text size="sm" c="dimmed">
                  #{index + 1}
                </Text>
                <Text fw={600}>{item.name}</Text>
              </Box>

              <Badge
                variant="light"
                color={
                  item.status === "WORKING"
                    ? "green"
                    : item.status === "NEEDS_TESTING"
                    ? "yellow"
                    : item.status === "FAULTY"
                    ? "red"
                    : "gray"
                }
              >
                {item.status}
              </Badge>
            </Group>

            <Divider my="sm" />

            {/* Category */}
            <Text size="sm" c="dimmed">
              Category
            </Text>

            <Badge variant="light" mt={4}>
              {item.category}
            </Badge>

            {/* Availability */}
            <Text size="sm" c="dimmed" mt="xs">
              Availability
            </Text>

            <Group justify="space-between">
              <Text fw={600}>
                {item.quantity_available}/{item.quantity_total}
              </Text>

              {lowStock && (
                <Badge color="red" size="sm" variant="light">
                  Low stock
                </Badge>
              )}
            </Group>

            {/* Borrow */}
            <Tooltip
              label={
                unavailable
                  ? item.quantity_available === 0
                    ? "Out of stock"
                    : "Item not available"
                  : ""
              }
              disabled={!unavailable}
            >
              <Button
                mt="lg"
                fullWidth
                size="sm"
                loading={borrowingId === item.id}
                disabled={unavailable}
                onClick={() => onBorrow(item.id)}
              >
                {item.quantity_available === 0
                  ? "Out of Stock"
                  : "Borrow"}
              </Button>
            </Tooltip>

            {/* Actions */}
            <RoleGuard role={role} allow={["MASTER_ADMIN", "BOARD"]}>
              <Group mt="sm" grow>
                <Button
                  size="sm"
                  fw={700}
                  variant="light"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => onEdit(item)}
                >
                  Edit
                </Button>

                <Tooltip
                  label={
                    borrowed > 0
                      ? "Item has active loans"
                      : ""
                  }
                  disabled={borrowed === 0}
                >
                  <Button
                    size="sm"
                    fw={700}
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={16} />}
                    disabled={borrowed > 0}
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </Group>
            </RoleGuard>
          </Card>
        );
      })}
    </Stack>
  );
}