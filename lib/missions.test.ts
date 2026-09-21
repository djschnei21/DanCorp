import { describe, expect, it } from "vitest";
import { customers, missions, vehicles } from "./data";
import { formatRoute, formatWindow } from "./format";
import {
  filterBoard,
  getBoard,
  getCustomers,
  getMissionDetail,
  kpiCounts,
} from "./missions";

describe("the shift", () => {
  it("has the fixed roster", () => {
    expect(customers).toHaveLength(6);
    expect(vehicles).toHaveLength(4);
    expect(missions).toHaveLength(12);
    expect(missions.every((mission) => mission.windowStart.startsWith("2026-09-21"))).toBe(true);
    expect(missions.every((mission) => mission.events.length >= 3 && mission.events.length <= 8)).toBe(
      true,
    );
  });

  it("sorts the board by window", () => {
    const board = getBoard();
    const windows = board.map((mission) => mission.windowStart);
    expect(windows).toEqual([...windows].sort((a, b) => a.localeCompare(b)));
    expect(board[0]?.id).toBe("DC-1042");
    expect(board[0]?.customerName).toBe("Helios Bio");
    expect(board[0]?.vehicleName).toBe("Skiff-4");
    expect(board[0]?.origin).toBe("Harbor Station");
    expect(board[0]?.destination).toBe("Kourou");
  });

  it("gives every mission an origin and a destination", () => {
    const board = getBoard();
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
  });

  it("returns null for an unknown mission", () => {
    expect(getMissionDetail("DC-0000")).toBeNull();
  });

  it("records delay minutes only on delayed missions", () => {
    const delayed = missions.filter((mission) => mission.status === "delayed");
    expect(delayed.map((mission) => mission.delayMinutes).sort((a, b) => a - b)).toEqual([40, 95]);
    expect(missions.filter((mission) => mission.status !== "delayed").every((mission) => mission.delayMinutes === 0)).toBe(
      true,
    );
  });

  it("leaves Brine Works with no scrubbed mission", () => {
    const board = getBoard();
    expect(filterBoard(board, "scrubbed", "brine-works")).toEqual([]);
    expect(filterBoard(board, "scrubbed", "paperplane").map((mission) => mission.id)).toEqual(["DC-1064"]);
    expect(filterBoard(board, "delayed", "kite-cable").map((mission) => mission.id)).toEqual(["DC-1056"]);
  });

  it("counts open missions", () => {
    const rows = getCustomers();
    expect(rows.find((customer) => customer.id === "brine-works")?.openMissionCount).toBe(2);
    expect(rows.find((customer) => customer.id === "paperplane")?.openMissionCount).toBe(1);
    expect(vehicles.find((vehicle) => vehicle.id === "mule-9")?.nextMissionId).toBeNull();
  });

  it("uses one event script, plus an exception when the flight leaves it", () => {
    const script = [
      "Cargo received",
      "Cargo at pad",
      "Vehicle at pad",
      "Cargo loaded",
      "Window open",
      "Liftoff",
      "Docked",
      "Cargo offloaded",
    ];
    for (const mission of missions) {
      const labels = mission.events.map((event) => event.label);
      const standard = labels.filter((label) => script.includes(label));
      expect(standard).toEqual(script.slice(0, standard.length));
      const times = mission.events.map((event) => event.at);
      expect(times).toEqual([...times].sort((a, b) => a.localeCompare(b)));
    }
    const labelsFor = (id: string) => missions.find((mission) => mission.id === id)?.events.map((event) => event.label);
    expect(labelsFor("DC-1042")).toEqual(script);
    expect(labelsFor("DC-1050")).toEqual(script.slice(0, 6));
    expect(labelsFor("DC-1060")).toEqual(script.slice(0, 4));
    expect(labelsFor("DC-1062")).toEqual(script.slice(0, 4));
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
    expect(labelsFor("DC-1064")).toEqual(["Cargo received", "Cargo at pad", "Vehicle at pad", "Loading mishap"]);
    const exceptions = missions.flatMap((mission) =>
      mission.events.filter((event) => event.kind === "exception").map((event) => `${mission.id} ${event.label}`),
    );
    expect(exceptions).toEqual(["DC-1056 Weather hold", "DC-1058 Vehicle hold", "DC-1064 Loading mishap"]);
  });

  it("counts in flight, delayed, and scrubbed", () => {
    const counts = kpiCounts();
    expect(counts.inFlight).toBe(3);
    expect(counts.delayed).toBe(2);
    expect(counts.scrubbed).toBe(1);
  });

  it("delayed missions are not on time", () => {
    const counts = kpiCounts();
    expect(counts.onTime).toBe(4);
    expect(counts.delayed).toBe(2);
  });
});

describe("formatWindow", () => {
  it("prints UTC hours and minutes", () => {
    expect(formatWindow("2026-09-21T06:10:00.000Z")).toBe("06:10 UTC");
  });

  it("prints a route from origin to destination", () => {
    expect(formatRoute("Mojave", "Harbor Station")).toBe("Mojave → Harbor Station");
  });
});
