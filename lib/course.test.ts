import { describe, expect, it } from "vitest";
import { PLACARDS } from "./chart";
import { chartLabels, headingDegrees, layCourse, onIce, onLand, quad, shoreDistance } from "./course";
import day from "../data/day.json";
import { zonedTimeOnDate } from "./clock";
import { PLACES } from "./places";
import { resolveMissions } from "./shift";

const GROUND = ["Kourou", "Vandenberg", "Mojave", "Wallops", "Boca Chica", "Kodiak"] as const;
const COASTAL = ["Kourou", "Vandenberg", "Wallops", "Boca Chica", "Kodiak"] as const;

describe("the chart", () => {
  it("puts ground sites on land and stations in open water", () => {
    for (const name of GROUND) {
      const place = PLACES[name];
      expect(onLand(place.lon, place.lat), name).toBe(true);
      expect(onIce(place.lon, place.lat), name).toBe(false);
    }
    for (const name of ["Harbor Station", "Polar Yard"] as const) {
      const place = PLACES[name];
      expect(onLand(place.lon, place.lat), name).toBe(false);
      expect(onIce(place.lon, place.lat), name).toBe(false);
      expect(shoreDistance(place.lon, place.lat), name).toBeGreaterThan(4);
    }
  });

  it("keeps the pads on the shore and Mojave inland", () => {
    for (const name of COASTAL) {
      const place = PLACES[name];
      expect(shoreDistance(place.lon, place.lat), name).toBeLessThan(1.8);
    }
    expect(shoreDistance(PLACES.Mojave.lon, PLACES.Mojave.lat)).toBeGreaterThan(2.2);
  });

  it("names water in the water and land on the land", () => {
    for (const placard of PLACARDS) {
      expect(onLand(placard.lon, placard.lat), placard.text).toBe(!placard.water);
      expect(onIce(placard.lon, placard.lat), placard.text).toBe(false);
    }
  });

  it("shows the same sea names on the routes that cross them", () => {
    expect(labelsFor("Harbor Station", "Kourou")).toEqual(expect.arrayContaining(["GLASS SEA", "VERGE"]));
    expect(labelsFor("Vandenberg", "Polar Yard")).toEqual(expect.arrayContaining(["QUIET WATER", "HINGE"]));
    expect(labelsFor("Vandenberg", "Harbor Station")).toEqual(
      expect.arrayContaining(["GLASS SEA", "VERGE", "AMBER GULF", "CINDER"]),
    );
    expect(labelsFor("Polar Yard", "Kodiak")).toEqual(expect.arrayContaining(["DRIFT"]));
  });

  it("points the in-flight arrow along the track", () => {
    const inFlight = resolveMissions(zonedTimeOnDate("2026-09-21", "12:00", "America/New_York")).filter(
      (mission) => mission.status === "in_flight",
    );
    expect(inFlight.length).toBeGreaterThan(0);
    for (const mission of inFlight) {
      const course = layCourse(PLACES[mission.origin], PLACES[mission.destination], mission.flown);
      const ahead = quad(course.frame.from, course.bend, course.frame.to, Math.min(0.97, mission.flown + 0.05));
      const dx = ahead.x - course.marker.x;
      const dy = ahead.y - course.marker.y;
      const radians = (course.degrees * Math.PI) / 180;
      expect(Math.cos(radians) * dx + Math.sin(radians) * dy, mission.id).toBeGreaterThan(0);
    }
  });

  it("keeps the middle of every course over water", () => {
    const crossings: string[] = [];
    for (const mission of day.missions) {
      const course = layCourse(PLACES[mission.origin], PLACES[mission.destination], 0.5);
      for (let i = 5; i <= 35; i += 1) {
        const point = quad(course.frame.from, course.bend, course.frame.to, i / 40);
        const geo = course.frame.unproject(point);
        if (onLand(geo.lon, geo.lat)) {
          crossings.push(`${mission.id} t=${(i / 40).toFixed(2)} ${geo.lon.toFixed(1)},${geo.lat.toFixed(1)}`);
        }
      }
    }
    expect(crossings).toEqual([]);
  });

  it("matches the arrow to the curve tangent", () => {
    const course = layCourse(PLACES.Wallops, PLACES["Harbor Station"], 0.18);
    expect(course.degrees).toBeCloseTo(headingDegrees(course.frame.from, course.bend, course.frame.to, 0.18), 5);
    expect(Number.isFinite(course.degrees)).toBe(true);
  });
});

function labelsFor(origin: string, destination: string): string[] {
  const course = layCourse(PLACES[origin], PLACES[destination], 0);
  return chartLabels(course.frame, course.frame.from, course.bend, course.frame.to).map((placard) => placard.text);
}
