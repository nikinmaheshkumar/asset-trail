"use client";

import { MantineProvider} from "@mantine/core";
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
          colors: {
            brand: [
              "#f5f5f5",
              "#e5e5e5",
              "#d4d4d4",
              "#a3a3a3",
              "#737373",
              "#525252",
              "#404040",
              "#262626",
              "#1f1f1f",
              "#111827",
            ],
          },
          fontSizes: {
            xs: "12px",
            sm: "14px",
            md: "16px",
            lg: "18px",
            xl: "20px",
          },
          headings: {
            sizes: {
              h1: { fontSize: "32px", lineHeight: "1.3" },
              h2: { fontSize: "24px", lineHeight: "1.35" },
              h3: { fontSize: "20px", lineHeight: "1.4" },
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