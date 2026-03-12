"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stack,
  Text,
  Group,
  Box,
  Divider,
  Button,
  Avatar,
  Badge,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconBox,
  IconClipboardList,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { useSession, signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role;

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: IconLayoutDashboard,
      roles: ["MASTER_ADMIN", "BOARD", "SENIOR_CORE", "JUNIOR_CORE"],
    },
    {
      label: "Inventory",
      href: "/inventory",
      icon: IconBox,
      roles: ["MASTER_ADMIN", "BOARD", "SENIOR_CORE", "JUNIOR_CORE"],
    },
    {
      label: "Loans",
      href: "/loans",
      icon: IconClipboardList,
      roles: ["MASTER_ADMIN", "BOARD", "SENIOR_CORE", "JUNIOR_CORE"],
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: IconUser,
      roles: ["MASTER_ADMIN"],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  );

  const roleLabels: Record<string, string> = {
    MASTER_ADMIN: "Master Admin",
    BOARD: "Board",
    SENIOR_CORE: "Senior Core",
    JUNIOR_CORE: "Junior Core",
  };

  const roleColors: Record<string, string> = {
    MASTER_ADMIN: "red",
    BOARD: "blue",
    SENIOR_CORE: "yellow.7",
    JUNIOR_CORE: "gray",
  };

  return (
    <Stack justify="space-between" h="100%" pt="sm">
      {/* Navigation */}
      <Stack gap="xs">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <Box
                px="sm"
                py="xs"
                style={{
                  borderRadius: 8,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  cursor: "pointer",
                }}
              >
                <Group gap="sm">
                  <Icon size={18} color={isActive ? "white" : "#9CA3AF"} />
                  <Text
                    size="md"
                    fw={isActive ? 600 : 400}
                    c={isActive ? "white" : "gray.4"}
                  >
                    {item.label}
                  </Text>
                </Group>
              </Box>
            </Link>
          );
        })}
      </Stack>

      {/* User Section */}
      <Stack gap="md">
        <Divider color="dark.4" />

        <Box
          px="md"
          py="md"
          style={{
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack align="center" gap="xs">
            <Avatar size={42} radius="xl" color="blue">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </Avatar>

            <Stack gap={2} align="center">
              <Text size="sm" fw={600} c="white">
                {session?.user?.name ?? "Unknown"}
              </Text>

              <Text size="xs" c="gray.4">
                {session?.user?.email}
              </Text>
            </Stack>

            {session?.user?.role && (
              <Badge
                size="sm"
                variant="light"
                color={roleColors[session.user.role]}
                mt={4}
              >
                {roleLabels[session.user.role]}
              </Badge>
            )}
          </Stack>
        </Box>

        <Button
          leftSection={<IconLogout size={16} />}
          variant="light"
          color="red"
          fullWidth
          onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
        >
          Logout
        </Button>
      </Stack>
    </Stack>
  );
}