"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { missionCountLabel } from "@/lib/format";
import { filterBoard, isMissionStatus } from "@/lib/missions";
import type { BoardMission, CustomerSummary } from "@/lib/types";
import { MissionFilters } from "./MissionFilters";
import { MissionTable } from "./MissionTable";
import { MissionTimeline } from "./MissionTimeline";

function normalizeStatus(value: string): string {
  return isMissionStatus(value) ? value : "all";
}

function normalizeCustomer(value: string, customers: CustomerSummary[]): string {
  return customers.some((customer) => customer.id === value) ? value : "all";
}

export function MissionBoard({
  missions,
  customers,
  initialStatus,
  initialCustomer,
}: {
  missions: BoardMission[];
  customers: CustomerSummary[];
  initialStatus: string;
  initialCustomer: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(() => normalizeStatus(initialStatus));
  const [customerId, setCustomerId] = useState(() => normalizeCustomer(initialCustomer, customers));
  const [seenStatus, setSeenStatus] = useState(initialStatus);
  const [seenCustomer, setSeenCustomer] = useState(initialCustomer);

  if (initialStatus !== seenStatus || initialCustomer !== seenCustomer) {
    setSeenStatus(initialStatus);
    setSeenCustomer(initialCustomer);
    setStatus(normalizeStatus(initialStatus));
    setCustomerId(normalizeCustomer(initialCustomer, customers));
  }

  const filtered = filterBoard(missions, status, customerId);

  function replace(nextStatus: string, nextCustomer: string) {
    const params = new URLSearchParams();
    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }
    if (nextCustomer !== "all") {
      params.set("customer", nextCustomer);
    }
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <MissionFilters
          customers={customers}
          status={status}
          customerId={customerId}
          onStatus={(value) => {
            setStatus(value);
            replace(value, customerId);
          }}
          onCustomer={(value) => {
            setCustomerId(value);
            replace(status, value);
          }}
        />
        {filtered.length > 0 ? (
          <p className="pb-2 font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {missionCountLabel(filtered.length)}
          </p>
        ) : null}
      </div>
      <MissionTimeline missions={filtered} />
      <MissionTable missions={filtered} />
    </div>
  );
}
