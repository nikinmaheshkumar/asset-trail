"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <MantineProvider
        theme={{
          primaryColor: "brand",
          primaryShade: { light: 7, dark: 6 },
          colors: {
            // Primary brand: deep maroon (from logo)
            brand: [
              "#fff1f1",
              "#ffe1e2",
              "#ffc9cc",
              "#ffa1a6",
              "#ff6f78",
              "#f33b48",
              "#c8212a",
              "#a01820",
              "#7f1117",
              "#5f0b10",
            ],

            // Secondary accent: purple (from logo)
            accent: [
              "#f6f1fb",
              "#eadcf6",
              "#d7b8ee",
              "#bf8fe4",
              "#a569d8",
              "#8d4dcc",
              "#7a3fbe",
              "#703888",
              "#542a69",
              "#3b1d4b",
            ],

            // Premium steel-blue (matches app chrome)
            steel: [
              "#eef4fb",
              "#d8e4f2",
              "#b3c9e6",
              "#86a7d6",
              "#5f86c7",
              "#476bb7",
              "#38559f",
              "#2e4785",
              "#14243c",
              "#0f1b2d",
            ],

            // Warm ink neutral (for non-danger primaries)
            ink: [
              "#f6f6f3",
              "#e7e7e0",
              "#cfcfc4",
              "#b6b6a8",
              "#9b9b8a",
              "#7f7f71",
              "#64645b",
              "#4C4C47",
              "#3d3d39",
              "#2d2d2a",
            ],
          },
          fontSizes: {
            xs: "14px",
            sm: "16px",
            md: "18px",
            lg: "20px",
            xl: "24px",
          },
          headings: {
            fontWeight: "800",
            sizes: {
              h1: { fontSize: "36px", lineHeight: "1.2" },
              h2: { fontSize: "28px", lineHeight: "1.25" },
              h3: { fontSize: "22px", lineHeight: "1.3" },
            },
          },
          fontFamily: "Inter, sans-serif",
          defaultRadius: "md",
        }}
      >
        <ModalsProvider>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
