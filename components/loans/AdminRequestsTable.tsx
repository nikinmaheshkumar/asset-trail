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
import { notifications } from "@mantine/notifications";
import { IconSearch, IconRefresh, IconCheck, IconX } from "@tabler/icons-react";

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
  BOARD: "blue",
  SENIOR_CORE: "yellow",
  JUNIOR_CORE: "gray",
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
    return requests.filter((r) =>
      r.item.name.toLowerCase().includes(search.toLowerCase()) ||
      r.member.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [requests, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={5}>Pending Requests</Title>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => { setSearch(""); setPage(1); fetchRequests(); }}
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
            <Center py="xl"><Text c="dimmed">No pending requests</Text></Center>
          ) : isMobile ? (
            <SimpleGrid cols={1} spacing="sm">
              {paginated.map((req) => (
                <Card key={req.id} withBorder radius="md" p="sm">
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text fw={600} size="sm">{req.item.name}</Text>
                      <Badge color={roleColors[req.member.role] ?? "gray"} size="sm" variant="light">
                        {roleLabels[req.member.role] ?? req.member.role}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{req.member.name} · {req.member.email}</Text>
                    <Text size="xs">Requested: {new Date(req.requested_at).toLocaleDateString()}</Text>
                    <Text size="xs" c="dimmed">Purpose: {req.purpose}</Text>
                    <Group gap="xs" mt={4}>
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
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Requested By</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Requested At</Table.Th>
                  <Table.Th>Purpose</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginated.map((req) => (
                  <Table.Tr key={req.id}>
                    <Table.Td fw={500}>{req.item.name}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm">{req.member.name}</Text>
                        <Text size="xs" c="dimmed">{req.member.email}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={roleColors[req.member.role] ?? "gray"} variant="light" size="sm">
                        {roleLabels[req.member.role] ?? req.member.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{new Date(req.requested_at).toLocaleDateString()}</Table.Td>
                    <Table.Td><Text size="sm" c="dimmed">{req.purpose}</Text></Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Approve">
                          <ActionIcon
                            color="green"
                            variant="light"
                            size="sm"
                            loading={actionLoading === req.id}
                            onClick={() => handleApprove(req.id)}
                          >
                            <IconCheck size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Reject">
                          <ActionIcon
                            color="red"
                            variant="light"
                            size="sm"
                            loading={actionLoading === req.id}
                            onClick={() => handleReject(req.id)}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
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
