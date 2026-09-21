export type ZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function zoneParts(date: Date, timeZone: string): ZoneParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  let hour = Number(readPart(parts, "hour"));
  if (hour === 24) {
    hour = 0;
  }
  return {
    year: Number(readPart(parts, "year")),
    month: Number(readPart(parts, "month")),
    day: Number(readPart(parts, "day")),
    hour,
    minute: Number(readPart(parts, "minute")),
    second: Number(readPart(parts, "second")),
  };
}

export function zoneYmd(date: Date, timeZone: string): string {
  const parts = zoneParts(date, timeZone);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

// Wall clocks in data/day.json have no date. The offset is read from the
// instant so the same 9–5 stays on Eastern time across EST and EDT.
export function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = zoneParts(date, timeZone);
  const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wallAsUtc - date.getTime();
}

export function zonedTimeOnDate(ymd: string, clock: string, timeZone: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  const [hour, minute, second = 0] = clock.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let utc = wallAsUtc - zoneOffsetMs(new Date(wallAsUtc), timeZone);
  utc = wallAsUtc - zoneOffsetMs(new Date(utc), timeZone);
  return new Date(utc);
}
