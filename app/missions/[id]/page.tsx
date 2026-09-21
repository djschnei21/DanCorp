import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { CONTRACT_LABEL, READINESS_LABEL, formatWindow } from "@/lib/format";
import { getMissionDetail } from "@/lib/missions";
import { vehiclePortrait } from "@/lib/portraits";

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
    <div className="rounded-2xl border border-card-04 bg-card px-4 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMissionDetail(id);

  if (!mission) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-card-04 bg-card px-8 py-14 text-center">
        <Image src="/brand/emblem.png" alt="" width={64} height={64} className="mx-auto h-16 w-16 rounded-full" />
        <h1 className="mt-6 font-display text-3xl tracking-tight">{`No mission ${id}.`}</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative h-72 overflow-hidden rounded-[28px] min-[720px]:h-80">
        <Image
          src={vehiclePortrait[mission.vehicleId]}
          alt=""
          fill
          priority
          quality={90}
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#14120b_0%,rgba(20,18,11,0.62)_34%,rgba(20,18,11,0.12)_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#14120b_0%,rgba(20,18,11,0.45)_28%,transparent_58%)]" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-6 py-6 min-[720px]:px-8">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[0.18em] text-[#edecec]/70 hover:text-[#f54e00]">
              Dispatch
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl text-[#edecec] min-[720px]:text-5xl">{mission.id}</h1>
              <StatusBadge status={mission.status} />
            </div>
            <p className="mt-2 text-lg text-[#edecec]/85">{mission.cargo}</p>
          </div>
          {mission.status === "delayed" ? (
            <p className="font-display text-5xl leading-none text-[#f54e00] min-[720px]:text-6xl">
              {mission.delayMinutes}
              <span className="ml-2 align-middle font-mono text-sm tracking-wide text-[#f54e00]/80">min</span>
            </p>
          ) : null}
        </div>
      </section>
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
          <p className="font-display text-2xl tabular-nums">{formatWindow(mission.windowStart)}</p>
        </Fact>
        {mission.status === "delayed" ? (
          <Fact label="Delay">
            <p className="font-display text-2xl tabular-nums text-accent">{mission.delayMinutes} min</p>
          </Fact>
        ) : null}
      </div>
      <section aria-label="Events">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Events</h2>
        <ol className="mt-3 overflow-hidden rounded-3xl border border-card-04 bg-card">
          {mission.events.map((event) => (
            <li key={event.at} className="flex gap-4 border-t border-card-04 px-5 py-3 text-sm first:border-t-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <span className="w-24 shrink-0 tabular-nums text-muted">{formatWindow(event.at)}</span>
              <span>{event.label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
