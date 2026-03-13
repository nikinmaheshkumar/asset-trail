"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  SimpleGrid,
  Switch,
  Pagination,
  Divider,
  Text,
  Center,
  Table,
  Badge,
  Card,
  Loader,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Modal,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconRefresh,
  IconLock,
  IconBox,
  IconUser,
  IconUserCheck,
  IconCalendar,
  IconCalendarDue,
  IconSettings,
  IconHash,
  IconAlertTriangle,
} from "@tabler/icons-react";

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
  const isMasterAdmin = session?.user?.role === "MASTER_ADMIN";

  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [approverFilter, setApproverFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [confirmCloseId, setConfirmCloseId] = useState<number | null>(null);

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
    setConfirmCloseId(null);
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

  const isOverdue = (dueDate?: string) => dueDate && new Date(dueDate) < new Date();

  // Build approver options for filter
  const approverOptions = useMemo(() => {
    const map = new Map<number, string>();
    loans.forEach((l) => {
      if (l.approver) map.set(l.approver.id, l.approver.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ value: String(id), label: name }));
  }, [loans]);

  const filtered = useMemo(() => {
    return loans.filter((l) => {
      const matchSearch =
        l.item.name.toLowerCase().includes(search.toLowerCase()) ||
        l.member.name.toLowerCase().includes(search.toLowerCase()) ||
        l.member.email.toLowerCase().includes(search.toLowerCase());
      const matchOverdue = overdueOnly ? isOverdue(l.due_date) : true;
      const matchApprover = approverFilter
        ? l.approved_by === Number(approverFilter)
        : true;
      return matchSearch && matchOverdue && matchApprover;
    });
  }, [loans, search, overdueOnly, approverFilter]);

  useEffect(() => { setPage(1); }, [search, overdueOnly, approverFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startItem = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  const filtersActive = search || overdueOnly || approverFilter;

  const handleReset = () => {
    setSearch("");
    setOverdueOnly(false);
    setApproverFilter(null);
    setPage(1);
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      {/* FILTER PANEL */}
      <Paper withBorder radius="md" p="md" shadow="xs">
        <Group justify="space-between" mb="md">
          <Title order={5} fw={800}>Filters</Title>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={() => { handleReset(); fetchLoans(); }}
            disabled={!filtersActive}
          >
            Reset
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <TextInput
            label="Search"
            placeholder="Search by item or borrower..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            label="Approved By"
            placeholder="All approvers"
            clearable
            size="sm"
            data={approverOptions}
            value={approverFilter}
            onChange={setApproverFilter}
          />
          <Group align="flex-end">
            <Switch
              label="Overdue only"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.currentTarget.checked)}
            />
          </Group>
        </SimpleGrid>
      </Paper>

      {/* TABLE OR MOBILE CARDS */}
      {filtered.length === 0 ? (
        <Center py="lg">
          <Text c="dimmed">No active loans match your filters</Text>
        </Center>
      ) : isMobile ? (
        <Stack gap="md">
          {paginated.map((loan) => (
            <Card key={loan.id} withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={700}>{loan.item.name}</Text>
                {isOverdue(loan.due_date) && (
                  <Badge color="red" leftSection={<IconAlertTriangle size={10} />}>Overdue</Badge>
                )}
              </Group>
              <Badge variant="light" mb="xs">{loan.item.category}</Badge>
              <Text size="sm" fw={500}>{loan.member.name}</Text>
              <Text size="sm" c="dimmed" mb="xs">{loan.member.email}</Text>
              {loan.due_date && (
                <Text size="sm" c={isOverdue(loan.due_date) ? "red" : "dimmed"}>
                  Due: {new Date(loan.due_date).toLocaleDateString()}
                </Text>
              )}
              <Text size="xs" c="dimmed">Approved by: {loan.approver?.name ?? "—"}</Text>
              {(isMasterAdmin || loan.approved_by === currentUserId) && (
                <Button
                  size="xs"
                  color="blue"
                  variant="light"
                  leftSection={<IconLock size={12} />}
                  loading={closingId === loan.id}
                  onClick={() => setConfirmCloseId(loan.id)}
                  mt="sm"
                >
                  Close Loan
                </Button>
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <ScrollArea>
          <Table verticalSpacing="lg" horizontalSpacing="xl" highlightOnHover stickyHeader>
            <Table.Thead style={{ background: "#f8f9fa" }}>
              <Table.Tr>
                <Table.Th><Group gap={6}><IconHash size={16} /></Group></Table.Th>
                <Table.Th><Group gap={6}><IconBox size={16} /><Text fw={800}>Item</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconUser size={16} /><Text fw={800}>Borrower</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconUserCheck size={16} /><Text fw={800}>Approved By</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconCalendar size={16} /><Text fw={800}>Approved At</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconCalendarDue size={16} /><Text fw={800}>Due Date</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconSettings size={16} /><Text fw={800}>Actions</Text></Group></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginated.map((loan, idx) => {
                const overdue = isOverdue(loan.due_date);
                return (
                  <Table.Tr key={loan.id}>
                    <Table.Td><Text fw={600}>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</Text></Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={700}>{loan.item.name}</Text>
                        <Badge variant="light" size="sm">{loan.item.category}</Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600} size="sm">{loan.member.name}</Text>
                        <Text size="xs" c="dimmed">{loan.member.email}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{loan.approver?.name ?? "—"}</Table.Td>
                    <Table.Td>
                      {loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : "—"}
                    </Table.Td>
                    <Table.Td>
                      {loan.due_date ? (
                        <Group gap="xs">
                          <Text size="sm" c={overdue ? "red" : undefined} fw={overdue ? 700 : undefined}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </Text>
                          {overdue && (
                            <Badge color="red" size="xs" variant="light">Overdue</Badge>
                          )}
                        </Group>
                      ) : (
                        <Text c="dimmed">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {(isMasterAdmin || loan.approved_by === currentUserId) ? (
                        <Tooltip label="Close Loan">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            loading={closingId === loan.id}
                            onClick={() => setConfirmCloseId(loan.id)}
                          >
                            <IconLock size={16} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Text size="xs" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <>
          <Divider />
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>
              Showing {startItem}–{endItem} of {filtered.length}
            </Text>
            <Group gap="xs" align="center">
              <Button size="sm" variant="default" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Prev
              </Button>
              <Pagination value={page} onChange={setPage} total={totalPages} size="md" radius="md" withControls={false} />
              <Button size="sm" variant="default" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </Group>
          </Group>
        </>
      )}

      {/* CONFIRM CLOSE MODAL */}
      <Modal
        opened={confirmCloseId !== null}
        onClose={() => setConfirmCloseId(null)}
        title={<Text fw={700} size="lg">Confirm Return</Text>}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Confirm that the asset has been returned and verified.
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setConfirmCloseId(null)}>
              Cancel
            </Button>
            <Button
              color="blue"
              loading={closingId !== null}
              onClick={() => confirmCloseId !== null && handleClose(confirmCloseId)}
            >
              Confirm Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
