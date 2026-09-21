import { describe, expect, it } from "vitest";
import day from "../data/day.json";
import { zonedTimeOnDate } from "./clock";
import { formatWindow } from "./format";
import { PLACES } from "./places";
import { DEMO_INSTANT, SHIFT_ZONE, describeShift, resolveMissions } from "./shift";
import { distanceKm } from "./track";

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
    expect(january[0]?.windowStart).toBe("2026-01-15T11:42:00.000Z");
    const winter = describeShift(at("10:10", "2026-01-15"));
    expect(formatWindow(winter.start.toISOString())).toBe("11:42 UTC");
    expect(formatWindow(winter.end.toISOString())).toBe("21:15 UTC");
  });

  it("lands a flight when its dock time arrives", () => {
    const before = resolveMissions(at("10:00")).find((mission) => mission.id === "DC-1050");
    const almost = resolveMissions(at("10:10:59")).find((mission) => mission.id === "DC-1050");
    const landed = resolveMissions(at("10:11:00")).find((mission) => mission.id === "DC-1050");
    expect(before?.status).toBe("in_flight");
    expect(before?.flown).toBeGreaterThan(0);
    expect(before?.flown).toBeLessThan(1);
    expect(almost?.status).toBe("in_flight");
    expect(landed?.status).toBe("delivered");
    expect(landed?.flown).toBe(1);
  });

  it("keeps a nominal countdown queued and a hold delayed", () => {
    const early = resolveMissions(at("09:28")).find((mission) => mission.id === "DC-1050");
    const lifting = resolveMissions(at("09:29")).find((mission) => mission.id === "DC-1050");
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

  it("shows completed, airborne, and queued flights through the morning rush", () => {
    for (let minute = 9 * 60; minute <= 13 * 60; minute += 15) {
      const clock = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const counts = tally(clock);
      expect(counts.delivered, clock).toBeGreaterThan(0);
      expect(counts.inFlight, clock).toBeGreaterThan(0);
      expect(counts.queued, clock).toBeGreaterThan(0);
    }
  });

  it("leaves a pad gap, then one more hop, before the day goes quiet", () => {
    for (const clock of ["13:15", "13:45", "14:15"]) {
      const counts = tally(clock);
      expect(counts.delivered, clock).toBeGreaterThan(0);
      expect(counts.inFlight, clock).toBe(0);
      expect(counts.queued, clock).toBeGreaterThan(0);
    }
    for (const clock of ["14:30", "14:45", "15:00"]) {
      expect(tally(clock).inFlight, clock).toBeGreaterThan(0);
    }
    expect(tally("15:15").inFlight).toBe(0);
    expect(tally("16:00").queued).toBeGreaterThan(0);
    expect(tally("16:15").queued).toBe(0);
    expect(tally("16:15").inFlight).toBe(0);
    expect(resolveMissions(at("14:45")).find((mission) => mission.id === "DC-1060")?.status).toBe("in_flight");
    expect(resolveMissions(at("15:04")).find((mission) => mission.id === "DC-1060")?.status).toBe("delivered");
  });

  it("leaves each hull where it last arrived", () => {
    const byVehicle = new Map<string, typeof day.missions>();
    for (const mission of day.missions) {
      const rows = byVehicle.get(mission.vehicleId) ?? [];
      rows.push(mission);
      byVehicle.set(mission.vehicleId, rows);
    }
    for (const [vehicleId, rows] of byVehicle) {
      const sorted = [...rows].sort((a, b) => a.window.localeCompare(b.window));
      for (let index = 1; index < sorted.length; index += 1) {
        expect(sorted[index].origin, `${vehicleId} ${sorted[index].id}`).toBe(sorted[index - 1].destination);
      }
    }
  });

  it("flies each lane near low-orbit cruise", () => {
    for (const mission of day.missions) {
      const liftoff = mission.events.find((event) => event.label === "Liftoff");
      const dock = mission.events.find((event) => event.label === "Docked");
      if (!liftoff || !dock) {
        continue;
      }
      const miles = distanceKm(PLACES[mission.origin], PLACES[mission.destination]) / 1.609344;
      const hours = (minutes(dock.clock) - minutes(liftoff.clock)) / 60;
      const mph = miles / hours;
      expect(miles, mission.id).toBeGreaterThan(9000);
      expect(mph, mission.id).toBeGreaterThan(17000);
      expect(mph, mission.id).toBeLessThan(18000);
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
