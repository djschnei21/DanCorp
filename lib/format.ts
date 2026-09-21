import type { Contract, MissionStatus, Readiness } from "./types";

export const STATUS_LABEL: Record<MissionStatus, string> = {
  queued: "Queued",
  in_flight: "In flight",
  delivered: "Delivered",
  delayed: "Delayed",
  scrubbed: "Scrubbed",
};

export const READINESS_LABEL: Record<Readiness, string> = {
  ready: "Ready",
  hold: "Hold",
  maintenance: "Maintenance",
};

export const CONTRACT_LABEL: Record<Contract, string> = {
  standing: "Standing",
  spot: "Spot",
};

export function formatRoute(origin: string, destination: string): string {
  return `${origin} → ${destination}`;
}

export function formatWindow(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes} UTC`;
}

export function missionCountLabel(count: number): string {
  return count === 1 ? "1 mission" : `${count} missions`;
}
