"use client";

import type { ReactNode } from "react";
import Image from "next/image";
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
    <div className="min-h-screen text-fg">
      <header className="sticky top-0 z-20 border-b border-card-04/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/emblem.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full ring-2 ring-accent shadow-[0_0_18px_-4px_#f54e00]"
            />
            <span>
              <span className="block font-display text-xl leading-none">DanCorp</span>
              <span className="mt-1 block text-xs text-muted">Short-haul orbital courier.</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-full border border-card-04 bg-card/80 p-1">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-2.5 py-1.5 text-sm min-[720px]:px-3 ${
                      active ? "bg-fg text-bg" : "text-fg hover:bg-card-02"
                    }`}
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
