"use client";

import { AppShell, Burger, Group, ThemeIcon, Text } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Sidebar } from "./Sidebar";
import { IconPackage } from "@tabler/icons-react";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      styles={{
        main: {
          backgroundColor: "var(--app-bg)",
        },
      }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened,
        },
      }}
    >
      {/* Header */}
      <AppShell.Header
        style={{
          background: "linear-gradient(180deg, var(--app-chrome) 0%, var(--app-chrome-2) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          {/* Left: Burger */}
          <Burger
            opened={isMobile ? mobileOpened : desktopOpened}
            onClick={isMobile ? toggleMobile : toggleDesktop}
            size="md"
            color="white"
          />

          {/* Center: Branding */}
          <Group
            gap="sm"
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <ThemeIcon size={36} radius="md" variant="light" color="brand">
              <IconPackage size={22} />
            </ThemeIcon>

            <Text fw={800} size="xl" c="white" style={{ letterSpacing: 1 }}>
              Asset Trail
            </Text>
          </Group>

          {/* Right placeholder for future avatar */}
          <div style={{ width: 40 }} />
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar
        p="md"
        style={{
          background: "linear-gradient(180deg, var(--app-chrome) 0%, var(--app-chrome-2) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Sidebar />
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
