import { customers, missions, vehicles } from "./data";
import type {
  BoardMission,
  Customer,
  CustomerSummary,
  KpiCounts,
  Mission,
  MissionDetail,
  MissionStatus,
  Vehicle,
} from "./types";
import { MISSION_STATUSES } from "./types";

function requireCustomer(id: string): Customer {
  const customer = customers.find((item) => item.id === id);
  if (!customer) {
    throw new Error(`Missing customer ${id}`);
  }
  return customer;
}

function requireVehicle(id: string): Vehicle {
  const vehicle = vehicles.find((item) => item.id === id);
  if (!vehicle) {
    throw new Error(`Missing vehicle ${id}`);
  }
  return vehicle;
}

export function isMissionStatus(value: string | null): value is MissionStatus {
  return MISSION_STATUSES.some((status) => status === value);
}

export function isOpenStatus(status: MissionStatus): boolean {
  return status !== "delivered" && status !== "scrubbed";
}

export function kpiCounts(source: Mission[] = missions): KpiCounts {
  return {
    onTime: source.filter(
      (mission) => mission.status === "delivered" || mission.status === "delayed",
    ).length,
    inFlight: source.filter((mission) => mission.status === "in_flight").length,
    delayed: source.filter((mission) => mission.status === "delayed").length,
    scrubbed: source.filter((mission) => mission.status === "scrubbed").length,
  };
}

export function getBoard(source: Mission[] = missions): BoardMission[] {
  return source
    .map((mission) => {
      const customer = requireCustomer(mission.customerId);
      const vehicle = requireVehicle(mission.vehicleId);
      return {
        ...mission,
        customerName: customer.name,
        vehicleName: vehicle.name,
        site: customer.site,
      };
    })
    .sort((a, b) => a.windowStart.localeCompare(b.windowStart));
}

export function filterBoard(
  board: BoardMission[],
  status: string,
  customerId: string,
): BoardMission[] {
  return board.filter((mission) => {
    const statusOk = status === "all" || mission.status === status;
    const customerOk = customerId === "all" || mission.customerId === customerId;
    return statusOk && customerOk;
  });
}

export function getMissionDetail(id: string): MissionDetail | null {
  const row = getBoard().find((mission) => mission.id === id);
  if (!row) {
    return null;
  }
  return {
    ...row,
    customer: requireCustomer(row.customerId),
    vehicle: requireVehicle(row.vehicleId),
  };
}

export function getFleet(): Vehicle[] {
  return vehicles.map((vehicle) => ({ ...vehicle }));
}

export function getCustomers(): CustomerSummary[] {
  return customers.map((customer) => ({
    ...customer,
    openMissionCount: missions.filter(
      (mission) => mission.customerId === customer.id && isOpenStatus(mission.status),
    ).length,
  }));
}
