"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Dispatch" },
  { href: "/fleet", label: "Fleet" },
  { href: "/customers", label: "Customers" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-card-04 bg-bg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight">
              DanCorp
            </Link>
            <p className="text-sm text-muted">Low Earth orbit, same shift.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <nav className="flex gap-4 text-sm">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={active ? "text-accent" : "text-fg hover:text-accent"}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
