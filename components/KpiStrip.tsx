import type { KpiCounts } from "@/lib/types";

const items: { key: keyof KpiCounts; label: string }[] = [
  { key: "onTime", label: "On time" },
  { key: "inFlight", label: "In flight" },
  { key: "delayed", label: "Delayed" },
  { key: "scrubbed", label: "Scrubbed" },
];

export function KpiStrip({ counts }: { counts: KpiCounts }) {
  return (
    <section aria-label="Shift counts" className="grid grid-cols-2 gap-3 min-[720px]:grid-cols-4">
      {items.map((item) => {
        const value = counts[item.key];
        const alert = item.key === "delayed" && value > 0;
        return (
          <div key={item.key} className="rounded-md border border-card-04 bg-card px-4 py-3">
            <p className="text-sm text-muted">{item.label}</p>
            <p className={`mt-1 text-4xl font-semibold tabular-nums ${alert ? "text-accent" : "text-fg"}`}>
              {value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
