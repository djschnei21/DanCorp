import { zoneParts } from "./clock";
import type { Contract, MissionStatus, Readiness } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

export function formatUtcClock(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds} UTC`;
}

export function formatZonedClock(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = read("hour") === "24" ? "00" : read("hour");
  return `${hour}:${read("minute")}:${read("second")} ${read("timeZoneName")}`;
}

export function formatShiftDate(date: Date, timeZone: string): string {
  const parts = zoneParts(date, timeZone);
  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

export function formatShiftSpan(startIso: string, endIso: string): string {
  return `${formatWindow(startIso).slice(0, 5)}–${formatWindow(endIso)}`;
}

const KM_PER_MILE = 1.609344;

function toMiles(km: number): number {
  return km / KM_PER_MILE;
}

function groupedMiles(km: number): string {
  return Math.round(toMiles(km)).toLocaleString("en-US");
}

export function formatMileCount(km: number): string {
  return groupedMiles(km);
}

export function formatMphCount(kmh: number | null): string {
  if (kmh === null) {
    return "—";
  }
  return groupedMiles(kmh);
}

export function formatDistance(km: number): string {
  return `${groupedMiles(km)} mi`;
}

export function formatSpeed(kmh: number | null): string {
  if (kmh === null) {
    return "—";
  }
  return `${groupedMiles(kmh)} mph`;
}

export function formatRemaining(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const ss = String(secs).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

export function legSummary(mission: { distanceKm: number; speedKmh: number | null }): string {
  if (mission.speedKmh === null) {
    return formatDistance(mission.distanceKm);
  }
  return `${formatDistance(mission.distanceKm)} · ${formatSpeed(mission.speedKmh)}`;
}

export function legTiming(mission: {
  status: MissionStatus;
  windowStart: string;
  liftoffAt: string | null;
  dockAt: string | null;
}): string {
  if (mission.status === "in_flight" && mission.dockAt) {
    return `ETA ${formatWindow(mission.dockAt)}`;
  }
  if (mission.liftoffAt && mission.dockAt) {
    return `${formatWindow(mission.liftoffAt).slice(0, 5)}–${formatWindow(mission.dockAt)}`;
  }
  return formatWindow(mission.windowStart);
}

export function legCountdown(mission: {
  status: MissionStatus;
  asOf: string;
  liftoffAt: string | null;
  dockAt: string | null;
}): string | null {
  const now = Date.parse(mission.asOf);
  if (mission.status === "in_flight" && mission.dockAt) {
    const wait = Date.parse(mission.dockAt) - now;
    if (wait > 0) {
      return `Lands in ${formatRemaining(wait)}`;
    }
  }
  if ((mission.status === "queued" || mission.status === "delayed") && mission.liftoffAt) {
    const wait = Date.parse(mission.liftoffAt) - now;
    if (wait > 0) {
      return `Liftoff in ${formatRemaining(wait)}`;
    }
  }
  return null;
}

export function missionCountLabel(count: number): string {
  return count === 1 ? "1 mission" : `${count} missions`;
}
