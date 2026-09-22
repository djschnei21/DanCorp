"use client";

import { useSyncExternalStore } from "react";
import {
  MISSION_VIEW_EVENT,
  loadMissionView,
  persistMissionView,
  type MissionViewMode,
} from "@/lib/mission-view";

const options: { value: MissionViewMode; label: string }[] = [
  { value: "list", label: "List view" },
  { value: "cards", label: "Card view" },
];

function subscribe(listener: () => void) {
  window.addEventListener(MISSION_VIEW_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(MISSION_VIEW_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): MissionViewMode {
  return loadMissionView();
}

// The server cannot see localStorage. List is the first-visit default, so this
// snapshot matches a browser with no stored preference. A stored card choice
// replaces it after hydration.
export function useMissionView(): MissionViewMode {
  return useSyncExternalStore(subscribe, getSnapshot, () => "list");
}

export function selectMissionView(mode: MissionViewMode): void {
  persistMissionView(mode);
  window.dispatchEvent(new Event(MISSION_VIEW_EVENT));
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

export function MissionViewToggle() {
  const mode = useMissionView();

  return (
    <div
      id="mission-view"
      role="group"
      aria-label="Mission view"
      className="flex items-center rounded-full border border-card-04 bg-card p-1"
    >
      {options.map((option) => {
        const selected = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => selectMissionView(option.value)}
            className={`rounded-full p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected ? "bg-fg text-bg" : "text-fg hover:bg-card-01"
            }`}
          >
            {option.value === "list" ? <ListIcon /> : <CardsIcon />}
          </button>
        );
      })}
    </div>
  );
}
