"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  SimpleGrid,
  Card,
  Text,
  Group,
  Title,
  Badge,
  Table,
  Paper,
  Divider,
  Center,
  Progress,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBox,
  IconClipboardList,
  IconClock,
  IconAlertTriangle,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

type Analytics = {
  totalItems: number;
  activeLoans: number;
  pendingRequests: number;
  lowStockItems: number;
  mostBorrowed: {
    item: { id: number; name: string; category: string };
    count: number;
  }[];
  monthlyActivity: { month: string; count: number }[];
  userBorrowStats: {
    member: { id: number; name: string; email: string; role: string };
    totalLoans: number;
    activeLoans: number;
  }[];
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

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
      .finally(() => setLoading(false));
  }, []);

  const statCards = analytics
    ? [
        {
          label: "Total Items",
          value: analytics.totalItems,
          icon: IconBox,
          color: "blue",
        },
        {
          label: "Active Loans",
          value: analytics.activeLoans,
          icon: IconClipboardList,
          color: "green",
        },
        {
          label: "Pending Requests",
          value: analytics.pendingRequests,
          icon: IconClock,
          color: "yellow",
        },
        {
          label: "Low Stock Items",
          value: analytics.lowStockItems,
          icon: IconAlertTriangle,
          color: "red",
        },
      ]
    : [];

  const maxMonthly = analytics?.monthlyActivity?.length
    ? Math.max(...analytics.monthlyActivity.map((m) => m.count), 1)
    : 1;

  return (
    <Stack gap="xl" p="md">
      <Title order={3}>Dashboard</Title>

      {loading ? (
        <Center py="xl">
          <Text c="dimmed">Loading analytics...</Text>
        </Center>
      ) : (
        <>
          {/* Stat Cards */}
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} withBorder radius="md" p="md">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed" fw={500}>
                      {card.label}
                    </Text>
                    <ThemeIcon color={card.color} variant="light" size="md" radius="md">
                      <Icon size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text fw={700} size="xl">
                    {card.value}
                  </Text>
                </Card>
              );
            })}
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* Most Borrowed Assets */}
            <Paper withBorder p="md" radius="md">
              <Group mb="sm">
                <ThemeIcon color="violet" variant="light" size="md" radius="md">
                  <IconTrendingUp size={16} />
                </ThemeIcon>
                <Title order={5}>Most Borrowed Assets</Title>
              </Group>
              <Divider mb="sm" />
              {analytics?.mostBorrowed?.length === 0 ? (
                <Text c="dimmed" size="sm">No data available</Text>
              ) : (
                <Stack gap="xs">
                  {analytics?.mostBorrowed?.map(({ item, count }) => (
                    <Group key={item.id} justify="space-between">
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>{item.name}</Text>
                        <Text size="xs" c="dimmed">{item.category}</Text>
                      </Stack>
                      <Badge variant="light" color="violet">{count} loans</Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Monthly Loan Activity */}
            <Paper withBorder p="md" radius="md">
              <Group mb="sm">
                <ThemeIcon color="teal" variant="light" size="md" radius="md">
                  <IconClipboardList size={16} />
                </ThemeIcon>
                <Title order={5}>Monthly Loan Activity</Title>
              </Group>
              <Divider mb="sm" />
              {analytics?.monthlyActivity?.length === 0 ? (
                <Text c="dimmed" size="sm">No data available</Text>
              ) : (
                <Stack gap="sm">
                  {analytics?.monthlyActivity?.map(({ month, count }) => (
                    <div key={month}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm">{formatMonth(month)}</Text>
                        <Text size="sm" fw={500}>{count}</Text>
                      </Group>
                      <Progress
                        value={(count / maxMonthly) * 100}
                        color="teal"
                        size="sm"
                        radius="xl"
                      />
                    </div>
                  ))}
                </Stack>
              )}
            </Paper>
          </SimpleGrid>

          {/* User Borrow Statistics */}
          <Paper withBorder p="md" radius="md">
            <Group mb="sm">
              <ThemeIcon color="orange" variant="light" size="md" radius="md">
                <IconUsers size={16} />
              </ThemeIcon>
              <Title order={5}>User Borrow Statistics</Title>
            </Group>
            <Divider mb="sm" />
            {analytics?.userBorrowStats?.length === 0 ? (
              <Text c="dimmed" size="sm">No data available</Text>
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Active Loans</Table.Th>
                    <Table.Th>Total Loans</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {analytics?.userBorrowStats?.map(({ member, totalLoans, activeLoans: active }) => (
                    <Table.Tr key={member.id}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>{member.name}</Text>
                          <Text size="xs" c="dimmed">{member.email}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={roleColors[member.role] ?? "gray"}
                          variant="light"
                          size="sm"
                        >
                          {roleLabels[member.role] ?? member.role}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{active}</Table.Td>
                      <Table.Td>{totalLoans}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
}
