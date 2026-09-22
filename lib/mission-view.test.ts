import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MISSION_VIEW_KEY,
  activeMissionLayout,
  loadMissionView,
  persistMissionView,
  readMissionView,
} from "./mission-view";

describe("readMissionView", () => {
  it("defaults to list when the browser has no preference", () => {
    expect(readMissionView(null)).toBe("list");
    expect(readMissionView("")).toBe("list");
    expect(readMissionView("list")).toBe("list");
    expect(readMissionView("grid")).toBe("list");
    expect(readMissionView("CARDS")).toBe("list");
  });

  it("accepts cards only as an explicit choice", () => {
    expect(readMissionView("cards")).toBe("cards");
  });
});

describe("activeMissionLayout", () => {
  it("shows one layout, and list when the board is empty", () => {
    expect(activeMissionLayout("list", 4)).toBe("list");
    expect(activeMissionLayout("cards", 4)).toBe("cards");
    expect(activeMissionLayout("cards", 0)).toBe("list");
    expect(activeMissionLayout("list", 0)).toBe("list");
  });
});

describe("local storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads list when nothing is stored", () => {
    expect(loadMissionView()).toBe("list");
  });

  it("restores the last mode from localStorage across a new read", () => {
    const durable = new Map<string, string>();
    const session = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => durable.get(key) ?? null,
      setItem: (key: string, value: string) => {
        durable.set(key, value);
      },
    });
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => {
        session.set(key, value);
      },
    });

    persistMissionView("cards");
    expect(durable.get(MISSION_VIEW_KEY)).toBe("cards");
    expect(loadMissionView()).toBe("cards");
    expect(session.size).toBe(0);

    persistMissionView("list");
    expect(loadMissionView()).toBe("list");
  });

  it("stays on list when storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    });

    expect(loadMissionView()).toBe("list");
    expect(() => persistMissionView("cards")).not.toThrow();
  });
});
