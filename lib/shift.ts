import dayFile from "../data/day.json";
import { zoneYmd, zonedTimeOnDate } from "./clock";
import { PLACES } from "./places";
import { distanceKm, speedKmh } from "./track";
import type { Mission, MissionEvent, MissionStatus } from "./types";

type DayEvent = {
  clock: string;
  label: string;
  kind: "standard" | "exception";
};

type DayMission = {
  id: string;
  customerId: string;
  vehicleId: string;
  cargo: string;
  origin: string;
  destination: string;
  window: string;
  delayMinutes: number;
  events: DayEvent[];
};

type DayFile = {
  timezone: string;
  missions: DayMission[];
};

const day = dayFile as DayFile;

export const SHIFT_ZONE = day.timezone;

// 10:10 Eastern on a September day: four delivered, two delayed, one in flight.
// The on-time test freezes here.
export const DEMO_INSTANT = new Date("2026-09-21T14:10:00.000Z");

function clockOn(ymd: string, clock: string): string {
  return zonedTimeOnDate(ymd, clock, SHIFT_ZONE).toISOString();
}

function plannedHours(liftoffMs: number | null, dockMs: number | null): number {
  if (liftoffMs === null || dockMs === null || dockMs <= liftoffMs) {
    return 0;
  }
  return (dockMs - liftoffMs) / 3_600_000;
}

function resolveOne(plan: DayMission, ymd: string, now: Date): Mission {
  const timed = plan.events.map((event) => ({
    at: clockOn(ymd, event.clock),
    label: event.label,
    kind: event.kind,
  }));
  const atMs = (label: string) => {
    const event = timed.find((item) => item.label === label);
    return event ? Date.parse(event.at) : null;
  };
  const liftoffMs = atMs("Liftoff");
  const dockMs = atMs("Docked");
  const mishapMs = atMs("Loading mishap");
  const windowMs = Date.parse(clockOn(ymd, plan.window));
  const nowMs = now.getTime();

  let status: MissionStatus = "queued";
  let flown = 0;
  // A hold counts only after the window opens and before liftoff.
  // The eight minutes of a nominal countdown stay queued.
  let delayMinutes = 0;

  if (mishapMs !== null && nowMs >= mishapMs) {
    status = "scrubbed";
  } else if (dockMs !== null && nowMs >= dockMs) {
    status = "delivered";
    flown = 1;
  } else if (liftoffMs !== null && dockMs !== null && nowMs >= liftoffMs && nowMs < dockMs) {
    status = "in_flight";
    flown = (nowMs - liftoffMs) / (dockMs - liftoffMs);
  } else if (plan.delayMinutes > 0 && nowMs >= windowMs && (liftoffMs === null || nowMs < liftoffMs)) {
    status = "delayed";
    delayMinutes = plan.delayMinutes;
  }

  const origin = PLACES[plan.origin];
  const destination = PLACES[plan.destination];
  if (!origin || !destination) {
    throw new Error(`Missing place for ${plan.id}`);
  }
  const km = distanceKm(origin, destination);
  const visible: MissionEvent[] = timed
    .filter((event) => Date.parse(event.at) <= nowMs)
    .sort((a, b) => a.at.localeCompare(b.at));

  return {
    id: plan.id,
    customerId: plan.customerId,
    vehicleId: plan.vehicleId,
    cargo: plan.cargo,
    origin: plan.origin,
    destination: plan.destination,
    flown,
    windowStart: new Date(windowMs).toISOString(),
    status,
    delayMinutes,
    events: visible,
    distanceKm: km,
    speedKmh: status === "scrubbed" ? null : speedKmh(km, plannedHours(liftoffMs, dockMs)),
    asOf: now.toISOString(),
    liftoffAt: liftoffMs === null ? null : new Date(liftoffMs).toISOString(),
    dockAt: dockMs === null ? null : new Date(dockMs).toISOString(),
  };
}

export function knownMission(id: string): boolean {
  return day.missions.some((mission) => mission.id === id);
}

export function resolveMissions(now: Date = new Date()): Mission[] {
  const ymd = zoneYmd(now, SHIFT_ZONE);
  return day.missions.map((plan) => resolveOne(plan, ymd, now));
}

export function describeShift(now: Date = new Date()): { zone: string; start: Date; end: Date } {
  const ymd = zoneYmd(now, SHIFT_ZONE);
  const windows = day.missions.map((mission) => mission.window).sort();
  const clocks = day.missions.flatMap((mission) => mission.events.map((event) => event.clock)).sort();
  return {
    zone: SHIFT_ZONE,
    start: zonedTimeOnDate(ymd, windows[0], SHIFT_ZONE),
    end: zonedTimeOnDate(ymd, clocks[clocks.length - 1], SHIFT_ZONE),
  };
}
