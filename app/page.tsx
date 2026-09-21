import { Suspense } from "react";
import { KpiStrip } from "@/components/KpiStrip";
import { MissionBoard } from "@/components/MissionBoard";
import { getBoard, getCustomers, kpiCounts } from "@/lib/missions";

export default function DispatchPage() {
  const missions = getBoard();
  const customers = getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dispatch</h1>
      <KpiStrip counts={kpiCounts()} />
      <Suspense fallback={<p className="text-sm text-muted">Loading the board.</p>}>
        <MissionBoard missions={missions} customers={customers} />
      </Suspense>
    </div>
  );
}
