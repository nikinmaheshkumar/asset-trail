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
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconRefresh,
  IconCheck,
  IconX,
  IconBox,
  IconUser,
  IconShield,
  IconCalendar,
  IconNotes,
  IconSettings,
  IconHash,
} from "@tabler/icons-react";

type LoanRequest = {
  id: number;
  item_id: number;
  member_id: number;
  requested_at: string;
  purpose: string;
  status: string;
  item: { id: number; name: string; category: string; quantity_available: number };
  member: { id: number; name: string; email: string; role: string };
};

const roleColors: Record<string, string> = {
  MASTER_ADMIN: "red",
  BOARD: "accent",
  SENIOR_CORE: "yellow.7",
  JUNIOR_CORE: "yellow.6",
};

const roleLabels: Record<string, string> = {
  MASTER_ADMIN: "Master Admin",
  BOARD: "Board",
  SENIOR_CORE: "Senior Core",
  JUNIOR_CORE: "Junior Core",
};

const ITEMS_PER_PAGE = 8;

export function AdminRequestsTable() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchRequests() {
    try {
      setLoading(true);
      const res = await fetch("/api/loans/requests");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to fetch requests" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function handleApprove(id: number) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/loans/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        notifications.show({ color: "red", title: "Error", message: data.error ?? "Approve failed" });
        return;
      }
      notifications.show({ color: "green", title: "Approved", message: "Loan has been approved" });
      fetchRequests();
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Approve failed" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/loans/${id}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        notifications.show({ color: "red", title: "Error", message: data.error ?? "Reject failed" });
        return;
      }
      notifications.show({ color: "orange", title: "Rejected", message: "Loan has been rejected" });
      fetchRequests();
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Reject failed" });
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.item.name.toLowerCase().includes(search.toLowerCase()) ||
        r.member.name.toLowerCase().includes(search.toLowerCase()) ||
        r.member.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter ? r.member.role === roleFilter : true;
      return matchSearch && matchRole;
    });
  }, [requests, search, roleFilter]);

  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startItem = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  const filtersActive = search || roleFilter;

  const handleReset = () => {
    setSearch("");
    setRoleFilter(null);
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
          background: "linear-gradient(180deg, var(--app-surface) 0%, color-mix(in srgb, var(--app-accent-soft) 26%, var(--app-surface)) 100%)",
          borderColor: "color-mix(in srgb, var(--app-accent) 18%, var(--app-border))",
        }}
      >
        <Group justify="space-between" mb="md">
          <Title order={5} fw={800}>Filters</Title>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={() => { handleReset(); fetchRequests(); }}
            disabled={!filtersActive}
            color="accent"
          >
            Reset
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <TextInput
            label="Search"
            placeholder="Search by item or member..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            label="Role"
            placeholder="All"
            clearable
            size="sm"
            data={[
              { value: "MASTER_ADMIN", label: "Master Admin" },
              { value: "BOARD", label: "Board" },
              { value: "SENIOR_CORE", label: "Senior Core" },
              { value: "JUNIOR_CORE", label: "Junior Core" },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </SimpleGrid>
      </Paper>

      {/* TABLE OR MOBILE CARDS */}
      {filtered.length === 0 ? (
        <Center py="lg">
          <Text>No pending requests match your filters</Text>
        </Center>
      ) : isMobile ? (
        <Stack gap="md">
          {paginated.map((req) => (
            <Card key={req.id} withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={700}>{req.item.name}</Text>
                <Badge color={roleColors[req.member.role] ?? "brand"} variant="light">
                  {roleLabels[req.member.role] ?? req.member.role}
                </Badge>
              </Group>
              <Text size="sm" fw={500}>{req.member.name}</Text>
              <Text size="sm" mb="xs">{req.member.email}</Text>
              <Text size="xs">
                Requested: {new Date(req.requested_at).toLocaleDateString()}
              </Text>
              {req.purpose && (
                <Text size="xs">Purpose: {req.purpose}</Text>
              )}
              <Group gap="xs" mt="sm">
                <Button
                  size="xs"
                  color="green"
                  leftSection={<IconCheck size={12} />}
                  loading={actionLoading === req.id}
                  onClick={() => handleApprove(req.id)}
                >
                  Approve
                </Button>
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  leftSection={<IconX size={12} />}
                  loading={actionLoading === req.id}
                  onClick={() => handleReject(req.id)}
                >
                  Reject
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      ) : (
        <div className="table-shell">
          <ScrollArea>
            <Table verticalSpacing="lg" horizontalSpacing="xl" highlightOnHover stickyHeader>
              <Table.Thead style={{ background: "var(--app-table-head)" }}>
                <Table.Tr>
                <Table.Th><Group gap={6}><IconHash size={16} /></Group></Table.Th>
                <Table.Th><Group gap={6}><IconBox size={16} /><Text fw={800}>Item</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconUser size={16} /><Text fw={800}>Requested By</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconShield size={16} /><Text fw={800}>Role</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconCalendar size={16} /><Text fw={800}>Requested At</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconNotes size={16} /><Text fw={800}>Purpose</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconSettings size={16} /><Text fw={800}>Actions</Text></Group></Table.Th>
              </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginated.map((req, idx) => (
                <Table.Tr key={req.id}>
                  <Table.Td><Text fw={600}>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</Text></Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fw={700}>{req.item.name}</Text>
                      <Badge variant="light" size="sm">{req.item.category}</Badge>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fw={600} size="sm">{req.member.name}</Text>
                      <Text size="xs">{req.member.email}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={roleColors[req.member.role] ?? "brand"} variant="light" fw={600}>
                      {roleLabels[req.member.role] ?? req.member.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{new Date(req.requested_at).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{req.purpose || "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Approve">
                        <ActionIcon
                          color="green"
                          variant="light"
                          loading={actionLoading === req.id}
                          onClick={() => handleApprove(req.id)}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Reject">
                        <ActionIcon
                          color="red"
                          variant="light"
                          loading={actionLoading === req.id}
                          onClick={() => handleReject(req.id)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
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
