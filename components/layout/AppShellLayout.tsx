"use client";

import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Sidebar } from "./Sidebar";
import { Shell } from "./Shell";
export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      padding="md"
      styles={{
        main: {
          backgroundColor: "#f3f4f6",
        },
      }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Navbar p="md" style={{ backgroundColor: "#111827" }}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Group justify="space-between" mb="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
        </Group>

        <Shell>{children}</Shell>
      </AppShell.Main>
    </AppShell>
  );
}