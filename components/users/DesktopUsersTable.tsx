"use client";

import {
  Table,
  Badge,
  ActionIcon,
  Menu,
  Text,
  Stack,
  Group,
} from "@mantine/core";
import {
  IconHash,
  IconUser,
  IconShield,
  IconSettings,
  IconDotsVertical,
  IconTrash,
  IconKey,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Props = {
  members: Member[];
  onRoleChange: (id: number, role: string) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number, name: string) => Promise<string>;
  currentUserId?: number;
};

const roleLabels: Record<string, string> = {
  MASTER_ADMIN: "Master Admin",
  BOARD: "Board",
  SENIOR_CORE: "Senior Core",
  JUNIOR_CORE: "Junior Core",
};

export function DesktopUsersTable({
  members,
  onRoleChange,
  onDelete,
  onResetPassword,
  currentUserId,
}: Props) {

  function confirmDelete(id: number, name: string) {
    modals.openConfirmModal({
      title: "Delete User",
      centered: true,
      children: (
        <Text size="sm">
          Delete <b>{name}</b>? This cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => onDelete(id),
    });
  }

  function confirmReset(id: number, name: string) {

    if (id === currentUserId) return;

    modals.openConfirmModal({
      title: "Reset Password",
      centered: true,
      children: (
        <Text size="sm">
          Reset password for <b>{name}</b>?
        </Text>
      ),
      labels: { confirm: "Reset", cancel: "Cancel" },
      confirmProps: { color: "yellow" },

      onConfirm: async () => {
        const pwd = await onResetPassword(id, name);

        modals.open({
          title: "Password Reset",
          children: (
            <Text size="sm">
              New password: <b>{pwd}</b>
            </Text>
          ),
        });
      },
    });
  }

  return (
    <Table highlightOnHover verticalSpacing="lg" horizontalSpacing="md">

      <Table.Thead>
        <Table.Tr style={{ background: "white" }}>

          <Table.Th>
            <Group gap={8} align="center">
              <IconHash size={18} />
              <Text size="md" fw={700}>ID</Text>
            </Group>
          </Table.Th>

          <Table.Th>
            <Group gap={8} align="center">
              <IconUser size={18} />
              <Text size="md" fw={700}>User</Text>
            </Group>
          </Table.Th>

          <Table.Th>
            <Group gap={8} align="center">
              <IconShield size={18} />
              <Text size="md" fw={700}>Role</Text>
            </Group>
          </Table.Th>

          <Table.Th>
            <Group gap={8} align="center">
              <IconSettings size={18} />
              <Text size="md" fw={700}>Actions</Text>
            </Group>
          </Table.Th>

        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>

        {members.map((member, index) => {

          const isCurrentUser = member.id === currentUserId;
          const isMasterAdmin = member.role === "MASTER_ADMIN";

          return (

            <Table.Tr key={member.id}>

              <Table.Td>{index + 1}</Table.Td>

              <Table.Td>
                <Stack gap={0}>

                  <Group gap={6}>
                    <Text fw={600}>{member.name}</Text>

                    {isCurrentUser && (
                      <Badge size="xs" color="green">
                        You
                      </Badge>
                    )}
                  </Group>

                  <Text size="sm" c="dimmed">
                    {member.email}
                  </Text>

                </Stack>
              </Table.Td>

              <Table.Td>

                <Badge
                  variant="light"
                  fw={600}
                  color={
                    member.role === "MASTER_ADMIN"
                      ? "red"
                      : member.role === "BOARD"
                      ? "blue"
                      : member.role === "SENIOR_CORE"
                      ? "yellow.7"
                      : "gray"
                  }
                >
                  {roleLabels[member.role]}
                </Badge>

              </Table.Td>

              <Table.Td>

                <Menu position="bottom-end">

                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>

                    <Menu.Label>Change Role</Menu.Label>

                    <Menu.Item
                      disabled={isCurrentUser}
                      onClick={() => onRoleChange(member.id, "MASTER_ADMIN")}
                    >
                      Master Admin
                    </Menu.Item>

                    <Menu.Item
                      disabled={isCurrentUser}
                      onClick={() => onRoleChange(member.id, "BOARD")}
                    >
                      Board
                    </Menu.Item>

                    <Menu.Item
                      disabled={isCurrentUser}
                      onClick={() => onRoleChange(member.id, "SENIOR_CORE")}
                    >
                      Senior Core
                    </Menu.Item>

                    <Menu.Item
                      disabled={isCurrentUser}
                      onClick={() => onRoleChange(member.id, "JUNIOR_CORE")}
                    >
                      Junior Core
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Label>Security</Menu.Label>

                    <Menu.Item
                      disabled={isCurrentUser}
                      leftSection={<IconKey size={16} />}
                      onClick={() => confirmReset(member.id, member.name)}
                    >
                      Reset Password
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Label c="red">Danger Zone</Menu.Label>

                    <Menu.Item
                      color="red"
                      disabled={isCurrentUser || isMasterAdmin}
                      leftSection={<IconTrash size={16} />}
                      onClick={() => confirmDelete(member.id, member.name)}
                    >
                      Delete User
                    </Menu.Item>

                  </Menu.Dropdown>

                </Menu>

              </Table.Td>

            </Table.Tr>

          );
        })}

      </Table.Tbody>

    </Table>
  );
}