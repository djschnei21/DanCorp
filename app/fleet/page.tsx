import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { READINESS_LABEL } from "@/lib/format";
import { getFleet } from "@/lib/missions";
import { vehiclePortrait } from "@/lib/portraits";
import type { Readiness } from "@/lib/types";

export const metadata: Metadata = {
  title: "Fleet · DanCorp Dispatch",
};

const readinessTone: Record<Readiness, string> = {
  ready: "bg-[#edecec] text-[#14120b]",
  hold: "border border-[#edecec]/40 bg-[#14120b]/55 text-[#edecec]",
  maintenance: "border border-[#edecec]/25 bg-[#14120b]/45 text-[#edecec]/70",
};

export default function FleetPage() {
  const vehicles = getFleet();

  return (
    <div className="space-y-8">
      <PageHeader kicker="Vehicles" title="Fleet" detail="4 vehicles." />
      <ul className="grid gap-4 min-[720px]:grid-cols-2">
        {vehicles.map((vehicle) => (
          <li
            key={vehicle.id}
            id={vehicle.id}
            className="scroll-mt-24 overflow-hidden rounded-[28px] border border-card-04 bg-card"
          >
            <div className="relative h-64">
              <Image
                src={vehiclePortrait[vehicle.id]}
                alt=""
                fill
                quality={90}
                sizes="(min-width: 720px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#14120b_0%,rgba(20,18,11,0.55)_28%,transparent_58%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 py-4">
                <div>
                  <h2 className="font-display text-4xl text-[#edecec]">{vehicle.name}</h2>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[#edecec]/70">{vehicle.pad}</p>
                </div>
                <p className={`rounded-full px-2.5 py-1 text-xs font-medium ${readinessTone[vehicle.readiness]}`}>
                  {READINESS_LABEL[vehicle.readiness]}
                </p>
              </div>
            </div>
            <p className="border-t border-card-04 px-5 py-3 text-sm">
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
