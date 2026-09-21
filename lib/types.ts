export const MISSION_STATUSES = [
  "queued",
  "in_flight",
  "delivered",
  "delayed",
  "scrubbed",
] as const;

export type MissionStatus = (typeof MISSION_STATUSES)[number];

export type Contract = "standing" | "spot";

export type Readiness = "ready" | "hold" | "maintenance";

export type Customer = {
  id: string;
  name: string;
  site: string;
  contract: Contract;
};

export type Vehicle = {
  id: string;
  name: string;
  readiness: Readiness;
  pad: string;
  nextMissionId: string | null;
};

export type MissionEvent = {
  at: string;
  label: string;
  kind: "standard" | "exception";
};

export type Mission = {
  id: string;
  customerId: string;
  vehicleId: string;
  cargo: string;
  origin: string;
  destination: string;
  windowStart: string;
  status: MissionStatus;
  delayMinutes: number;
  events: MissionEvent[];
};

export type BoardMission = Mission & {
  customerName: string;
  vehicleName: string;
  site: string;
};

export type MissionDetail = BoardMission & {
  customer: Customer;
  vehicle: Vehicle;
};

export type CustomerSummary = Customer & {
  openMissionCount: number;
};

export type KpiCounts = {
  onTime: number;
  inFlight: number;
  delayed: number;
  scrubbed: number;
};
