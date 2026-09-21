import { describe, expect, it } from "vitest";
import day from "../data/day.json";
import { zonedTimeOnDate } from "./clock";
import { formatWindow } from "./format";
import { DEMO_INSTANT, SHIFT_ZONE, describeShift, resolveMissions } from "./shift";

function at(clock: string, ymd = "2026-09-21"): Date {
  return zonedTimeOnDate(ymd, clock, SHIFT_ZONE);
}

function tally(clock: string) {
  const missions = resolveMissions(at(clock));
  return {
    delivered: missions.filter((mission) => mission.status === "delivered").length,
    inFlight: missions.filter((mission) => mission.status === "in_flight").length,
    queued: missions.filter((mission) => mission.status === "queued").length,
  };
}

function minutes(clock: string): number {
  const [hour, minute] = clock.split(":").map(Number);
  return hour * 60 + minute;
}

describe("the eastern day", () => {
  it("keeps wall clocks and moves the calendar day", () => {
    const september = resolveMissions(DEMO_INSTANT);
    const nextDay = resolveMissions(at("10:10", "2026-09-22"));
    const january = resolveMissions(at("10:10", "2026-01-15"));
    expect(september.map((mission) => mission.status)).toEqual(nextDay.map((mission) => mission.status));
    expect(september.map((mission) => mission.status)).toEqual(january.map((mission) => mission.status));
    expect(nextDay[0]?.windowStart.startsWith("2026-09-22")).toBe(true);
    expect(january[0]?.windowStart).toBe("2026-01-15T11:40:00.000Z");
    const winter = describeShift(at("10:10", "2026-01-15"));
    expect(formatWindow(winter.start.toISOString())).toBe("11:40 UTC");
    expect(formatWindow(winter.end.toISOString())).toBe("22:18 UTC");
  });

  it("lands a flight when its dock time arrives", () => {
    const before = resolveMissions(at("10:30")).find((mission) => mission.id === "DC-1050");
    const almost = resolveMissions(at("10:49:59")).find((mission) => mission.id === "DC-1050");
    const landed = resolveMissions(at("10:50:00")).find((mission) => mission.id === "DC-1050");
    expect(before?.status).toBe("in_flight");
    expect(before?.flown).toBeGreaterThan(0);
    expect(before?.flown).toBeLessThan(1);
    expect(almost?.status).toBe("in_flight");
    expect(landed?.status).toBe("delivered");
    expect(landed?.flown).toBe(1);
  });

  it("keeps a nominal countdown queued and a hold delayed", () => {
    const early = resolveMissions(at("09:27")).find((mission) => mission.id === "DC-1050");
    const lifting = resolveMissions(at("09:28")).find((mission) => mission.id === "DC-1050");
    expect(early?.status).toBe("queued");
    expect(early?.delayMinutes).toBe(0);
    expect(lifting?.status).toBe("in_flight");
    expect(lifting?.flown).toBe(0);
    const beforeWindow = resolveMissions(at("09:59")).find((mission) => mission.id === "DC-1056");
    const holding = resolveMissions(at("10:05")).find((mission) => mission.id === "DC-1056");
    expect(beforeWindow?.status).toBe("queued");
    expect(beforeWindow?.delayMinutes).toBe(0);
    expect(holding?.status).toBe("delayed");
    expect(holding?.delayMinutes).toBe(40);
    expect(holding?.events.map((event) => event.label)).not.toContain("Weather hold");
  });

  it("shows completed, airborne, and queued flights through the workday", () => {
    for (let minute = 9 * 60; minute <= 16 * 60; minute += 15) {
      const clock = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const counts = tally(clock);
      expect(counts.delivered, clock).toBeGreaterThan(0);
      expect(counts.inFlight, clock).toBeGreaterThan(0);
      expect(counts.queued, clock).toBeGreaterThan(0);
    }
    for (const clock of ["16:15", "16:30", "16:45", "17:00"]) {
      const counts = tally(clock);
      expect(counts.delivered, clock).toBeGreaterThan(0);
      expect(counts.inFlight, clock).toBeGreaterThan(0);
    }
    expect(tally("16:15").queued).toBe(0);
    expect(tally("17:00").queued).toBe(0);
    expect(resolveMissions(at("17:00")).find((mission) => mission.id === "DC-1062")?.status).toBe("in_flight");
    expect(resolveMissions(at("17:10")).find((mission) => mission.id === "DC-1062")?.status).toBe("delivered");
    expect(tally("17:10").inFlight).toBe(0);
  });

  it("keeps a ship in the air from 08:10 through 17:09", () => {
    for (let minute = minutes("08:10"); minute <= minutes("17:09"); minute += 1) {
      const clock = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      expect(tally(clock).inFlight, clock).toBeGreaterThan(0);
    }
  });

  it("does not put one vehicle on two pads", () => {
    const busy = new Map<string, { id: string; start: number; end: number }[]>();
    for (const mission of day.missions) {
      const start = mission.events.find((event) => event.label === "Vehicle at pad");
      const end = mission.events.find((event) => event.label === "Cargo offloaded" || event.label === "Loading mishap");
      expect(start, mission.id).toBeTruthy();
      expect(end, mission.id).toBeTruthy();
      const rows = busy.get(mission.vehicleId) ?? [];
      rows.push({ id: mission.id, start: minutes(start!.clock), end: minutes(end!.clock) });
      busy.set(mission.vehicleId, rows);
    }
    for (const [vehicleId, rows] of busy) {
      const sorted = [...rows].sort((a, b) => a.start - b.start);
      for (let index = 1; index < sorted.length; index += 1) {
        expect(sorted[index].start, `${vehicleId} ${sorted[index].id}`).toBeGreaterThanOrEqual(sorted[index - 1].end);
      }
    }
  });
});
