"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Loader,
  Center,
  Badge,
  ScrollArea,
  Text,
} from "@mantine/core";

type Item = {
  id: number;
  name: string;
  category: string;
  quantity_total: number;
  quantity_available: number;
  status: string;
};

export function InventoryTable() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No items found</Text>
      </Center>
    );
  }

  const rows = items.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.category}</Table.Td>
      <Table.Td>
        {item.quantity_available}/{item.quantity_total}
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            item.status === "WORKING"
              ? "green"
              : item.status === "NEEDS_TESTING"
              ? "yellow"
              : item.status === "FAULTY"
              ? "red"
              : "gray"
          }
          variant="light"
        >
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>—</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Available</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}