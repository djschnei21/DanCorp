import { legCountdown, legSummary } from "@/lib/format";
import type { Mission } from "@/lib/types";

type Leg = Pick<Mission, "distanceKm" | "speedKmh" | "status" | "asOf" | "liftoffAt" | "dockAt" | "flown">;

export function LegReadout({ mission, dense = false }: { mission: Leg; dense?: boolean }) {
  const countdown = legCountdown(mission);
  const text = dense ? "text-[11px]" : "text-xs";
  return (
    <span className="block">
      <span
        className={`block font-mono tabular-nums ${text} ${
          mission.status === "in_flight" ? "text-accent" : "text-fg"
        }`}
      >
        {legSummary(mission)}
      </span>
      {mission.status === "in_flight" ? (
        <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-fg/15" aria-hidden="true">
          <span className="block h-full bg-accent" style={{ width: `${mission.flown * 100}%` }} />
        </span>
      ) : null}
      {countdown ? (
        <span className={`mt-1 block font-mono tabular-nums text-accent ${text}`}>{countdown}</span>
      ) : null}
    </span>
  );
}
