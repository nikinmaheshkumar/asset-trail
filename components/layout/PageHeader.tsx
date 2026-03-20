"use client";

import { Group, Title, Text, Box, ThemeIcon } from "@mantine/core";
import { PRIMARY_CTA_COLOR } from "@/lib/ui";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  rightSection?: React.ReactNode;
};

export function PageHeader({ title, subtitle, icon, iconColor, rightSection }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="md">
      <Group gap="sm" align="flex-start">
        {icon && (
          <ThemeIcon
            color={iconColor ?? PRIMARY_CTA_COLOR}
            variant="light"
            size="lg"
            radius="md"
          >
            {icon}
          </ThemeIcon>
        )}

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
      </Group>

      {rightSection && <Group gap="sm">{rightSection}</Group>}
    </Group>
  );
}
