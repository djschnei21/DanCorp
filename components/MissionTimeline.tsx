import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { BoardMission } from "@/lib/types";

export function MissionTimeline({ missions }: { missions: BoardMission[] }) {
  if (missions.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex gap-3">
        {missions.map((mission) => (
          <li key={mission.id}>
            <Link
              href={`/missions/${mission.id}`}
              className="flex w-40 shrink-0 flex-col gap-1 rounded-md border border-card-04 bg-card px-3 py-2 hover:bg-card-01 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="font-mono text-xs">{mission.id}</span>
              <span className="truncate text-sm">{mission.cargo}</span>
              <StatusBadge status={mission.status} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
