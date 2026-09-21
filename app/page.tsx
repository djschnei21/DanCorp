import { KpiStrip } from "@/components/KpiStrip";
import { MissionBoard } from "@/components/MissionBoard";
import { getBoard, getCustomers, kpiCounts } from "@/lib/missions";

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customer?: string }>;
}) {
  const params = await searchParams;
  const missions = getBoard();
  const customers = getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dispatch</h1>
      <KpiStrip counts={kpiCounts()} />
      <MissionBoard
        missions={missions}
        customers={customers}
        initialStatus={params.status ?? "all"}
        initialCustomer={params.customer ?? "all"}
      />
    </div>
  );
}
