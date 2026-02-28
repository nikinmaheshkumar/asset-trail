import { Stack, Text } from "@mantine/core";

export function Sidebar() {
  return (
    <Stack gap="md">
      <Text c="white" fw={700}>
        INVENTORY360
      </Text>

      <Text c="gray.4">Dashboard</Text>
      <Text c="gray.4">Inventory</Text>
      <Text c="gray.4">Loans</Text>
    </Stack>
  );
}