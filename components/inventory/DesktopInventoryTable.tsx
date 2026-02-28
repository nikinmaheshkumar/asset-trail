"use client";

import {
  Table,
  Badge,
  Button,
  Tooltip,
  Group,
  ScrollArea,
  Text,
} from "@mantine/core";
import {
  IconHash,
  IconBox,
  IconCategory,
  IconStack2,
  IconInfoCircle,
  IconBolt,
} from "@tabler/icons-react";
import { Item } from "./InventoryTable";

type Props = {
  items: Item[];
  borrowingId: number | null;
  onBorrow: (id: number) => void;
};

export function DesktopInventoryTable({ items, borrowingId, onBorrow }: Props) {
  return (
    <ScrollArea>
      <Table
        verticalSpacing="lg"
        horizontalSpacing="xl"
        highlightOnHover
        stickyHeader
      >
        {/* ===== HEADER ===== */}
        <Table.Thead style={{ background: "#f8f9fa" }}>
          <Table.Tr>
            <Table.Th>
              <Group gap={6}>
                <IconHash size={18} />
                <Text fw={800} size="md"></Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconBox size={18} />
                <Text fw={800} size="md">
                  Item
                </Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconCategory size={18} />
                <Text fw={800} size="md">
                  Category
                </Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconStack2 size={18} />
                <Text fw={800} size="md">
                  Availability
                </Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconInfoCircle size={18} />
                <Text fw={800} size="md">
                  Status
                </Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconBolt size={18} />
                <Text fw={800} size="md">
                  Action
                </Text>
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        {/* ===== BODY ===== */}
        <Table.Tbody>
          {items.map((item, index) => {
            const unavailable =
              item.quantity_available === 0 || item.status !== "WORKING";

            const lowStock =
              item.quantity_available > 0 &&
              item.quantity_available <= item.quantity_total * 0.2;

            return (
              <Table.Tr key={item.id}>
                {/* Index */}
                <Table.Td>
                  <Text size="md" fw={600}>
                    {index + 1}
                  </Text>
                </Table.Td>

                {/* Item */}
                <Table.Td>
                  <Text fw={700} size="lg">
                    {item.name}
                  </Text>
                </Table.Td>

                {/* Category */}
                <Table.Td>
                  <Text size="md">{item.category}</Text>
                </Table.Td>

                {/* Availability */}
                <Table.Td>
                  <Group gap={8}>
                    <Text
                      fw={800}
                      size="lg"
                      c={
                        lowStock
                          ? "red"
                          : item.quantity_available === 0
                            ? "gray"
                            : undefined
                      }
                    >
                      {item.quantity_available}
                    </Text>

                    <Text size="md" c="dimmed">
                      / {item.quantity_total}
                    </Text>

                    {lowStock && (
                      <Badge size="sm" color="red" variant="light" radius="xl">
                        Low
                      </Badge>
                    )}
                  </Group>
                </Table.Td>

                {/* Status */}
                <Table.Td>
                  <Badge
                    size="md"
                    radius="md"
                    variant="filled"
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
                </Table.Td>

                {/* Action */}
                <Table.Td>
                  <Tooltip
                    label={unavailable ? "Item unavailable" : ""}
                    disabled={!unavailable}
                  >
                    <Button
                      size="sm"
                      loading={borrowingId === item.id}
                      disabled={unavailable}
                      onClick={() => onBorrow(item.id)}
                    >
                      Borrow
                    </Button>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
