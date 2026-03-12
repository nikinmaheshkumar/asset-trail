import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import Providers from "@/components/providers/Providers";

export const metadata = {
  title: "Asset Trail",
  description: "Inventory Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}