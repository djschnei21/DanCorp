import { describe, expect, it } from "vitest";
import day from "../data/day.json";
import { customers, vehicles } from "./data";
import {
  formatDistance,
  formatRemaining,
  formatRoute,
  formatShiftDate,
  formatShiftSpan,
  formatSpeed,
  formatUtcClock,
  formatWindow,
  formatZonedClock,
  legCountdown,
} from "./format";
import { PLACES } from "./places";
import {
  filterBoard,
  getBoard,
  getCustomers,
  getFleet,
  getMissionDetail,
  kpiCounts,
} from "./missions";
import { DEMO_INSTANT, SHIFT_ZONE, describeShift, resolveMissions } from "./shift";
import { zonedTimeOnDate } from "./clock";

const SCRIPT = [
  "Cargo received",
  "Cargo at pad",
  "Vehicle at pad",
  "Cargo loaded",
  "Window open",
  "Liftoff",
  "Docked",
  "Cargo offloaded",
];

describe("the shift", () => {
  const board = getBoard(DEMO_INSTANT);
  const missions = resolveMissions(DEMO_INSTANT);

  it("has the fixed roster", () => {
    expect(customers).toHaveLength(6);
    expect(vehicles).toHaveLength(4);
    expect(day.missions).toHaveLength(12);
    expect(missions).toHaveLength(12);
    expect(day.timezone).toBe("America/New_York");
    expect(missions.every((mission) => mission.windowStart.startsWith("2026-09-21"))).toBe(true);
  });

  it("sorts the board by window", () => {
    const windows = board.map((mission) => mission.windowStart);
    expect(windows).toEqual([...windows].sort((a, b) => a.localeCompare(b)));
    expect(board.map((mission) => mission.id)).toEqual([
      "DC-1042",
      "DC-1044",
      "DC-1046",
      "DC-1048",
      "DC-1050",
      "DC-1058",
      "DC-1056",
      "DC-1054",
      "DC-1052",
      "DC-1060",
      "DC-1062",
      "DC-1064",
    ]);
    expect(board[0]?.customerName).toBe("Helios Bio");
    expect(board[0]?.vehicleName).toBe("Skiff-4");
    expect(board[0]?.origin).toBe("Harbor Station");
    expect(board[0]?.destination).toBe("Kourou");
    expect(board[0]?.windowStart).toBe("2026-09-21T10:40:00.000Z");
  });

  it("gives every mission an origin and a destination", () => {
    expect(
      board.every(
        (mission) =>
          mission.origin.length > 0 &&
          mission.destination.length > 0 &&
          mission.origin !== mission.destination &&
          (mission.origin === mission.site || mission.destination === mission.site),
      ),
    ).toBe(true);
    expect(board.find((mission) => mission.id === "DC-1052")).toMatchObject({
      origin: "Vandenberg",
      destination: "Polar Yard",
    });
    expect(board.find((mission) => mission.id === "DC-1060")).toMatchObject({
      origin: "Polar Yard",
      destination: "Kodiak",
    });
    expect(day.missions.every((mission) => mission.origin in PLACES && mission.destination in PLACES)).toBe(true);
  });

  it("marks the course flown only as far as the ship has gone", () => {
    expect(missions.filter((mission) => mission.status === "delivered").every((mission) => mission.flown === 1)).toBe(
      true,
    );
    expect(
      missions
        .filter((mission) => mission.status === "queued" || mission.status === "delayed" || mission.status === "scrubbed")
        .every((mission) => mission.flown === 0),
    ).toBe(true);
    const inFlight = missions.filter((mission) => mission.status === "in_flight");
    expect(inFlight.map((mission) => mission.id)).toEqual(["DC-1050"]);
    expect(inFlight[0]?.flown).toBeCloseTo(42 / 82, 5);
    expect(inFlight[0]?.liftoffAt).toBe("2026-09-21T13:28:00.000Z");
    expect(inFlight[0]?.dockAt).toBe("2026-09-21T14:50:00.000Z");
  });

  it("returns null for an unknown mission", () => {
    expect(getMissionDetail("DC-0000", DEMO_INSTANT)).toBeNull();
  });

  it("records delay minutes only on delayed missions", () => {
    const delayed = missions.filter((mission) => mission.status === "delayed");
    expect(delayed.map((mission) => mission.delayMinutes).sort((a, b) => a - b)).toEqual([40, 95]);
    expect(missions.filter((mission) => mission.status !== "delayed").every((mission) => mission.delayMinutes === 0)).toBe(
      true,
    );
    const later = resolveMissions(zonedTimeOnDate("2026-09-21", "12:00", SHIFT_ZONE));
    expect(later.filter((mission) => mission.status === "delayed")).toEqual([]);
    expect(later.every((mission) => mission.delayMinutes === 0)).toBe(true);
  });

  it("leaves Brine Works with no scrubbed mission", () => {
    expect(filterBoard(board, "scrubbed", "brine-works")).toEqual([]);
    expect(filterBoard(board, "scrubbed", "paperplane")).toEqual([]);
    expect(filterBoard(board, "delayed", "kite-cable").map((mission) => mission.id)).toEqual(["DC-1056"]);
    const afterMishap = getBoard(zonedTimeOnDate("2026-09-21", "16:20", SHIFT_ZONE));
    expect(filterBoard(afterMishap, "scrubbed", "paperplane").map((mission) => mission.id)).toEqual(["DC-1064"]);
    expect(filterBoard(afterMishap, "scrubbed", "brine-works")).toEqual([]);
  });

  it("counts open missions", () => {
    const rows = getCustomers(DEMO_INSTANT);
    expect(rows.find((customer) => customer.id === "helios-bio")?.openMissionCount).toBe(1);
    expect(rows.find((customer) => customer.id === "northline-metals")?.openMissionCount).toBe(1);
    expect(rows.find((customer) => customer.id === "lumen-grid")?.openMissionCount).toBe(1);
    expect(rows.find((customer) => customer.id === "kite-cable")?.openMissionCount).toBe(1);
    expect(rows.find((customer) => customer.id === "brine-works")?.openMissionCount).toBe(2);
    expect(rows.find((customer) => customer.id === "paperplane")?.openMissionCount).toBe(2);
    expect(vehicles.find((vehicle) => vehicle.id === "mule-9")?.nextMissionId).toBeNull();
    const fleet = getFleet(DEMO_INSTANT);
    expect(fleet.find((vehicle) => vehicle.id === "skiff-4")).toMatchObject({
      nextMissionId: "DC-1050",
      nextStatus: "in_flight",
    });
    expect(fleet.find((vehicle) => vehicle.id === "hopper-2")).toMatchObject({
      nextMissionId: "DC-1056",
      nextStatus: "delayed",
    });
    expect(fleet.find((vehicle) => vehicle.id === "lark-1")).toMatchObject({
      nextMissionId: "DC-1058",
      nextStatus: "delayed",
    });
    expect(fleet.find((vehicle) => vehicle.id === "mule-9")?.nextMissionId).toBeNull();
    expect(fleet.find((vehicle) => vehicle.id === "lark-1")?.readiness).toBe("hold");
    expect(fleet.find((vehicle) => vehicle.id === "mule-9")?.readiness).toBe("maintenance");
  });

  it("uses one event script, plus an exception when the flight leaves it", () => {
    for (const mission of day.missions) {
      const labels = mission.events.map((event) => event.label);
      const standard = labels.filter((label) => SCRIPT.includes(label));
      expect(standard, mission.id).toEqual(SCRIPT.slice(0, standard.length));
      const clocks = mission.events.map((event) => event.clock);
      expect(clocks, mission.id).toEqual([...clocks].sort((a, b) => a.localeCompare(b)));
    }
    const labelsFor = (id: string) => missions.find((mission) => mission.id === id)?.events.map((event) => event.label);
    expect(labelsFor("DC-1042")).toEqual(SCRIPT);
    expect(labelsFor("DC-1050")).toEqual(SCRIPT.slice(0, 6));
    expect(labelsFor("DC-1054")).toEqual(["Cargo received"]);
    expect(labelsFor("DC-1052")).toEqual([]);
    expect(labelsFor("DC-1062")).toEqual([]);
    expect(labelsFor("DC-1056")).toEqual([
      "Cargo received",
      "Cargo at pad",
      "Vehicle at pad",
      "Cargo loaded",
      "Window open",
      "Weather hold",
    ]);
    expect(labelsFor("DC-1058")).toEqual([
      "Cargo received",
      "Cargo at pad",
      "Vehicle at pad",
      "Cargo loaded",
      "Window open",
      "Vehicle hold",
    ]);
    expect(labelsFor("DC-1064")).toEqual([]);
    const exceptions = day.missions.flatMap((mission) =>
      mission.events.filter((event) => event.kind === "exception").map((event) => `${mission.id} ${event.label}`),
    );
    expect(exceptions).toEqual(["DC-1058 Vehicle hold", "DC-1056 Weather hold", "DC-1064 Loading mishap"]);
  });

  it("counts in flight, delayed, and scrubbed", () => {
    const counts = kpiCounts(missions);
    expect(counts.inFlight).toBe(1);
    expect(counts.delayed).toBe(2);
    expect(counts.scrubbed).toBe(0);
  });

  it("delayed missions are not on time", () => {
    const counts = kpiCounts(missions);
    expect(counts.onTime).toBe(4);
    expect(counts.delayed).toBe(2);
  });

  it("publishes distance and speed from the leg", () => {
    const delivered = missions.find((mission) => mission.id === "DC-1042");
    expect(delivered?.distanceKm).toBeGreaterThan(3500);
    expect(delivered?.distanceKm).toBeLessThan(4500);
    expect(delivered?.speedKmh).toBeGreaterThan(5000);
    expect(delivered?.speedKmh).toBeLessThan(8000);
    const scrubbed = resolveMissions(zonedTimeOnDate("2026-09-21", "16:20", SHIFT_ZONE)).find(
      (mission) => mission.id === "DC-1064",
    );
    expect(scrubbed?.status).toBe("scrubbed");
    expect(scrubbed?.speedKmh).toBeNull();
    expect(scrubbed?.distanceKm).toBeGreaterThan(0);
    expect(formatDistance(delivered?.distanceKm ?? 0)).toMatch(/^\d{1,3}(,\d{3})* km$/);
    expect(formatSpeed(delivered?.speedKmh ?? null)).toMatch(/^\d{1,3}(,\d{3})* km\/h$/);
    expect(formatSpeed(null)).toBe("—");
  });
});

