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

type Props = {
  items: Item[];
  borrowingId: number | null;
  onBorrow: (id: number) => void;
};

export function MobileInventoryCards({ items, borrowingId, onBorrow }: Props) {
  return (
    <Stack gap="md">
      {items.map((item, index) => {
        const unavailable =
          item.quantity_available === 0 || item.status !== "WORKING";

        const lowStock =
          item.quantity_available > 0 &&
          item.quantity_available <= item.quantity_total * 0.2;

        return (
          <Card key={item.id} radius="xl" shadow="xs" withBorder p="lg">
            {/* Header */}
            <Group justify="space-between" align="flex-start" mb="xs">
              <Box>
                <Text size="sm" c="dimmed">
                  #{index + 1}
                </Text>
                <Text fw={600} size="lg">
                  {item.name}
                </Text>
              </Box>

              <Badge
                size="md"
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

            {/* Details */}
            <Stack gap={6}>
              <Text size="sm" c="dimmed">
                Category
              </Text>
              <Text fw={500}>{item.category}</Text>

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
            </Stack>

            {/* Action */}
            <Tooltip
              label={unavailable ? "Item unavailable" : ""}
              disabled={!unavailable}
            >
              <Button
                mt="lg"
                fullWidth
                radius="md"
                size="sm"
                variant="filled"
                color="dark"
                loading={borrowingId === item.id}
                disabled={unavailable}
                onClick={() => onBorrow(item.id)}
              >
                Borrow
              </Button>
            </Tooltip>
          </Card>
        );
      })}
    </Stack>
  );
}
