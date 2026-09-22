import { afterEach, describe, expect, it, vi } from "vitest";
import { formatShiftDate, formatShiftSpan, formatUtcClock, formatWindow, formatZonedClock, legTiming } from "./format";
import { DEMO_INSTANT, SHIFT_ZONE, describeShift, resolveMissions } from "./shift";
import { TIME_FORMAT_KEY, loadTimeFormat, persistTimeFormat, readTimeFormat, zoneForFormat } from "./time-format";

describe("readTimeFormat", () => {
  it("defaults to local for a new session", () => {
    expect(readTimeFormat(null)).toBe("local");
    expect(readTimeFormat("")).toBe("local");
    expect(readTimeFormat("local")).toBe("local");
    expect(readTimeFormat("eastern")).toBe("local");
  });

  it("accepts utc only as an explicit choice", () => {
    expect(readTimeFormat("utc")).toBe("utc");
    expect(readTimeFormat("UTC")).toBe("local");
  });
});

describe("zoneForFormat", () => {
  it("uses the browser zone for local and UTC otherwise", () => {
    expect(zoneForFormat("local", "America/Los_Angeles")).toBe("America/Los_Angeles");
    expect(zoneForFormat("utc", "America/Los_Angeles")).toBe("UTC");
  });
});

describe("session storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads local when the session has no stored choice", () => {
    expect(loadTimeFormat()).toBe("local");
  });

  it("keeps the choice in sessionStorage for this session only", () => {
    const session = new Map<string, string>();
    const durable = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => {
        session.set(key, value);
      },
    });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => durable.get(key) ?? null,
      setItem: (key: string, value: string) => {
        durable.set(key, value);
      },
    });

    persistTimeFormat("utc");
    expect(session.get(TIME_FORMAT_KEY)).toBe("utc");
    expect(loadTimeFormat()).toBe("utc");
    expect(durable.size).toBe(0);

    session.clear();
    expect(loadTimeFormat()).toBe("local");
  });
});

describe("displayed times follow the zone", () => {
  it("prints windows in the selected zone", () => {
    expect(formatWindow("2026-09-21T14:10:00.000Z", "UTC")).toBe("14:10 UTC");
    expect(formatWindow("2026-09-21T14:10:00.000Z", "America/New_York")).toBe("10:10 EDT");
    expect(formatWindow("2026-09-21T14:10:00.000Z", "America/Los_Angeles")).toBe("07:10 PDT");
  });

  it("prints the shift span and the live clock in that zone", () => {
    const shift = describeShift(DEMO_INSTANT);
    expect(formatShiftSpan(shift.start.toISOString(), shift.end.toISOString(), SHIFT_ZONE)).toBe("06:42–16:15 EDT");
    expect(formatShiftSpan(shift.start.toISOString(), shift.end.toISOString(), "UTC")).toBe("10:42–20:15 UTC");
    expect(formatZonedClock(DEMO_INSTANT, "UTC")).toBe(formatUtcClock(DEMO_INSTANT));
    expect(formatZonedClock(DEMO_INSTANT, SHIFT_ZONE)).toBe("10:10:00 EDT");
    expect(formatShiftDate(new Date("2026-09-22T03:30:00.000Z"), "UTC")).toBe("22 Sep 2026");
    expect(formatShiftDate(new Date("2026-09-22T03:30:00.000Z"), SHIFT_ZONE)).toBe("21 Sep 2026");
  });

  it("prints leg timing in the selected zone", () => {
    const airborne = resolveMissions(DEMO_INSTANT).find((mission) => mission.id === "DC-1050");
    expect(legTiming(airborne!, "UTC")).toBe("ETA 14:11 UTC");
    expect(legTiming(airborne!, SHIFT_ZONE)).toBe("ETA 10:11 EDT");
    const delivered = resolveMissions(DEMO_INSTANT).find((mission) => mission.id === "DC-1042");
    expect(legTiming(delivered!, SHIFT_ZONE)).toBe("06:50–07:32 EDT");
  });
});
