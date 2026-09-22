import Link from "next/link";
import { useTimeDisplay } from "@/components/TimeFormatToggle";
import { formatRoute, formatWindow } from "@/lib/format";
import type { BoardMission, MissionStatus } from "@/lib/types";
import { LegReadout } from "./LegReadout";
import { StatusBadge } from "./StatusBadge";

function dot(status: MissionStatus): string {
  if (status === "delayed") {
    return "bg-accent shadow-[0_0_12px_#f54e00]";
  }
  if (status === "in_flight") {
    return "bg-fg";
  }
  if (status === "scrubbed") {
    return "bg-card-04";
  }
  return "bg-fg/35";
}

export function MissionTimeline({ missions }: { missions: BoardMission[] }) {
  const { timeZone } = useTimeDisplay();
  if (missions.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex gap-3">
        {missions.map((mission) => (
          <li key={mission.id} className="w-56 shrink-0">
            <Link
              href={`/missions/${mission.id}`}
              className={`block rounded-2xl border bg-card px-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                mission.status === "delayed"
                  ? "border-accent/60"
                  : "border-card-04 hover:border-fg/25"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${dot(mission.status)}`} />
                <span className="font-mono text-[11px] tabular-nums text-muted">
                  {formatWindow(mission.windowStart, timeZone)}
                </span>
              </span>
              <span className="mt-3 block font-mono text-xs text-muted">{mission.id}</span>
              <span className="mt-1 block truncate text-sm">{mission.cargo}</span>
              <span className="mt-1 block truncate text-xs text-muted">
                {formatRoute(mission.origin, mission.destination)}
              </span>
              <span className="mt-2 block">
                <LegReadout mission={mission} dense />
              </span>
              <span className="mt-3 block">
                <StatusBadge status={mission.status} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
