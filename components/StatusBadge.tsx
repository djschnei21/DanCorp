import { STATUS_LABEL } from "@/lib/format";
import type { MissionStatus } from "@/lib/types";

const tone: Record<MissionStatus, string> = {
  queued: "text-muted",
  in_flight: "text-fg",
  delivered: "text-fg",
  delayed: "text-accent",
  scrubbed: "text-muted",
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return <span className={`text-sm ${tone[status]}`}>{STATUS_LABEL[status]}</span>;
}
