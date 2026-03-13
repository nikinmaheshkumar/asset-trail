"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  TextInput,
  Select,
  Pagination,
  Divider,
  Text,
  Center,
  Table,
  Badge,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { Button } from "@mantine/core";

type LoanStatus = "REQUESTED" | "APPROVED" | "CLOSED" | "REJECTED";

type Loan = {
  id: number;
  item_id: number;
  member_id: number;
  requested_at: string;
  approved_at?: string;
  closed_at?: string;
  due_date?: string;
  purpose: string;
  status: LoanStatus;
  item: { id: number; name: string; category: string };
};

const statusColors: Record<LoanStatus, string> = {
  REQUESTED: "yellow",
  APPROVED: "green",
  CLOSED: "gray",
  REJECTED: "red",
};

const statusLabels: Record<LoanStatus, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

const ITEMS_PER_PAGE = 8;

export function MyLoansTable() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchLoans() {
    try {
      setLoading(true);
      const res = await fetch("/api/loans/my");
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to fetch loans" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  const filtered = useMemo(() => {
    return loans.filter((l) => {
      const matchSearch = l.item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? l.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [loans, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleReset = () => {
    setSearch("");
    setStatusFilter(null);
    setPage(1);
  };

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={5}>My Loans</Title>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => { handleReset(); fetchLoans(); }}
            >
              Refresh
            </Button>
          </Group>
          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder="Search by item name..."
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
              style={{ flex: 1, minWidth: 180 }}
            />
            <Select
              placeholder="Filter by status"
              clearable
              data={[
                { value: "REQUESTED", label: "Requested" },
                { value: "APPROVED", label: "Approved" },
                { value: "CLOSED", label: "Closed" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              style={{ minWidth: 160 }}
            />
          </Group>
          <Divider />

          {loading ? (
            <Center py="xl"><Text c="dimmed">Loading...</Text></Center>
          ) : filtered.length === 0 ? (
            <Center py="xl"><Text c="dimmed">No loans found</Text></Center>
          ) : isMobile ? (
            <SimpleGrid cols={1} spacing="sm">
              {paginated.map((loan) => (
                <Card key={loan.id} withBorder radius="md" p="sm">
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text fw={600} size="sm">{loan.item.name}</Text>
                      <Badge color={statusColors[loan.status]} size="sm">
                        {statusLabels[loan.status]}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{loan.item.category}</Text>
                    <Text size="xs">Requested: {new Date(loan.requested_at).toLocaleDateString()}</Text>
                    {loan.due_date && (
                      <Text size="xs">Due: {new Date(loan.due_date).toLocaleDateString()}</Text>
                    )}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Requested At</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginated.map((loan) => (
                  <Table.Tr key={loan.id}>
                    <Table.Td fw={500}>{loan.item.name}</Table.Td>
                    <Table.Td c="dimmed">{loan.item.category}</Table.Td>
                    <Table.Td>
                      <Badge color={statusColors[loan.status]} variant="light">
                        {statusLabels[loan.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{new Date(loan.requested_at).toLocaleDateString()}</Table.Td>
                    <Table.Td>
                      {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : "—"}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}

          {totalPages > 1 && (
            <>
              <Divider />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {filtered.length === 0 ? "No loans" : `${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
                </Text>
                <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
