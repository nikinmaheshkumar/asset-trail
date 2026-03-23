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
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { Item } from "./InventoryTable";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useSession } from "next-auth/react";
import { itemStatusColor, itemStatusLabel } from "@/lib/status";
import { PRIMARY_CTA_COLOR, SECONDARY_ACTION_COLOR } from "@/lib/ui";

type Props = {
  items: Item[];
  offset?: number;
  onBorrow: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function DesktopInventoryTable({
  items,
  offset = 0,
  onBorrow,
  onEdit,
  onDelete,
}: Props) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="table-shell">
      <ScrollArea>
        <Table
          verticalSpacing="lg"
          horizontalSpacing="xl"
          highlightOnHover
          stickyHeader
        >
        <Table.Thead style={{ background: "var(--app-table-head)" }}>
          <Table.Tr>
            <Table.Th>
              <Group gap={6}>
                <IconHash size={18} />
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconBox size={18} />
                <Text fw={800}>Item</Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconCategory size={18} />
                <Text fw={800}>Category</Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconStack2 size={18} />
                <Text fw={800}>Availability</Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconInfoCircle size={18} />
                <Text fw={800}>Status</Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconBolt size={18} />
                <Text fw={800}>Borrow</Text>
              </Group>
            </Table.Th>

            <RoleGuard role={role} allow={["MASTER_ADMIN", "BOARD"]}>
              <Table.Th>
                <Text fw={800}>Actions</Text>
              </Table.Th>
            </RoleGuard>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.map((item, index) => {
            const unavailable =
              item.quantity_available === 0 || item.status !== "WORKING";

            const lowStock =
              item.quantity_available > 0 &&
              item.quantity_available <= item.quantity_total * 0.2;

            const borrowed =
              item.quantity_total - item.quantity_available;

            return (
              <Table.Tr key={item.id}>
                {/* Index */}
                <Table.Td>
                  <Text fw={600}>{offset + index + 1}</Text>
                </Table.Td>

                {/* Item */}
                <Table.Td>
                  <Text fw={700}>{item.name}</Text>
                </Table.Td>

                {/* Category */}
                <Table.Td>
                  <Badge variant="light">{item.category}</Badge>
                </Table.Td>

                {/* Availability */}
                <Table.Td>
                  <Group gap={8}>
                    <Text
                      fw={800}
                      c={
                        lowStock
                          ? "red"
                          : item.quantity_available === 0
                          ? "brand"
                          : undefined
                      }
                    >
                      {item.quantity_available}
                    </Text>

                    <Text>/ {item.quantity_total}</Text>

                    {lowStock && (
                      <Badge color="red" variant="light" radius="xl">
                        Low
                      </Badge>
                    )}
                  </Group>
                </Table.Td>

                {/* Status */}
                <Table.Td>
                  <Badge color={itemStatusColor(item.status)}>
                    {itemStatusLabel(item.status)}
                  </Badge>
                </Table.Td>

                {/* Borrow */}
                <Table.Td>
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
                      size="sm"
                      disabled={unavailable}
                      onClick={() => onBorrow(item)}
                      color={unavailable ? undefined : PRIMARY_CTA_COLOR}
                    >
                      {item.quantity_available === 0
                        ? "Out of Stock"
                        : "Borrow"}
                    </Button>
                  </Tooltip>
                </Table.Td>

                {/* Actions */}
                <RoleGuard role={role} allow={["MASTER_ADMIN", "BOARD"]}>
                  <Table.Td>
                    <Group gap="sm">
                      <Button
                        size="sm"
                        fw={700}
                        variant="light"
                        color={SECONDARY_ACTION_COLOR}
                        px="md"
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
                          px="md"
                          leftSection={<IconTrash size={16} />}
                          disabled={borrowed > 0}
                          onClick={() => onDelete(item)}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </RoleGuard>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}
