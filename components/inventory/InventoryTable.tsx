"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader,
  Center,
  Text,
  TextInput,
  Select,
  Switch,
  Stack,
  Paper,
  Title,
  SimpleGrid,
  Group,
  Button,
  Pagination,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { DesktopInventoryTable } from "./DesktopInventoryTable";
import { MobileInventoryCards } from "./MobileInventoryCards";

export type Item = {
  id: number
  name: string
  category: string
  location: string
  quantity_total: number
  quantity_available: number
  status: string
};

type Props = {
  refreshKey: number;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function InventoryTable({ refreshKey, onEdit, onDelete }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchItems() {
    try {
      setLoading(true);

      const res = await fetch("/api/items");
      const data = await res.json();

      // Alphabetical sorting
      const sorted = data.sort((a: Item, b: Item) =>
        a.name.localeCompare(b.name)
      );

      setItems(sorted);
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch items",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  async function handleBorrow(itemId: number) {
    setBorrowingId(itemId);

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          member_id: 4,
          due_date: new Date(Date.now() + 7 * 86400000),
        }),
      });

      if (!res.ok) throw new Error();

      notifications.show({
        color: "green",
        title: "Success",
        message: "Item borrowed successfully",
      });

      fetchItems();
    } catch {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Borrow failed",
      });
    } finally {
      setBorrowingId(null);
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = categoryFilter
        ? item.category === categoryFilter
        : true;

      const matchesStatus = statusFilter
        ? item.status === statusFilter
        : true;

      const matchesLowStock = lowStockOnly
        ? item.quantity_available > 0 &&
          item.quantity_available <= item.quantity_total * 0.2
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesLowStock
      );
    });
  }, [items, search, categoryFilter, statusFilter, lowStockOnly]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, lowStockOnly]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  const startItem =
    filteredItems.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(page * ITEMS_PER_PAGE, filteredItems.length);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter(null);
    setStatusFilter(null);
    setLowStockOnly(false);
  };

  const filtersActive =
    search || categoryFilter || statusFilter || lowStockOnly;

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  const categories = [...new Set(items.map((i) => i.category))];
  const statuses = [...new Set(items.map((i) => i.status))];

  return (
    <Stack gap="xl">

      {/* FILTER PANEL */}
      <Paper withBorder radius="md" p="md" shadow="xs">
        <Group justify="space-between" mb="md">
          <Title order={5} fw={800}>
            Filters
          </Title>

          <Button
            variant="light"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={handleReset}
            disabled={!filtersActive}
          >
            Reset
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">

          <TextInput
            label="Search"
            placeholder="Search item..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          <Select
            label="Category"
            placeholder="All"
            data={categories}
            size="sm"
            value={categoryFilter}
            onChange={setCategoryFilter}
            clearable
          />

          <Select
            label="Status"
            placeholder="All"
            data={statuses}
            size="sm"
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
          />

          <Group align="end">
            <Switch
              label="Low stock only"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.currentTarget.checked)}
            />
          </Group>

        </SimpleGrid>
      </Paper>

      {/* TABLE OR CARDS */}
      {paginatedItems.length === 0 ? (
        <Center py="lg">
          <Text c="dimmed">
            No items match your filters
          </Text>
        </Center>
      ) : isMobile ? (
        <MobileInventoryCards
          items={paginatedItems}
          borrowingId={borrowingId}
          onBorrow={handleBorrow}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <DesktopInventoryTable
          items={paginatedItems}
          borrowingId={borrowingId}
          onBorrow={handleBorrow}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <>
          <Divider />

          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>
              Showing {startItem}-{endItem} of {filteredItems.length}
            </Text>

            <Group gap="xs" align="center">
              <Button
                size="sm"
                variant="default"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>

              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="md"
                radius="md"
                withControls={false}
              />

              <Button
                size="sm"
                variant="default"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </Group>
          </Group>
        </>
      )}
    </Stack>
  );
}