import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ShiftProvider } from "@/components/ShiftProvider";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DanCorp Dispatch",
  description: "Duty board for the current Eastern day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased">
        {/* Request time is the first paint. The client ticks after mount. */}
        {/* eslint-disable-next-line react-hooks/purity */}
        <ShiftProvider initialNow={Date.now()}>
          <AppShell>{children}</AppShell>
        </ShiftProvider>
      </body>
    </html>
  );
}
