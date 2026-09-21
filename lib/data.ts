import type { Customer, Mission, MissionEvent, MissionStatus, Vehicle } from "./types";

const DAY = "2026-09-21";

function windowAt(hhmm: string): string {
  return `${DAY}T${hhmm}:00.000Z`;
}

function shift(windowStart: string, minutes: number): string {
  return new Date(Date.parse(windowStart) + minutes * 60_000).toISOString();
}

// One script for every flight. A mission keeps the prefix it has reached.
// An exception is an extra line; it does not rename a standard callout.
const STANDARD_EVENTS: { minutes: number; label: string }[] = [
  { minutes: -90, label: "Cargo received" },
  { minutes: -40, label: "Cargo at pad" },
  { minutes: -15, label: "Vehicle at pad" },
  { minutes: -8, label: "Cargo loaded" },
  { minutes: 0, label: "Window open" },
  { minutes: 8, label: "Liftoff" },
  { minutes: 36, label: "Docked" },
  { minutes: 44, label: "Cargo offloaded" },
];

const REACHED: Record<MissionStatus, number> = {
  queued: 4,
  scrubbed: 3,
  delayed: 5,
  in_flight: 6,
  delivered: 8,
};

const EXCEPTIONS: Record<string, { minutes: number; label: string }> = {
  "DC-1056": { minutes: 6, label: "Weather hold" },
  "DC-1058": { minutes: 12, label: "Vehicle hold" },
  "DC-1064": { minutes: -10, label: "Loading mishap" },
};

function eventsFor(id: string, status: MissionStatus, windowStart: string): MissionEvent[] {
  const events: MissionEvent[] = STANDARD_EVENTS.slice(0, REACHED[status]).map((event) => ({
    at: shift(windowStart, event.minutes),
    label: event.label,
    kind: "standard",
  }));
  const exception = EXCEPTIONS[id];
  if (exception) {
    events.push({
      at: shift(windowStart, exception.minutes),
      label: exception.label,
      kind: "exception",
    });
  }
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

function mission(
  input: Omit<Mission, "events" | "delayMinutes" | "flown"> & { delayMinutes?: number; flown?: number },
): Mission {
  return {
    delayMinutes: 0,
    flown: input.status === "delivered" ? 1 : 0,
    ...input,
    events: eventsFor(input.id, input.status, input.windowStart),
  };
}

export const customers: Customer[] = [
  { id: "helios-bio", name: "Helios Bio", site: "Kourou", contract: "standing" },
  { id: "northline-metals", name: "Northline Metals", site: "Vandenberg", contract: "standing" },
  { id: "lumen-grid", name: "Lumen Grid", site: "Wallops", contract: "spot" },
  { id: "kite-cable", name: "Kite & Cable", site: "Mojave", contract: "standing" },
  { id: "brine-works", name: "Brine Works", site: "Kodiak", contract: "spot" },
  { id: "paperplane", name: "Paperplane", site: "Boca Chica", contract: "spot" },
];

export const vehicles: Vehicle[] = [
  { id: "skiff-4", name: "Skiff-4", readiness: "ready", pad: "Pad A", nextMissionId: "DC-1050" },
  { id: "hopper-2", name: "Hopper-2", readiness: "ready", pad: "Pad B", nextMissionId: "DC-1052" },
  { id: "lark-1", name: "Lark-1", readiness: "hold", pad: "Pad C", nextMissionId: "DC-1058" },
  { id: "mule-9", name: "Mule-9", readiness: "maintenance", pad: "Hangar 2", nextMissionId: null },
];

export const missions: Mission[] = [
  mission({
    id: "DC-1042",
    customerId: "helios-bio",
    vehicleId: "skiff-4",
    cargo: "Station blood samples",
    origin: "Harbor Station",
    destination: "Kourou",
    windowStart: windowAt("06:10"),
    status: "delivered",
  }),
  mission({
    id: "DC-1044",
    customerId: "northline-metals",
    vehicleId: "hopper-2",
    cargo: "Reflector blanks",
    origin: "Vandenberg",
    destination: "Harbor Station",
    windowStart: windowAt("07:25"),
    status: "delivered",
  }),
  mission({
    id: "DC-1046",
    customerId: "lumen-grid",
    vehicleId: "skiff-4",
    cargo: "Spare comms node",
    origin: "Wallops",
    destination: "Harbor Station",
    windowStart: windowAt("08:40"),
    status: "delivered",
  }),
  mission({
    id: "DC-1048",
    customerId: "kite-cable",
    vehicleId: "hopper-2",
    cargo: "Tether spool",
    origin: "Mojave",
    destination: "Harbor Station",
    windowStart: windowAt("09:55"),
    status: "delivered",
  }),
  mission({
    id: "DC-1050",
    customerId: "helios-bio",
    vehicleId: "skiff-4",
    cargo: "Cold-stow cultures",
    origin: "Kourou",
    destination: "Harbor Station",
    windowStart: windowAt("11:10"),
    status: "in_flight",
    // These three windows do not overlap, so the snapshot gives each ship its own place on the course.
    flown: 0.72,
  }),
  mission({
    id: "DC-1052",
    customerId: "northline-metals",
    vehicleId: "hopper-2",
    cargo: "Ingot coupons",
    origin: "Vandenberg",
    destination: "Polar Yard",
    windowStart: windowAt("12:20"),
    status: "in_flight",
    flown: 0.46,
  }),
  mission({
    id: "DC-1054",
    customerId: "lumen-grid",
    vehicleId: "skiff-4",
    cargo: "Relay pallet",
    origin: "Wallops",
    destination: "Harbor Station",
    windowStart: windowAt("13:30"),
    status: "in_flight",
    flown: 0.18,
  }),
  mission({
    id: "DC-1056",
    customerId: "kite-cable",
    vehicleId: "hopper-2",
    cargo: "Winch housing",
    origin: "Mojave",
    destination: "Harbor Station",
    windowStart: windowAt("14:15"),
    status: "delayed",
    delayMinutes: 40,
  }),
  mission({
    id: "DC-1058",
    customerId: "paperplane",
    vehicleId: "lark-1",
    cargo: "Film camera",
    origin: "Boca Chica",
    destination: "Harbor Station",
    windowStart: windowAt("15:00"),
    status: "delayed",
    delayMinutes: 95,
  }),
  mission({
    id: "DC-1060",
    customerId: "brine-works",
    vehicleId: "lark-1",
    cargo: "Water recycler cartridge",
    origin: "Polar Yard",
    destination: "Kodiak",
    windowStart: windowAt("16:10"),
    status: "queued",
  }),
  mission({
    id: "DC-1062",
    customerId: "brine-works",
    vehicleId: "hopper-2",
    cargo: "Brine filter stack",
    origin: "Kodiak",
    destination: "Polar Yard",
    windowStart: windowAt("17:25"),
    status: "queued",
  }),
  mission({
    id: "DC-1064",
    customerId: "paperplane",
    vehicleId: "skiff-4",
    cargo: "Second camera body",
    origin: "Boca Chica",
    destination: "Harbor Station",
    windowStart: windowAt("18:40"),
    status: "scrubbed",
  }),
];
