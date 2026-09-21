"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY, resolveTheme, type ThemeChoice } from "@/lib/theme";

function subscribe(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  document.addEventListener("dancorp-theme", listener);
  return () => {
    media.removeEventListener("change", listener);
    document.removeEventListener("dancorp-theme", listener);
  };
}

function getSnapshot(): ThemeChoice {
  return resolveTheme(localStorage.getItem(THEME_KEY), window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");

  return (
    <button
      id="theme-toggle"
      type="button"
      suppressHydrationWarning
      className="rounded-full border border-card-04 bg-card px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-fg hover:bg-card-01 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
