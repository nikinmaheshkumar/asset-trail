"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stack, Text, Group, Box, Divider, Button } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconBox,
  IconClipboardList,
  IconLogout,
  IconUser
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
    userRole ? item.roles.includes(userRole) : false,
  );

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

      {/* User section */}
      <Stack gap="sm">
        <Divider color="dark.4" />

        <Box
          px="sm"
          py="sm"
          style={{
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack gap={4}>
            <Text size="sm" c="gray.4">
              Logged in as
            </Text>

            <Text size="md" fw={600} c="white" truncate>
              {session?.user?.email ?? "Unknown"}
            </Text>

            <Text size="sm" fw={500} c="gray.3">
              {session?.user?.role}
            </Text>
          </Stack>
        </Box>

        <Button
          leftSection={<IconLogout size={16} />}
          variant="light"
          color="red"
          fullWidth
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </Button>
      </Stack>
    </Stack>
  );
}
