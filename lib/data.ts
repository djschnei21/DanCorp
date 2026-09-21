import type { Customer, Mission, MissionEvent, MissionStatus, Vehicle } from "./types";

const DAY = "2026-09-21";

function windowAt(hhmm: string): string {
  return `${DAY}T${hhmm}:00.000Z`;
}

function shift(windowStart: string, minutes: number): string {
  return new Date(Date.parse(windowStart) + minutes * 60_000).toISOString();
}

function eventsFor(status: MissionStatus, windowStart: string): MissionEvent[] {
  if (status === "delivered") {
    return [
      { at: shift(windowStart, -30), label: "Cargo at pad" },
      { at: shift(windowStart, 0), label: "Window open" },
      { at: shift(windowStart, 8), label: "Liftoff" },
      { at: shift(windowStart, 41), label: "Berthing confirmed" },
    ];
  }
  if (status === "in_flight") {
    return [
      { at: shift(windowStart, -25), label: "Cargo at pad" },
      { at: shift(windowStart, 0), label: "Window open" },
      { at: shift(windowStart, 7), label: "Liftoff" },
      { at: shift(windowStart, 18), label: "Coasting" },
    ];
  }
  if (status === "delayed") {
    return [
      { at: shift(windowStart, -40), label: "Cargo at pad" },
      { at: shift(windowStart, -15), label: "Hold called" },
      { at: shift(windowStart, 0), label: "Window open" },
      { at: shift(windowStart, 20), label: "Still on the pad" },
    ];
  }
  if (status === "scrubbed") {
    return [
      { at: shift(windowStart, -50), label: "Cargo at pad" },
      { at: shift(windowStart, -20), label: "Range hold" },
      { at: shift(windowStart, 0), label: "Window scrubbed" },
    ];
  }
  return [
    { at: shift(windowStart, -90), label: "Cargo received" },
    { at: shift(windowStart, -40), label: "Stacked" },
    { at: shift(windowStart, 0), label: "Waiting on window" },
  ];
}

function mission(
  input: Omit<Mission, "events" | "delayMinutes"> & { delayMinutes?: number },
): Mission {
  return {
    delayMinutes: 0,
    ...input,
    events: eventsFor(input.status, input.windowStart),
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
    windowStart: windowAt("06:10"),
    status: "delivered",
  }),
  mission({
    id: "DC-1044",
    customerId: "northline-metals",
    vehicleId: "hopper-2",
    cargo: "Reflector blanks",
    windowStart: windowAt("07:25"),
    status: "delivered",
  }),
  mission({
    id: "DC-1046",
    customerId: "lumen-grid",
    vehicleId: "skiff-4",
    cargo: "Spare comms node",
    windowStart: windowAt("08:40"),
    status: "delivered",
  }),
  mission({
    id: "DC-1048",
    customerId: "kite-cable",
    vehicleId: "hopper-2",
    cargo: "Tether spool",
    windowStart: windowAt("09:55"),
    status: "delivered",
  }),
  mission({
    id: "DC-1050",
    customerId: "helios-bio",
    vehicleId: "skiff-4",
    cargo: "Cold-stow cultures",
    windowStart: windowAt("11:10"),
    status: "in_flight",
  }),
  mission({
    id: "DC-1052",
    customerId: "northline-metals",
    vehicleId: "hopper-2",
    cargo: "Ingot coupons",
    windowStart: windowAt("12:20"),
    status: "in_flight",
  }),
  mission({
    id: "DC-1054",
    customerId: "lumen-grid",
    vehicleId: "skiff-4",
    cargo: "Relay pallet",
    windowStart: windowAt("13:30"),
    status: "in_flight",
  }),
  mission({
    id: "DC-1056",
    customerId: "kite-cable",
    vehicleId: "hopper-2",
    cargo: "Winch housing",
    windowStart: windowAt("14:15"),
    status: "delayed",
    delayMinutes: 40,
  }),
  mission({
    id: "DC-1058",
    customerId: "paperplane",
    vehicleId: "lark-1",
    cargo: "Film camera",
    windowStart: windowAt("15:00"),
    status: "delayed",
    delayMinutes: 95,
  }),
  mission({
    id: "DC-1060",
    customerId: "brine-works",
    vehicleId: "lark-1",
    cargo: "Water recycler cartridge",
    windowStart: windowAt("16:10"),
    status: "queued",
  }),
  mission({
    id: "DC-1062",
    customerId: "brine-works",
    vehicleId: "hopper-2",
    cargo: "Brine filter stack",
    windowStart: windowAt("17:25"),
    status: "queued",
  }),
  mission({
    id: "DC-1064",
    customerId: "paperplane",
    vehicleId: "skiff-4",
    cargo: "Second camera body",
    windowStart: windowAt("18:40"),
    status: "scrubbed",
  }),
];
