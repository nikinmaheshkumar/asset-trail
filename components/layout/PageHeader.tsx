"use client";

import { Group, Title, Text, Box } from "@mantine/core";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightSection?: React.ReactNode;
};

export function PageHeader({ title, subtitle, rightSection }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="md">
      <Box>
        <Title order={2} c="var(--app-text)" fw={700}>
          {title}
        </Title>
        {subtitle && (
          <Text size="sm" c="var(--app-text-muted)">
            {subtitle}
          </Text>
        )}
      </Box>

      {rightSection && <Group gap="sm">{rightSection}</Group>}
    </Group>
  );
}
