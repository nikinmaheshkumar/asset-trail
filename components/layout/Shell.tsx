"use client";

import { Paper } from "@mantine/core";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      radius="lg"
      shadow="sm"
      p="md"
      style={{
        backgroundColor: "white",
      }}
    >
      {children}
    </Paper>
  );
}