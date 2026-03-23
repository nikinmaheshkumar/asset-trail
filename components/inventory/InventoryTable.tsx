"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { DesktopInventoryTable } from "./DesktopInventoryTable";
import { MobileInventoryCards } from "./MobileInventoryCards";
import { RequestLoanModal } from "@/components/loans/RequestLoanModal";
import { ITEM_STATUS_LABELS, itemStatusLabel } from "@/lib/status";
import { SECONDARY_ACTION_COLOR } from "@/lib/ui";

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
  const [borrowModalItem, setBorrowModalItem] = useState<Item | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/items?${params.toString()}`);
      const json = await res.json();

      const data = Array.isArray(json) ? json : (json.data ?? []);
      const meta = json.meta;

      setItems(data);
      setTotalPages(meta?.totalPages ?? 1);
      setTotalCount(meta?.total ?? data.length);
    } catch {
      // silent fail — table will show empty
      setItems([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshKey, page, search, categoryFilter, statusFilter]);

  function handleBorrow(item: Item) {
    setBorrowModalItem(item);
  }

  const filteredItems = useMemo(() => {
    if (!lowStockOnly) return items;
    return items.filter((item) =>
      item.quantity_available > 0 &&
      item.quantity_available <= item.quantity_total * 0.2
    );
  }, [items, lowStockOnly]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, lowStockOnly]);

  const paginatedItems = filteredItems;

  const startItem = totalCount === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, totalCount);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter(null);
    setStatusFilter(null);
    setLowStockOnly(false);
    setPage(1);
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

  const statusOptions = statuses
    .slice()
    .sort((a, b) => {
      const aKnown = Object.prototype.hasOwnProperty.call(ITEM_STATUS_LABELS, a);
      const bKnown = Object.prototype.hasOwnProperty.call(ITEM_STATUS_LABELS, b);

      if (aKnown && !bKnown) return -1;
      if (!aKnown && bKnown) return 1;

      return itemStatusLabel(a).localeCompare(itemStatusLabel(b));
    })
    .map((value) => ({ value, label: itemStatusLabel(value) }));

  return (
    <Stack gap="xl">

      {/* FILTER PANEL */}
      <Paper
        withBorder
        radius="md"
        p="md"
        shadow="xs"
        style={{
          background: "linear-gradient(180deg, var(--app-surface) 0%, color-mix(in srgb, var(--app-accent-soft) 32%, var(--app-surface)) 100%)",
          borderColor: "color-mix(in srgb, var(--app-accent) 18%, var(--app-border))",
        }}
      >
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
            color={SECONDARY_ACTION_COLOR}
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
            data={statusOptions}
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
          <Text>No items match your filters</Text>
        </Center>
      ) : isMobile ? (
        <MobileInventoryCards
          items={paginatedItems}
          offset={(page - 1) * ITEMS_PER_PAGE}
          onBorrow={handleBorrow}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <DesktopInventoryTable
          items={paginatedItems}
          offset={(page - 1) * ITEMS_PER_PAGE}
          onBorrow={handleBorrow}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {/* Request Loan Modal */}
      <RequestLoanModal
        opened={borrowModalItem !== null}
        item={borrowModalItem}
        onClose={() => setBorrowModalItem(null)}
        onRequested={() => {
          setBorrowModalItem(null);
          fetchItems();
        }}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <>
          <Divider />

          <Group justify="space-between" align="center">
              <Text size="sm" fw={500}>
                Showing {startItem}-{endItem} of {totalCount}
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
