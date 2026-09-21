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
          <div
            key={item.key}
            className={`rounded-2xl border px-4 py-4 backdrop-blur-md ${
              alert
                ? "border-accent/70 bg-card/92 shadow-[0_16px_36px_-20px_#f54e00]"
                : "border-card-04 bg-card/92 shadow-[0_22px_50px_-28px_rgba(0,0,0,0.7)]"
            }`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{item.label}</p>
            <p
              className={`mt-3 font-display text-5xl leading-none tabular-nums min-[720px]:text-6xl ${
                alert ? "text-accent" : "text-fg"
              }`}
            >
              {value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
