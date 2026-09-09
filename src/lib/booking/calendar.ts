function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatICSDate(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function formatGoogleDate(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

interface CalendarEventData {
  businessName: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
  location?: string | null;
  notes?: string | null;
  customerName?: string;
}

export function generateGoogleCalendarUrl(data: CalendarEventData): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.serviceName} - ${data.businessName}`,
    dates: `${formatGoogleDate(data.startAt)}/${formatGoogleDate(data.endAt)}`,
    details: data.notes || `Cita: ${data.serviceName}`,
  });

  if (data.location) {
    params.set("location", data.location);
  }

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function generateICSContent(data: CalendarEventData): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@tuvitrina`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TuVitrina//Booking//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${formatICSDate(data.startAt)}`,
    `DTEND:${formatICSDate(data.endAt)}`,
    `SUMMARY:${data.serviceName} - ${data.businessName}`,
    `DESCRIPTION:${(data.notes || `Cita: ${data.serviceName}`).replace(/\n/g, "\\n")}`,
  ];

  if (data.location) {
    lines.push(`LOCATION:${data.location}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
