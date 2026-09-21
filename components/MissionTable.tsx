import Link from "next/link";
import { formatWindow } from "@/lib/format";
import type { BoardMission } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function MissionTable({ missions }: { missions: BoardMission[] }) {
  if (missions.length === 0) {
    return <p className="text-sm text-muted">Nothing in this window.</p>;
  }

  return (
    <>
      <div className="hidden min-[720px]:block">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">Mission</th>
              <th className="py-2 pr-3 font-medium">Customer</th>
              <th className="py-2 pr-3 font-medium">Vehicle</th>
              <th className="py-2 pr-3 font-medium">Cargo</th>
              <th className="py-2 pr-3 font-medium">Window</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.id} className="border-t border-card-04 hover:bg-card-01">
                <td className="py-2 pr-3">
                  <Link href={`/missions/${mission.id}`} className="font-mono hover:text-accent">
                    {mission.id}
                  </Link>
                </td>
                <td className="py-2 pr-3">
                  <div>{mission.customerName}</div>
                  <div className="text-muted">{mission.site}</div>
                </td>
                <td className="py-2 pr-3">{mission.vehicleName}</td>
                <td className="py-2 pr-3">{mission.cargo}</td>
                <td className="py-2 pr-3 tabular-nums">{formatWindow(mission.windowStart)}</td>
                <td className="py-2">
                  <StatusBadge status={mission.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 min-[720px]:hidden">
        {missions.map((mission) => (
          <li key={mission.id}>
            <Link
              href={`/missions/${mission.id}`}
              className="block rounded-md border border-card-04 bg-card p-4 hover:bg-card-01"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-sm">{mission.id}</span>
                <StatusBadge status={mission.status} />
              </div>
              <p className="mt-2">{mission.cargo}</p>
              <p className="mt-1 text-sm text-muted">
                {mission.customerName} · {mission.vehicleName}
              </p>
              <p className="mt-1 text-sm tabular-nums text-muted">{formatWindow(mission.windowStart)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
