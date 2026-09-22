export const TIME_FORMAT_KEY = "dancorp.timeFormat";

export const TIME_FORMAT_EVENT = "dancorp-time-format";

export type TimeFormat = "local" | "utc";

// A missing or unknown value is local. New sessions have no key.
export function readTimeFormat(stored: string | null): TimeFormat {
  return stored === "utc" ? "utc" : "local";
}

export function zoneForFormat(format: TimeFormat, localZone: string): string {
  return format === "utc" ? "UTC" : localZone;
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

// This tab's sessionStorage. A new tab or a restarted browser has no key and starts local.
export function loadTimeFormat(): TimeFormat {
  try {
    return readTimeFormat(sessionStorage.getItem(TIME_FORMAT_KEY));
  } catch {
    return "local";
  }
}

export function persistTimeFormat(format: TimeFormat): void {
  try {
    sessionStorage.setItem(TIME_FORMAT_KEY, format);
  } catch {
    // Private contexts can reject storage.
  }
}
