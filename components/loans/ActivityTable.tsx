"use client";

import { useEffect, useState } from "react";
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
  IconActivityHeartbeat,
  IconUser,
  IconCalendar,
  IconHash,
} from "@tabler/icons-react";
import { activityActionColor, SECONDARY_ACTION_COLOR } from "@/lib/ui";

type ActivityLog = {
  id: number;
  action: string;
  actor_id: number;
  target_id?: number;
  created_at: string;
  actor?: { id: number; name: string; email: string };
};

const actionLabels: Record<string, string> = {
  loan_requested: "Loan Requested",
  loan_approved: "Loan Approved",
  loan_rejected: "Loan Rejected",
  loan_closed: "Loan Closed",
  loan_cancelled: "Loan Cancelled",
  member_created: "Member Created",
  role_changed: "Role Changed",
  item_updated: "Item Updated",
};

const PER_PAGE = 20;

export function ActivityTable() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchLogs(p = 1, s = search, a = actionFilter) {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(p), per_page: String(PER_PAGE) });
      if (s) params.set("search", s);
      if (a) params.set("action", a);
      const res = await fetch(`/api/activity?${params.toString()}`);
      const data = await res.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotal(data.total ?? 0);
    } catch {
      notifications.show({ color: "red", title: "Error", message: "Failed to fetch activity logs" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs(page, search, actionFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, actionFilter]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const startItem = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, total);

  const filtersActive = search || actionFilter;

  const handleReset = () => {
    setSearch("");
    setActionFilter(null);
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
          background: "linear-gradient(180deg, var(--app-surface) 0%, color-mix(in srgb, var(--app-accent-2-soft) 22%, var(--app-surface)) 100%)",
          borderColor: "color-mix(in srgb, var(--app-accent-2) 14%, var(--app-border))",
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
            placeholder="Search by actor name or email..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          />
          <Select
            label="Action"
            placeholder="All actions"
            clearable
            size="sm"
            data={Object.entries(actionLabels).map(([value, label]) => ({ value, label }))}
            value={actionFilter}
            onChange={(v) => { setActionFilter(v); setPage(1); }}
          />
        </SimpleGrid>
      </Paper>

      {/* TABLE OR MOBILE CARDS */}
      {logs.length === 0 ? (
        <Center py="lg">
          <Text>No activity records match your filters</Text>
        </Center>
      ) : isMobile ? (
        <Stack gap="md">
          {logs.map((log) => (
            <Card key={log.id} withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Badge color={activityActionColor(log.action)} variant="light">
                  {actionLabels[log.action] ?? log.action}
                </Badge>
                <Text size="xs">{new Date(log.created_at).toLocaleString()}</Text>
              </Group>
              <Text size="sm" fw={600}>{log.actor?.name ?? `#${log.actor_id}`}</Text>
              {log.actor?.email && (
                <Text size="xs">{log.actor.email}</Text>
              )}
              {log.target_id && (
                <Text size="xs" mt={4}>Target ID: {log.target_id}</Text>
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
                <Table.Th><Group gap={6}><IconHash size={16} /></Group></Table.Th>
                <Table.Th><Group gap={6}><IconActivityHeartbeat size={16} /><Text fw={800}>Action</Text></Group></Table.Th>
                <Table.Th><Group gap={6}><IconUser size={16} /><Text fw={800}>Actor</Text></Group></Table.Th>
                <Table.Th><Text fw={800}>Target ID</Text></Table.Th>
                <Table.Th><Group gap={6}><IconCalendar size={16} /><Text fw={800}>Time</Text></Group></Table.Th>
              </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log, idx) => (
                <Table.Tr key={log.id}>
                  <Table.Td><Text fw={600}>{(page - 1) * PER_PAGE + idx + 1}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={activityActionColor(log.action)} variant="light">
                      {actionLabels[log.action] ?? log.action}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fw={600} size="sm">{log.actor?.name ?? `#${log.actor_id}`}</Text>
                      {log.actor?.email && (
                        <Text size="xs">{log.actor.email}</Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {log.target_id ? (
                      <Text size="sm">#{log.target_id}</Text>
                    ) : (
                      <Text>—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>{new Date(log.created_at).toLocaleString()}</Table.Td>
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
              Showing {startItem}–{endItem} of {total}
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
