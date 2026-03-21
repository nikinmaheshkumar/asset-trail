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
  Pagination,
  Divider,
  Text,
  Center,
  Table,
  Badge,
  Card,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconRefresh,
  IconBox,
  IconCategory,
  IconActivityHeartbeat,
  IconCalendar,
  IconCalendarDue,
  IconHash,
} from "@tabler/icons-react";
import { SECONDARY_ACTION_COLOR } from "@/lib/ui";
import { loanStatusColor, loanStatusLabel } from "@/lib/status";

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
      const matchSearch =
        l.item.name.toLowerCase().includes(search.toLowerCase()) ||
        l.item.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? l.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [loans, search, statusFilter]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startItem = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  const filtersActive = search || statusFilter;

  const handleReset = () => {
    setSearch("");
    setStatusFilter(null);
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
      <Paper
        withBorder
        radius="md"
        p="md"
        shadow="xs"
        style={{
          background: "linear-gradient(180deg, var(--app-surface) 0%, color-mix(in srgb, var(--app-accent-soft) 28%, var(--app-surface)) 100%)",
          borderColor: "color-mix(in srgb, var(--app-accent) 18%, var(--app-border))",
        }}
      >
        <Group justify="space-between" mb="md">
          <Title order={5} fw={800}>Filters</Title>
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
            placeholder="Search by item or category..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            label="Status"
            placeholder="All"
            clearable
            size="sm"
            data={[
              { value: "REQUESTED", label: "Requested" },
              { value: "APPROVED", label: "Approved" },
              { value: "CLOSED", label: "Closed" },
              { value: "REJECTED", label: "Rejected" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </SimpleGrid>
      </Paper>

      {/* TABLE OR MOBILE CARDS */}
      {filtered.length === 0 ? (
        <Center py="lg">
          <Text>No loans match your filters</Text>
        </Center>
      ) : isMobile ? (
        <Stack gap="md">
          {paginated.map((loan) => (
            <Card key={loan.id} withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={700}>{loan.item.name}</Text>
                <Badge color={loanStatusColor(loan.status)} variant="light">
                  {loanStatusLabel(loan.status)}
                </Badge>
              </Group>
              <Badge variant="light" mb="xs">{loan.item.category}</Badge>
              <Text size="sm">
                Requested: {new Date(loan.requested_at).toLocaleDateString()}
              </Text>
              {loan.due_date && (
                <Text
                  size="sm"
                  c={loan.status === "APPROVED" && new Date(loan.due_date) < new Date() ? "red" : undefined}
                >
                  Due: {new Date(loan.due_date).toLocaleDateString()}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <div className="table-shell">
          <ScrollArea>
            <Table verticalSpacing="lg" horizontalSpacing="xl" highlightOnHover stickyHeader>
              <Table.Thead style={{ background: "var(--app-table-head)" }}>
                <Table.Tr>
                <Table.Th>
                  <Group gap={6}><IconHash size={16} /></Group>
                </Table.Th>
                <Table.Th>
                  <Group gap={6}><IconBox size={16} /><Text fw={800}>Item</Text></Group>
                </Table.Th>
                <Table.Th>
                  <Group gap={6}><IconCategory size={16} /><Text fw={800}>Category</Text></Group>
                </Table.Th>
                <Table.Th>
                  <Group gap={6}><IconActivityHeartbeat size={16} /><Text fw={800}>Status</Text></Group>
                </Table.Th>
                <Table.Th>
                  <Group gap={6}><IconCalendar size={16} /><Text fw={800}>Requested At</Text></Group>
                </Table.Th>
                <Table.Th>
                  <Group gap={6}><IconCalendarDue size={16} /><Text fw={800}>Due Date</Text></Group>
                </Table.Th>
              </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginated.map((loan, idx) => {
                const overdue =
                  loan.status === "APPROVED" &&
                  loan.due_date &&
                  new Date(loan.due_date) < new Date();
                return (
                  <Table.Tr key={loan.id}>
                    <Table.Td>
                      <Text fw={600}>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={700}>{loan.item.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">{loan.item.category}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={loanStatusColor(loan.status)} variant="light">
                        {loanStatusLabel(loan.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{new Date(loan.requested_at).toLocaleDateString()}</Table.Td>
                    <Table.Td>
                      {loan.due_date ? (
                        <Text size="sm" c={overdue ? "red" : undefined}>
                          {new Date(loan.due_date).toLocaleDateString()}
                          {overdue && " ⚠ Overdue"}
                        </Text>
                      ) : (
                        <Text>—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
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
    </Stack>
  );
}