describe("formatWindow", () => {
  it("prints UTC hours and minutes", () => {
    expect(formatWindow("2026-09-21T06:10:00.000Z")).toBe("06:10 UTC");
  });

  it("prints a route from origin to destination", () => {
    expect(formatRoute("Mojave", "Harbor Station")).toBe("Mojave → Harbor Station");
  });

  it("prints the live clocks and the remaining time", () => {
    const shift = describeShift(DEMO_INSTANT);
    expect(formatShiftDate(DEMO_INSTANT, SHIFT_ZONE)).toBe("21 Sep 2026");
    expect(formatZonedClock(DEMO_INSTANT, SHIFT_ZONE)).toBe("10:10:00 EDT");
    expect(formatUtcClock(DEMO_INSTANT)).toBe("14:10:00 UTC");
    expect(formatShiftSpan(shift.start.toISOString(), shift.end.toISOString())).toBe("10:40–21:18 UTC");
    expect(formatRemaining(40 * 60 * 1000)).toBe("40:00");
    expect(formatRemaining(5 * 3600 * 1000 + 30 * 60 * 1000)).toBe("5:30:00");
    expect(formatRemaining(59 * 1000)).toBe("0:59");
    const airborne = resolveMissions(DEMO_INSTANT).find((mission) => mission.id === "DC-1050");
    expect(legCountdown(airborne!)).toBe("Lands in 40:00");
    const held = resolveMissions(DEMO_INSTANT).find((mission) => mission.id === "DC-1056");
    expect(legCountdown(held!)).toBe("Liftoff in 38:00");
  });
});
