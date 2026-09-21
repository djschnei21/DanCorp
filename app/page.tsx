import Image from "next/image";
import { KpiStrip } from "@/components/KpiStrip";
import { MissionBoard } from "@/components/MissionBoard";
import { getBoard, getCustomers, kpiCounts } from "@/lib/missions";

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customer?: string }>;
}) {
  const params = await searchParams;
  const missions = getBoard();
  const customers = getCustomers();

  return (
    <div className="space-y-8">
      <section className="relative">
        <div className="relative h-[22rem] overflow-hidden rounded-[28px] min-[720px]:h-[28rem]">
          <Image
            src="/brand/earth.png"
            alt=""
            fill
            priority
            quality={90}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover object-[center_62%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#14120b_0%,rgba(20,18,11,0.78)_22%,rgba(20,18,11,0.18)_52%,transparent_78%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#14120b_0%,rgba(20,18,11,0.72)_16%,transparent_46%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(237,236,236,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(237,236,236,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_right,black,transparent_55%)]" />
          <span className="pointer-events-none absolute left-4 top-4 h-7 w-7 border-l-2 border-t-2 border-[#f54e00]" />
          <span className="pointer-events-none absolute right-4 top-4 h-7 w-7 border-r border-t border-[#edecec]/35" />
          <div className="absolute left-6 top-7 right-6 min-[720px]:left-9 min-[720px]:top-9">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#f54e00]">21 Sep 2026</p>
            <h1 className="mt-2 font-display text-6xl text-[#edecec] min-[720px]:text-7xl">Dispatch</h1>
            <p className="mt-3 font-mono text-sm tracking-wide text-[#edecec]/80">06:10–18:40 UTC</p>
          </div>
        </div>
        <div className="relative z-10 -mt-24 px-3 min-[720px]:-mt-28 min-[720px]:px-6">
          <KpiStrip counts={kpiCounts()} />
        </div>
      </section>
      <MissionBoard
        missions={missions}
        customers={customers}
        initialStatus={params.status ?? "all"}
        initialCustomer={params.customer ?? "all"}
      />
    </div>
  );
}
