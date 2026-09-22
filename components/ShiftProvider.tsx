"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ShiftClock = createContext<number | null>(null);

export function ShiftProvider({ initialNow, children }: { initialNow: number; children: ReactNode }) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    // Static HTML is stamped at build time. Catch the clock up before the first tick.
    const kick = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, []);

  return <ShiftClock.Provider value={now}>{children}</ShiftClock.Provider>;
}

export function useShift(): number {
  const now = useContext(ShiftClock);
  if (now === null) {
    throw new Error("useShift requires ShiftProvider");
  }
  return now;
}
