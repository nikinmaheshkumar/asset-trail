"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  TextInput,
  Pagination,
  Divider,
  Text,
  Center,
  Table,
  Badge,
  Card,
  SimpleGrid,
  Button,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconRefresh, IconLock } from "@tabler/icons-react";

type ActiveLoan = {
  id: number;
  item_id: number;
  member_id: number;
  requested_at: string;
  approved_at?: string;
  due_date?: string;
  purpose: string;
  status: string;
  approved_by?: number;
  item: { id: number; name: string; category: string };
  member: { id: number; name: string; email: string; role: string };
  approver?: { id: number; name: string };
};

const ITEMS_PER_PAGE = 8;

export function AdminActiveLoansTable() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [closingId, setClosingId] = useState<number | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchLoans() {
    try {
      setLoading(true);
      const res = await fetch("/api/loans/active");
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to fetch active loans" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  async function handleClose(id: number) {
    setClosingId(id);
    try {
      const res = await fetch(`/api/loans/${id}/close`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        notifications.show({ color: "red", title: "Error", message: data.error ?? "Close failed" });
        return;
      }
      notifications.show({ color: "blue", title: "Closed", message: "Loan has been closed" });
      fetchLoans();
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Close failed" });
    } finally {
      setClosingId(null);
    }
  }

  const filtered = useMemo(() => {
    return loans.filter((l) =>
      l.item.name.toLowerCase().includes(search.toLowerCase()) ||
      l.member.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [loans, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const isOverdue = (dueDate?: string) => dueDate && new Date(dueDate) < new Date();

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={5}>Active Loans</Title>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => { setSearch(""); setPage(1); fetchLoans(); }}
            >
              Refresh
            </Button>
          </Group>

          <TextInput
            placeholder="Search by item or member..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          />
          <Divider />

          {loading ? (
            <Center py="xl"><Text c="dimmed">Loading...</Text></Center>
          ) : filtered.length === 0 ? (
            <Center py="xl"><Text c="dimmed">No active loans</Text></Center>
          ) : isMobile ? (
            <SimpleGrid cols={1} spacing="sm">
              {paginated.map((loan) => (
                <Card key={loan.id} withBorder radius="md" p="sm">
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text fw={600} size="sm">{loan.item.name}</Text>
                      {isOverdue(loan.due_date) && (
                        <Badge color="red" size="sm">Overdue</Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">{loan.member.name} · {loan.member.email}</Text>
                    {loan.due_date && (
                      <Text size="xs" c={isOverdue(loan.due_date) ? "red" : undefined}>
                        Due: {new Date(loan.due_date).toLocaleDateString()}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed">Approved by: {loan.approver?.name ?? "—"}</Text>
                    {loan.approved_by === currentUserId && (
                      <Button
                        size="xs"
                        color="blue"
                        leftSection={<IconLock size={12} />}
                        loading={closingId === loan.id}
                        onClick={() => handleClose(loan.id)}
                        mt={4}
                      >
                        Close Loan
                      </Button>
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
                  <Table.Th>Borrower</Table.Th>
                  <Table.Th>Approved By</Table.Th>
                  <Table.Th>Approved At</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginated.map((loan) => (
                  <Table.Tr key={loan.id}>
                    <Table.Td fw={500}>{loan.item.name}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm">{loan.member.name}</Text>
                        <Text size="xs" c="dimmed">{loan.member.email}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{loan.approver?.name ?? "—"}</Table.Td>
                    <Table.Td>
                      {loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : "—"}
                    </Table.Td>
                    <Table.Td>
                      {loan.due_date ? (
                        <Text size="sm" c={isOverdue(loan.due_date) ? "red" : undefined}>
                          {new Date(loan.due_date).toLocaleDateString()}
                          {isOverdue(loan.due_date) && " (overdue)"}
                        </Text>
                      ) : "—"}
                    </Table.Td>
                    <Table.Td>
                      {loan.approved_by === currentUserId ? (
                        <Tooltip label="Close Loan">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            size="sm"
                            loading={closingId === loan.id}
                            onClick={() => handleClose(loan.id)}
                          >
                            <IconLock size={14} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Text size="xs" c="dimmed">—</Text>
                      )}
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
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
