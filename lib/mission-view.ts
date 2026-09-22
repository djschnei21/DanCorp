export const MISSION_VIEW_KEY = "dancorp.missionView";

export const MISSION_VIEW_EVENT = "dancorp-mission-view";

export type MissionViewMode = "list" | "cards";

// A missing or unknown value is list. First visit has no key.
export function readMissionView(stored: string | null): MissionViewMode {
  return stored === "cards" ? "cards" : "list";
}

export function loadMissionView(): MissionViewMode {
  try {
    return readMissionView(localStorage.getItem(MISSION_VIEW_KEY));
  } catch {
    return "list";
  }
}

export function persistMissionView(mode: MissionViewMode): void {
  try {
    localStorage.setItem(MISSION_VIEW_KEY, mode);
  } catch {
    // Private contexts can reject storage.
  }
}

// Card layout is the timeline, and only when there are missions to show.
// An empty board uses the shared empty state in the list shell.
export function activeMissionLayout(mode: MissionViewMode, count: number): MissionViewMode {
  return mode === "cards" && count > 0 ? "cards" : "list";
}
