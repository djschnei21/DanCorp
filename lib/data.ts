import type { Customer, Vehicle } from "./types";

export const customers: Customer[] = [
  { id: "helios-bio", name: "Helios Bio", site: "Kourou", contract: "standing" },
  { id: "northline-metals", name: "Northline Metals", site: "Vandenberg", contract: "standing" },
  { id: "lumen-grid", name: "Lumen Grid", site: "Wallops", contract: "spot" },
  { id: "kite-cable", name: "Kite & Cable", site: "Mojave", contract: "standing" },
  { id: "brine-works", name: "Brine Works", site: "Kodiak", contract: "spot" },
  { id: "paperplane", name: "Paperplane", site: "Boca Chica", contract: "spot" },
];

export const vehicles: Vehicle[] = [
  { id: "skiff-4", name: "Skiff-4", readiness: "ready", pad: "Pad A", nextMissionId: null },
  { id: "hopper-2", name: "Hopper-2", readiness: "ready", pad: "Pad B", nextMissionId: null },
  { id: "lark-1", name: "Lark-1", readiness: "hold", pad: "Pad C", nextMissionId: null },
  { id: "mule-9", name: "Mule-9", readiness: "maintenance", pad: "Hangar 2", nextMissionId: null },
];
