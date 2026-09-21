import Image from "next/image";
import Link from "next/link";
import { formatMileCount, formatMphCount, formatRoute, legTiming } from "@/lib/format";
import type { BoardMission, MissionStatus } from "@/lib/types";
import { LegReadout } from "./LegReadout";
import { StatusBadge } from "./StatusBadge";

const rail: Record<MissionStatus, string> = {
  queued: "bg-fg/25",
  in_flight: "bg-fg",
  delivered: "bg-fg/40",
  delayed: "bg-accent shadow-[0_0_10px_#f54e00]",
  scrubbed: "bg-card-04",
};

export function MissionTable({ missions }: { missions: BoardMission[] }) {
  if (missions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-card-04 bg-card px-6 py-16 text-center">
        <Image
          src="/brand/emblem.png"
          alt=""
          width={64}
          height={64}
          className="mx-auto h-16 w-16 rounded-full ring-2 ring-accent/80"
        />
        <p className="mt-5 text-sm text-muted">Nothing in this window.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-3xl border border-card-04 bg-card min-[720px]:block">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-card-01 text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Mission</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Origin</th>
              <th className="px-3 py-2 font-medium">Destination</th>
              <th className="px-3 py-2 text-right font-medium">
                Distance
                <span className="font-mono text-[10px] font-normal normal-case tracking-normal"> mi</span>
              </th>
              <th className="px-3 py-2 text-right font-medium">
                Speed
                <span className="font-mono text-[10px] font-normal normal-case tracking-normal"> mph</span>
              </th>
              <th className="px-3 py-2 font-medium">Vehicle</th>
              <th className="px-3 py-2 font-medium">Cargo</th>
              <th className="px-3 py-2 text-right font-medium">Timing</th>
              <th className="px-3 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          {missions.map((mission) => {
            const live = mission.status === "in_flight";
            return (
              <tbody key={mission.id} className="group">
                <tr
                  className={`border-t border-card-04 group-hover:bg-card-01 ${
                    mission.status === "delayed" ? "bg-accent/[0.07]" : ""
                  }`}
                >
                  <td className="relative whitespace-nowrap px-3 py-2">
                    <span className={`absolute inset-y-2 left-0 w-[3px] rounded-full ${rail[mission.status]}`} />
                    <Link href={`/missions/${mission.id}`} className="font-mono hover:text-accent">
                      {mission.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{mission.customerName}</td>
                  <td className="whitespace-nowrap px-3 py-2">{mission.origin}</td>
                  <td className="whitespace-nowrap px-3 py-2">{mission.destination}</td>
                  <td className={`whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums ${live ? "text-accent" : ""}`}>
                    {formatMileCount(mission.distanceKm)}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums ${live ? "text-accent" : ""}`}>
                    {formatMphCount(mission.speedKmh)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{mission.vehicleName}</td>
                  <td className="px-3 py-2">
                    <div className="max-w-[9.5rem] truncate" title={mission.cargo}>
                      {mission.cargo}
                    </div>
                  </td>
                  <td className={`whitespace-nowrap px-2 py-2 text-right font-mono text-[13px] tabular-nums ${live ? "text-accent" : ""}`}>
                    {legTiming(mission)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <StatusBadge status={mission.status} />
                  </td>
                </tr>
                {live ? (
                  <tr aria-hidden="true" className="group-hover:bg-card-01">
                    <td colSpan={10} className="p-0">
                      <div className="h-1 bg-fg/10">
                        <div className="h-full bg-accent" style={{ width: `${mission.flown * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            );
          })}
        </table>
      </div>
      <ul className="space-y-3 min-[720px]:hidden">
        {missions.map((mission) => (
          <li key={mission.id}>
            <Link
              href={`/missions/${mission.id}`}
              className={`block rounded-2xl border bg-card p-4 ${
                mission.status === "delayed"
                  ? "border-accent/50"
                  : "border-card-04"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm">{mission.id}</span>
                <StatusBadge status={mission.status} />
              </div>
              <p className="mt-3 font-display text-xl leading-tight">{mission.cargo}</p>
              <p className="mt-2 text-sm">{formatRoute(mission.origin, mission.destination)}</p>
              <div className="mt-2">
                <LegReadout mission={mission} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {mission.customerName} · {mission.vehicleName}
              </p>
              <p className={`mt-1 text-sm font-mono tabular-nums ${mission.status === "in_flight" ? "text-accent" : "text-muted"}`}>
                {legTiming(mission)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
