"use client";

import { useSyncExternalStore } from "react";
import { SHIFT_ZONE } from "@/lib/shift";
import {
  TIME_FORMAT_EVENT,
  browserTimeZone,
  loadTimeFormat,
  persistTimeFormat,
  zoneForFormat,
  type TimeFormat,
} from "@/lib/time-format";

type TimeDisplay = {
  format: TimeFormat;
  timeZone: string;
};

// The server render cannot see the browser zone. The shift zone keeps that
// first paint stable; the client snapshot replaces it after hydration.
const SERVER_DISPLAY: TimeDisplay = { format: "local", timeZone: SHIFT_ZONE };

let clientDisplay: TimeDisplay = SERVER_DISPLAY;

const options: { value: TimeFormat; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "utc", label: "UTC" },
];

function subscribe(listener: () => void) {
  window.addEventListener(TIME_FORMAT_EVENT, listener);
  return () => window.removeEventListener(TIME_FORMAT_EVENT, listener);
}

function getSnapshot(): TimeDisplay {
  const format = loadTimeFormat();
  const timeZone = zoneForFormat(format, browserTimeZone());
  if (clientDisplay.format === format && clientDisplay.timeZone === timeZone) {
    return clientDisplay;
  }
  clientDisplay = { format, timeZone };
  return clientDisplay;
}

export function useTimeDisplay(): TimeDisplay {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_DISPLAY);
}

export function selectTimeFormat(format: TimeFormat): void {
  persistTimeFormat(format);
  window.dispatchEvent(new Event(TIME_FORMAT_EVENT));
}

export function TimeFormatToggle() {
  const { format } = useTimeDisplay();

  return (
    <div
      id="time-format"
      role="group"
      aria-label="Time format"
      className="flex items-center rounded-full border border-card-04 bg-card p-1"
    >
      {options.map((option) => {
        const selected = format === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => selectTimeFormat(option.value)}
            className={`rounded-full px-2.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected ? "bg-fg text-bg" : "text-fg hover:bg-card-01"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
