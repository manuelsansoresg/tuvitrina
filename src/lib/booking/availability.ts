import { prisma } from "@/lib/prisma";
import {
  getDayBoundariesUTC,
  getLocalDayOfWeek,
  getLocalHoursMinutes,
  timeStringToMinutes,
  minutesToTimeString,
  localToUTC,
  getLocalParts,
} from "./timezone";

interface AvailableSlot {
  time: string;
  startAt: string;
  endAt: string;
}

export async function getAvailableSlots(
  cardId: string,
  serviceId: string,
  dateStr: string
): Promise<AvailableSlot[]> {
  const settings = await prisma.bookingSettings.findUnique({
    where: { cardId },
  });
  if (!settings || !settings.enabled) return [];

  const service = await prisma.bookingService.findFirst({
    where: { id: serviceId, cardId, active: true },
  });
  if (!service) return [];

  const timezone = settings.timezone;
  const slotInterval = settings.slotInterval;
  const duration = service.durationMinutes;

  const [year, month, day] = dateStr.split("-").map(Number);
  const requestedDate = new Date(year, month - 1, day);

  const today = new Date();
  const todayParts = getLocalParts(today, timezone);
  const todayStr = `${todayParts.year}-${String(todayParts.month).padStart(2, "0")}-${String(todayParts.day).padStart(2, "0")}`;

  if (dateStr < todayStr) return [];

  const dayOfWeek = getLocalDayOfWeek(requestedDate, timezone);

  const fullDayBlocks = await prisma.bookingBlock.findMany({
    where: {
      cardId,
      allDay: true,
      startAt: { lte: localToUTC(year, month, day, 23, 59, timezone) },
      endAt: { gte: localToUTC(year, month, day, 0, 0, timezone) },
    },
  });
  if (fullDayBlocks.length > 0) return [];

  const rules = await prisma.availabilityRule.findMany({
    where: { cardId, dayOfWeek, active: true },
  });
  if (rules.length === 0) return [];

  const { start: dayStartUTC, end: dayEndUTC } = getDayBoundariesUTC(requestedDate, timezone);

  const bookings = await prisma.booking.findMany({
    where: {
      cardId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: dayEndUTC },
      endAt: { gt: dayStartUTC },
    },
    select: { startAt: true, endAt: true },
  });

  const blocks = await prisma.bookingBlock.findMany({
    where: {
      cardId,
      allDay: false,
      startAt: { lt: dayEndUTC },
      endAt: { gt: dayStartUTC },
    },
    select: { startAt: true, endAt: true },
  });

  const occupied = [...bookings, ...blocks];

  const nowLocal = getLocalParts(new Date(), timezone);
  const nowMinutes = nowLocal.hour * 60 + nowLocal.minute;
  const isToday = dateStr === todayStr;

  const slots: AvailableSlot[] = [];

  for (const rule of rules) {
    const ruleStart = timeStringToMinutes(rule.startTime);
    const ruleEnd = timeStringToMinutes(rule.endTime);

    let current = ruleStart;
    while (current + duration <= ruleEnd) {
      const endMinutes = current + duration;

      if (isToday && current <= nowMinutes) {
        current += slotInterval;
        continue;
      }

      const slotStartUTC = localToUTC(year, month, day, Math.floor(current / 60), current % 60, timezone);
      const slotEndUTC = localToUTC(year, month, day, Math.floor(endMinutes / 60), endMinutes % 60, timezone);

      const hasConflict = occupied.some(
        occ => slotStartUTC < occ.endAt && slotEndUTC > occ.startAt
      );

      if (!hasConflict) {
        slots.push({
          time: minutesToTimeString(current),
          startAt: slotStartUTC.toISOString(),
          endAt: slotEndUTC.toISOString(),
        });
      }

      current += slotInterval;
    }
  }

  const seen = new Set<string>();
  const uniqueSlots = slots.filter(s => {
    if (seen.has(s.time)) return false;
    seen.add(s.time);
    return true;
  });

  uniqueSlots.sort((a, b) => a.time.localeCompare(b.time));
  return uniqueSlots;
}

export async function checkSlotAvailability(
  cardId: string,
  serviceId: string,
  startAt: Date,
  endAt: Date
): Promise<boolean> {
  const settings = await prisma.bookingSettings.findUnique({
    where: { cardId },
  });
  if (!settings || !settings.enabled) return false;

  const service = await prisma.bookingService.findFirst({
    where: { id: serviceId, cardId, active: true },
  });
  if (!service) return false;

  const bookings = await prisma.booking.findMany({
    where: {
      cardId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });
  if (bookings.length > 0) return false;

  const blocks = await prisma.bookingBlock.findMany({
    where: {
      cardId,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });
  if (blocks.length > 0) return false;

  return true;
}
