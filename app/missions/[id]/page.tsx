import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { CONTRACT_LABEL, READINESS_LABEL, formatWindow } from "@/lib/format";
import { getMissionDetail } from "@/lib/missions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} · DanCorp Dispatch` };
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-card-04 bg-card px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMissionDetail(id);

  if (!mission) {
    return <h1 className="text-2xl font-semibold tracking-tight">No mission {id}.</h1>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link href="/" className="text-muted hover:text-accent">
          Dispatch
        </Link>
      </p>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">{mission.id}</h1>
        <StatusBadge status={mission.status} />
      </div>
      <p className="text-lg">{mission.cargo}</p>
      <div className="grid gap-3 min-[720px]:grid-cols-4">
        <Fact label="Customer">
          <Link href={`/?customer=${mission.customerId}`} className="hover:text-accent">
            {mission.customerName}
          </Link>
          <p className="text-sm text-muted">
            {mission.site} · {CONTRACT_LABEL[mission.customer.contract]}
          </p>
        </Fact>
        <Fact label="Vehicle">
          <Link href={`/fleet#${mission.vehicleId}`} className="hover:text-accent">
            {mission.vehicleName}
          </Link>
          <p className="text-sm text-muted">
            {mission.vehicle.pad} · {READINESS_LABEL[mission.vehicle.readiness]}
          </p>
        </Fact>
        <Fact label="Window">
          <p className="tabular-nums">{formatWindow(mission.windowStart)}</p>
        </Fact>
        {mission.status === "delayed" ? (
          <Fact label="Delay">
            <p className="tabular-nums text-accent">{mission.delayMinutes} min</p>
          </Fact>
        ) : null}
      </div>
      <section aria-label="Events" className="space-y-2">
        <h2 className="text-sm text-muted">Events</h2>
        <ol className="divide-y divide-card-04 rounded-md border border-card-04 bg-card">
          {mission.events.map((event) => (
            <li key={event.at} className="flex gap-4 px-4 py-2 text-sm">
              <span className="w-24 shrink-0 tabular-nums text-muted">{formatWindow(event.at)}</span>
              <span>{event.label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
