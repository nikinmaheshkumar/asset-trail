"use client";

import {
  Table,
  ScrollArea,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
  Button,
  CopyButton,
} from "@mantine/core";

import { modals } from "@mantine/modals";

import {
  IconUser,
  IconMail,
  IconShield,
  IconDotsVertical,
  IconTrash,
  IconKey,
} from "@tabler/icons-react";

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
          Are you sure you want to delete <b>{name}</b>? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => onDelete(id),
    });
  }

  function confirmReset(id: number, name: string) {

    if (id === currentUserId) {
      modals.open({
        title: "Action Not Allowed",
        centered: true,
        children: (
          <Text size="sm">
            You cannot reset your own password.
          </Text>
        ),
      });
      return;
    }

    modals.openConfirmModal({
      title: "Reset Password",
      centered: true,
      children: (
        <Text size="sm">
          Reset password for <b>{name}</b>? They will be forced to change it on
          next login.
        </Text>
      ),
      labels: { confirm: "Reset", cancel: "Cancel" },
      confirmProps: { color: "orange" },

      async onConfirm() {

        try {

          const newPassword = await onResetPassword(id, name);

          modals.open({
            title: "Password Reset Successful",
            centered: true,
            children: (
              <>
                <Text size="sm" mb="sm">
                  Default password for <b>{name}</b>:
                </Text>

                <CopyButton value={newPassword}>
                  {({ copied, copy }) => (
                    <Button onClick={copy} fullWidth>
                      {copied ? "Copied!" : newPassword}
                    </Button>
                  )}
                </CopyButton>
              </>
            ),
          });

        } catch (error) {

          modals.open({
            title: "Reset Failed",
            centered: true,
            children: (
              <Text size="sm">
                {(error as Error).message || "Could not reset password"}
              </Text>
            ),
          });

        }

      },
    });
  }

  return (
    <ScrollArea>
      <Table
        verticalSpacing="lg"
        horizontalSpacing="xl"
        highlightOnHover
        stickyHeader
      >

        <Table.Thead style={{ background: "#f8f9fa" }}>
          <Table.Tr>

            <Table.Th>ID</Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconUser size={18} />
                <Text fw={700}>Name</Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconMail size={18} />
                <Text fw={700}>Email</Text>
              </Group>
            </Table.Th>

            <Table.Th>
              <Group gap={6}>
                <IconShield size={18} />
                <Text fw={700}>Role</Text>
              </Group>
            </Table.Th>

            <Table.Th>Actions</Table.Th>

          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>

          {members.map((member, index) => (

            <Table.Tr key={member.id}>

              <Table.Td>
                <Text fw={600}>{index + 1}</Text>
              </Table.Td>

              <Table.Td>
                <Text fw={700}>{member.name}</Text>
              </Table.Td>

              <Table.Td>
                <Text>{member.email}</Text>
              </Table.Td>

              <Table.Td>
                <Badge
                  variant="light"
                  color={
                    member.role === "MASTER_ADMIN"
                      ? "red"
                      : member.role === "BOARD"
                      ? "blue"
                      : "gray"
                  }
                >
                  {member.role}
                </Badge>
              </Table.Td>

              <Table.Td>

                <Menu shadow="md" width={200} position="bottom-end">

                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>

                    <Menu.Label>
                      <Text fw={700} size="sm">
                        Change Role
                      </Text>
                    </Menu.Label>

                    <Menu.Item
                      onClick={() => onRoleChange(member.id, "MASTER_ADMIN")}
                    >
                      <Text size="xs">MASTER_ADMIN</Text>
                    </Menu.Item>

                    <Menu.Item
                      onClick={() => onRoleChange(member.id, "BOARD")}
                    >
                      <Text size="xs">BOARD</Text>
                    </Menu.Item>

                    <Menu.Item
                      onClick={() => onRoleChange(member.id, "SENIOR_CORE")}
                    >
                      <Text size="xs">SENIOR_CORE</Text>
                    </Menu.Item>

                    <Menu.Item
                      onClick={() => onRoleChange(member.id, "JUNIOR_CORE")}
                    >
                      <Text size="xs">JUNIOR_CORE</Text>
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      leftSection={<IconKey size={16} />}
                      onClick={() => confirmReset(member.id, member.name)}
                    >
                      Reset Password
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={() =>
                        confirmDelete(member.id, member.name)
                      }
                    >
                      Delete User
                    </Menu.Item>

                  </Menu.Dropdown>

                </Menu>

              </Table.Td>

            </Table.Tr>

          ))}

        </Table.Tbody>

      </Table>
    </ScrollArea>
  );
}