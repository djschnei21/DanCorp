"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CourseMap } from "@/components/CourseMap";
import { NoMission } from "@/components/NoMission";
import { StatusBadge } from "@/components/StatusBadge";
import { useShift } from "@/components/ShiftProvider";
import {
  CONTRACT_LABEL,
  READINESS_LABEL,
  formatDistance,
  formatRoute,
  formatSpeed,
  formatWindow,
  legCountdown,
  legSummary,
} from "@/lib/format";
import { getMissionDetail } from "@/lib/missions";
import { vehiclePortrait } from "@/lib/portraits";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-card-04 bg-card px-4 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function MissionView({ id }: { id: string }) {
  const mission = getMissionDetail(id, new Date(useShift()));
  if (!mission) {
    return <NoMission id={id} />;
  }

  const countdown = legCountdown(mission);

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
            <p className="mt-1 text-sm text-[#edecec]/75">{formatRoute(mission.origin, mission.destination)}</p>
          </div>
          <div className="text-right">
            {mission.status === "delayed" ? (
              <p className="font-display text-5xl leading-none text-[#f54e00] min-[720px]:text-6xl">
                {mission.delayMinutes}
                <span className="ml-2 align-middle font-mono text-sm tracking-wide text-[#f54e00]/80">min</span>
              </p>
            ) : null}
            {countdown ? (
              <p className="mt-2 font-mono text-sm tabular-nums text-[#f54e00]">{countdown}</p>
            ) : null}
          </div>
        </div>
      </section>
      <section aria-label="Course">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Course</h2>
        <p className="mt-2 font-mono text-sm tabular-nums text-fg">
          {legSummary(mission)}
          {countdown ? ` · ${countdown}` : ""}
        </p>
        <div className="mt-3 overflow-hidden rounded-[28px] border border-card-04">
          <CourseMap origin={mission.origin} destination={mission.destination} flown={mission.flown} />
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
        <Fact label="Origin">
          <p className="font-display text-2xl">{mission.origin}</p>
        </Fact>
        <Fact label="Destination">
          <p className="font-display text-2xl">{mission.destination}</p>
        </Fact>
        <Fact label="Distance">
          <p className="font-display text-2xl tabular-nums">{formatDistance(mission.distanceKm)}</p>
        </Fact>
        <Fact label="Speed">
          <p className={`font-display text-2xl tabular-nums ${mission.status === "in_flight" ? "text-accent" : ""}`}>
            {formatSpeed(mission.speedKmh)}
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
        {mission.events.length === 0 ? (
          <p className="mt-3 rounded-3xl border border-dashed border-card-04 bg-card px-5 py-8 text-sm text-muted">
            No calls yet.
          </p>
        ) : (
          <ol className="mt-3 overflow-hidden rounded-3xl border border-card-04 bg-card">
            {mission.events.map((event) => (
              <li
                key={`${event.at}-${event.label}`}
                className="flex gap-4 border-t border-card-04 px-5 py-3 text-sm first:border-t-0"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    event.kind === "exception" ? "bg-accent shadow-[0_0_10px_#f54e00]" : "bg-fg/35"
                  }`}
                />
                <span className="w-24 shrink-0 tabular-nums text-muted">{formatWindow(event.at)}</span>
                <span className={event.kind === "exception" ? "text-accent" : undefined}>{event.label}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
