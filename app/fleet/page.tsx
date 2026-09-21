import type { Metadata } from "next";
import Link from "next/link";
import { READINESS_LABEL } from "@/lib/format";
import { getFleet } from "@/lib/missions";

export const metadata: Metadata = {
  title: "Fleet · DanCorp Dispatch",
};

export default function FleetPage() {
  const vehicles = getFleet();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Fleet</h1>
      <ul className="grid gap-3 min-[720px]:grid-cols-2">
        {vehicles.map((vehicle) => (
          <li
            key={vehicle.id}
            id={vehicle.id}
            className="rounded-md border border-card-04 bg-card px-4 py-4 scroll-mt-24"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{vehicle.name}</h2>
              <p className={vehicle.readiness === "maintenance" ? "text-sm text-muted" : "text-sm"}>
                {READINESS_LABEL[vehicle.readiness]}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted">{vehicle.pad}</p>
            <p className="mt-3 text-sm">
              {vehicle.nextMissionId ? (
                <Link href={`/missions/${vehicle.nextMissionId}`} className="font-mono hover:text-accent">
                  {vehicle.nextMissionId}
                </Link>
              ) : (
                "No assignment."
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
