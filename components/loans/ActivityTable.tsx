"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Paper,
  Title,
  Group,
  Pagination,
  Divider,
  Text,
  Center,
  Table,
  Card,
  SimpleGrid,
  Button,
  Badge,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";

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
  member_created: "Member Created",
  role_changed: "Role Changed",
  item_updated: "Item Updated",
};

const actionColors: Record<string, string> = {
  loan_requested: "yellow",
  loan_approved: "green",
  loan_rejected: "red",
  loan_closed: "gray",
  member_created: "blue",
  role_changed: "violet",
  item_updated: "cyan",
};

const PER_PAGE = 20;

export function ActivityTable() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const isMobile = useMediaQuery("(max-width: 768px)");

  async function fetchLogs(p = 1) {
    try {
      setLoading(true);
      const res = await fetch(`/api/activity?page=${p}&per_page=${PER_PAGE}`);
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
    fetchLogs(page);
  }, [page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={5}>Activity Log</Title>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => fetchLogs(page)}
            >
              Refresh
            </Button>
          </Group>
          <Divider />

          {loading ? (
            <Center py="xl"><Text c="dimmed">Loading...</Text></Center>
          ) : logs.length === 0 ? (
            <Center py="xl"><Text c="dimmed">No activity recorded</Text></Center>
          ) : isMobile ? (
            <SimpleGrid cols={1} spacing="sm">
              {logs.map((log) => (
                <Card key={log.id} withBorder radius="md" p="sm">
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Badge
                        color={actionColors[log.action] ?? "gray"}
                        variant="light"
                        size="sm"
                      >
                        {actionLabels[log.action] ?? log.action}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {new Date(log.created_at).toLocaleString()}
                      </Text>
                    </Group>
                    <Text size="xs">Actor: {log.actor?.name ?? `#${log.actor_id}`}</Text>
                    {log.target_id && (
                      <Text size="xs" c="dimmed">Target ID: {log.target_id}</Text>
                    )}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Actor</Table.Th>
                  <Table.Th>Target ID</Table.Th>
                  <Table.Th>Time</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Badge
                        color={actionColors[log.action] ?? "gray"}
                        variant="light"
                        size="sm"
                      >
                        {actionLabels[log.action] ?? log.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm">{log.actor?.name ?? `#${log.actor_id}`}</Text>
                        {log.actor?.email && (
                          <Text size="xs" c="dimmed">{log.actor.email}</Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td c="dimmed">{log.target_id ?? "—"}</Table.Td>
                    <Table.Td>{new Date(log.created_at).toLocaleString()}</Table.Td>
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
                  {total === 0 ? "No logs" : `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total}`}
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
