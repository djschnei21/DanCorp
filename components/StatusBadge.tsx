import { STATUS_LABEL } from "@/lib/format";
import type { MissionStatus } from "@/lib/types";

const tone: Record<MissionStatus, string> = {
  queued: "border-card-04 bg-card-01 text-muted",
  in_flight: "border-transparent bg-fg text-bg",
  delivered: "border-card-04 bg-card-02 text-fg",
  delayed: "border-accent/40 bg-accent/15 text-accent",
  scrubbed: "border-card-04 bg-transparent text-muted line-through",
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
