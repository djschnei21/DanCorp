"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { missionCountLabel } from "@/lib/format";
import { filterBoard, isMissionStatus } from "@/lib/missions";
import type { BoardMission, CustomerSummary } from "@/lib/types";
import { MissionFilters } from "./MissionFilters";
import { MissionTable } from "./MissionTable";
import { MissionTimeline } from "./MissionTimeline";

export function MissionBoard({
  missions,
  customers,
}: {
  missions: BoardMission[];
  customers: CustomerSummary[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");
  const customerParam = searchParams.get("customer");
  const status = isMissionStatus(statusParam) ? statusParam : "all";
  const customerId = customers.some((customer) => customer.id === customerParam)
    ? (customerParam as string)
    : "all";
  const filtered = filterBoard(missions, status, customerId);

  function replace(nextStatus: string, nextCustomer: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }
    if (nextCustomer === "all") {
      params.delete("customer");
    } else {
      params.set("customer", nextCustomer);
    }
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  }

  return (
    <div className="space-y-4">
      <MissionFilters
        customers={customers}
        status={status}
        customerId={customerId}
        onStatus={(value) => replace(value, customerId)}
        onCustomer={(value) => replace(status, value)}
      />
      {filtered.length > 0 ? (
        <p className="text-sm text-muted">{missionCountLabel(filtered.length)}</p>
      ) : null}
      <MissionTimeline missions={filtered} />
      <MissionTable missions={filtered} />
    </div>
  );
}
