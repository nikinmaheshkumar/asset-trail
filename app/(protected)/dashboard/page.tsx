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
  ThemeIcon,
  Alert,
  Button,
  Loader,
} from "@mantine/core";
import {
  IconBox,
  IconClipboardList,
  IconClock,
  IconAlertTriangle,
  IconUsers,
  IconBolt,
  IconArrowRight,
  IconCalendarDue,
  IconPackage,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const statusColors: Record<string, string> = {
  REQUESTED: "yellow",
  APPROVED: "blue",
  CLOSED: "green",
  REJECTED: "red",
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

type LoanPreview = {
  id: number;
  requested_at: string;
  approved_at?: string;
  due_date?: string;
  purpose?: string;
  status?: string;
  item: { id: number; name: string; category: string };
  member?: { id: number; name: string; email: string; role: string };
  approver?: { id: number; name: string };
};

type LowStockItem = {
  id: number;
  name: string;
  quantity_available: number;
  quantity_total: number;
  location: string;
};

type AdminDashboard = {
  type: "admin";
  stats: {
    totalItems: number;
    activeLoans: number;
    pendingRequests: number;
    lowStockItems: number;
  };
  pendingRequests: LoanPreview[];
  activeLoans: LoanPreview[];
  lowStockItems: LowStockItem[];
};

type UserDashboard = {
  type: "user";
  myActiveLoans: LoanPreview[];
  myPendingRequests: LoanPreview[];
  overdueLoans: LoanPreview[];
  lowStockItems: LowStockItem[];
};

type DashboardData = AdminDashboard | UserDashboard;

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboardView({ data }: { data: AdminDashboard }) {
  const { stats, pendingRequests, activeLoans, lowStockItems } = data;

  const statCards = [
    { label: "Total Items", value: stats.totalItems, icon: IconBox, color: "blue" },
    { label: "Active Loans", value: stats.activeLoans, icon: IconClipboardList, color: "green" },
    { label: "Pending Requests", value: stats.pendingRequests, icon: IconClock, color: "yellow" },
    { label: "Low Stock Items", value: stats.lowStockItems, icon: IconAlertTriangle, color: "red" },
  ];

  return (
    <Stack gap="xl">
      {/* Stat Cards */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>{card.label}</Text>
                <ThemeIcon color={card.color} variant="light" size="md" radius="md">
                  <Icon size={16} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl">{card.value}</Text>
            </Card>
          );
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Pending Requests */}
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="sm">
            <Group>
              <ThemeIcon color="yellow" variant="light" size="md" radius="md">
                <IconClock size={16} />
              </ThemeIcon>
              <Title order={5}>Pending Requests</Title>
            </Group>
            <Button
              component={Link}
              href="/admin/requests"
              size="xs"
              variant="light"
              rightSection={<IconArrowRight size={14} />}
            >
              View All
            </Button>
          </Group>
          <Divider mb="sm" />
          {pendingRequests.length === 0 ? (
            <Text c="dimmed" size="sm">No pending requests</Text>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Requested</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pendingRequests.map((req) => (
                  <Table.Tr key={req.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>{req.member?.name ?? "—"}</Text>
                        {req.member?.role && (
                          <Badge size="xs" color={roleColors[req.member.role] ?? "gray"} variant="light">
                            {roleLabels[req.member.role] ?? req.member.role}
                          </Badge>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>{req.item.name}</Text>
                        <Badge size="xs" variant="light">{req.item.category}</Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{new Date(req.requested_at).toLocaleDateString()}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>

        {/* Active Loans */}
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="sm">
            <Group>
              <ThemeIcon color="blue" variant="light" size="md" radius="md">
                <IconClipboardList size={16} />
              </ThemeIcon>
              <Title order={5}>Active Loans</Title>
            </Group>
            <Button
              component={Link}
              href="/admin/loans"
              size="xs"
              variant="light"
              rightSection={<IconArrowRight size={14} />}
            >
              View All
            </Button>
          </Group>
          <Divider mb="sm" />
          {activeLoans.length === 0 ? (
            <Text c="dimmed" size="sm">No active loans</Text>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Due</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {activeLoans.map((loan) => {
                  const overdue = loan.due_date && new Date(loan.due_date) < new Date();
                  return (
                    <Table.Tr key={loan.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{loan.member?.name ?? "—"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>{loan.item.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        {loan.due_date ? (
                          <Text size="xs" c={overdue ? "red" : "dimmed"} fw={overdue ? 700 : undefined}>
                            {new Date(loan.due_date).toLocaleDateString()}
                            {overdue && " ⚠"}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </SimpleGrid>

      {/* Low Stock Items */}
      <Paper withBorder p="md" radius="md">
        <Group mb="sm">
          <ThemeIcon color="red" variant="light" size="md" radius="md">
            <IconAlertTriangle size={16} />
          </ThemeIcon>
          <Title order={5}>Low Stock Items</Title>
        </Group>
        <Divider mb="sm" />
        {lowStockItems.length === 0 ? (
          <Text c="dimmed" size="sm">No low stock items</Text>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Available</Table.Th>
                <Table.Th>Location</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lowStockItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td><Text size="sm" fw={500}>{item.name}</Text></Table.Td>
                  <Table.Td>
                    <Text size="sm" c="red" fw={700}>
                      {item.quantity_available} / {item.quantity_total}
                    </Text>
                  </Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{item.location}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────

function UserDashboardView({ data }: { data: UserDashboard }) {
  const { myActiveLoans, myPendingRequests, overdueLoans, lowStockItems } = data;

  return (
    <Stack gap="xl">
      {/* Overdue Warning */}
      {overdueLoans.length > 0 && (
        <Alert
          icon={<IconAlertTriangle size={18} />}
          title="Overdue Items"
          color="red"
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm">You have {overdueLoans.length} overdue loan{overdueLoans.length > 1 ? "s" : ""}. Please return the item(s) as soon as possible.</Text>
            {overdueLoans.map((loan) => (
              <Group key={loan.id} gap="xs">
                <IconCalendarDue size={14} />
                <Text size="sm" fw={500}>{loan.item.name}</Text>
                <Text size="xs" c="dimmed">
                  — due {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : "—"}
                </Text>
              </Group>
            ))}
          </Stack>
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* My Active Loans */}
        <Paper withBorder p="md" radius="md">
          <Group mb="sm">
            <ThemeIcon color="blue" variant="light" size="md" radius="md">
              <IconClipboardList size={16} />
            </ThemeIcon>
            <Title order={5}>My Active Loans</Title>
            <Badge color="blue" variant="light">{myActiveLoans.length}</Badge>
          </Group>
          <Divider mb="sm" />
          {myActiveLoans.length === 0 ? (
            <Text c="dimmed" size="sm">No active loans</Text>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Approved</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {myActiveLoans.map((loan) => {
                  const overdue = loan.due_date && new Date(loan.due_date) < new Date();
                  return (
                    <Table.Tr key={loan.id}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>{loan.item.name}</Text>
                          <Badge size="xs" variant="light">{loan.item.category}</Badge>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {loan.approved_at ? new Date(loan.approved_at).toLocaleDateString() : "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {loan.due_date ? (
                          <Text size="xs" c={overdue ? "red" : "dimmed"} fw={overdue ? 700 : undefined}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={statusColors[loan.status ?? ""] ?? "gray"} variant="light">
                          {loan.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
          <Group justify="flex-end" mt="sm">
            <Button component={Link} href="/my-loans" size="xs" variant="light" rightSection={<IconArrowRight size={14} />}>
              View All My Loans
            </Button>
          </Group>
        </Paper>

        {/* My Pending Requests */}
        <Paper withBorder p="md" radius="md">
          <Group mb="sm">
            <ThemeIcon color="yellow" variant="light" size="md" radius="md">
              <IconClock size={16} />
            </ThemeIcon>
            <Title order={5}>My Pending Requests</Title>
            <Badge color="yellow" variant="light">{myPendingRequests.length}</Badge>
          </Group>
          <Divider mb="sm" />
          {myPendingRequests.length === 0 ? (
            <Text c="dimmed" size="sm">No pending requests</Text>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Requested</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {myPendingRequests.map((loan) => (
                  <Table.Tr key={loan.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>{loan.item.name}</Text>
                        <Badge size="xs" variant="light">{loan.item.category}</Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{new Date(loan.requested_at).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={statusColors[loan.status ?? ""] ?? "gray"} variant="light">
                        {loan.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </SimpleGrid>

      {/* Low Stock Alerts */}
      <Paper withBorder p="md" radius="md">
        <Group mb="sm">
          <ThemeIcon color="orange" variant="light" size="md" radius="md">
            <IconPackage size={16} />
          </ThemeIcon>
          <Title order={5}>Low Stock Alerts</Title>
          <Badge color="orange" variant="light" size="sm">View only</Badge>
        </Group>
        <Divider mb="sm" />
        {lowStockItems.length === 0 ? (
          <Text c="dimmed" size="sm">No low stock items</Text>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Available</Table.Th>
                <Table.Th>Location</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lowStockItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td><Text size="sm" fw={500}>{item.name}</Text></Table.Td>
                  <Table.Td>
                    <Text size="sm" c="red" fw={700}>
                      {item.quantity_available} / {item.quantity_total}
                    </Text>
                  </Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{item.location}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: session } = useSession();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setDashData(d))
      .finally(() => setLoading(false));
  }, []);

  const role = session?.user?.role;
  const isAdmin = role === "MASTER_ADMIN" || role === "BOARD";

  return (
    <Stack gap="xl" p="md">
      <Group>
        <ThemeIcon color={isAdmin ? "blue" : "green"} variant="light" size="lg" radius="md">
          {isAdmin ? <IconUsers size={20} /> : <IconBolt size={20} />}
        </ThemeIcon>
        <div>
          <Title order={3}>Dashboard</Title>
          <Text size="sm" c="dimmed">
            {isAdmin ? "System overview" : "Your activity"}
          </Text>
        </div>
      </Group>

      {loading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : !dashData ? (
        <Center py="xl">
          <Text c="dimmed">Failed to load dashboard</Text>
        </Center>
      ) : dashData.type === "admin" ? (
        <AdminDashboardView data={dashData} />
      ) : (
        <UserDashboardView data={dashData} />
      )}
    </Stack>
  );
}
