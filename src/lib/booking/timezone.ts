export function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

export function getLocalParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || "0";
  return {
    year: parseInt(get("year")),
    month: parseInt(get("month")),
    day: parseInt(get("day")),
    hour: parseInt(get("hour")) % 24,
    minute: parseInt(get("minute")),
  };
}

export function getLocalDayOfWeek(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  });
  const day = formatter.format(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(day);
}

export function localToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string
): Date {
  const approx = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimezoneOffsetMs(approx, timezone);
  return new Date(approx.getTime() - offset);
}

export function getDayBoundariesUTC(
  date: Date,
  timezone: string
): { start: Date; end: Date } {
  const parts = getLocalParts(date, timezone);
  const start = localToUTC(parts.year, parts.month, parts.day, 0, 0, timezone);
  const end = localToUTC(parts.year, parts.month, parts.day, 23, 59, timezone);
  return { start, end };
}

export function getLocalHoursMinutes(utcDate: Date, timezone: string) {
  const parts = getLocalParts(utcDate, timezone);
  return { hours: parts.hour, minutes: parts.minute };
}

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateLocal(date: Date, timezone: string): string {
  const parts = getLocalParts(date, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}
