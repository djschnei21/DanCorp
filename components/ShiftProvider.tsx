"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ShiftClock = createContext<number | null>(null);

export function ShiftProvider({ initialNow, children }: { initialNow: number; children: ReactNode }) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
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
