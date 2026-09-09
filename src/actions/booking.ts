"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, BookingStatus } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/constants";
import { PlanType } from "@prisma/client";
import { getAvailableSlots, checkSlotAvailability } from "@/lib/booking/availability";
import { localToUTC, getDayBoundariesUTC } from "@/lib/booking/timezone";
import { createRemindersForBooking } from "@/lib/booking/reminders";

async function getCardForUser(cardId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const where = cardId
    ? { id: cardId, userId: session.user.id }
    : { userId: session.user.id };

  const card = await prisma.businessCard.findFirst({ where });
  if (!card) return null;

  const isAdmin = session.user.role === Role.ADMIN;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  const limits = isAdmin
    ? PLAN_LIMITS.PREMIUM
    : PLAN_LIMITS[user.plan as PlanType] || PLAN_LIMITS.EXPRESS;

  return { card, user, limits, isAdmin };
}

// ─── SETTINGS ──────────────────────────────────────────────

export async function getBookingSettings() {
  const ctx = await getCardForUser();
  if (!ctx) return null;
  const settings = await prisma.bookingSettings.findUnique({
    where: { cardId: ctx.card.id },
  });
  return settings || { cardId: ctx.card.id, enabled: false, slotInterval: 30, timezone: "America/Merida" };
}

const UpdateSettingsSchema = z.object({
  enabled: z.boolean(),
  slotInterval: z.number().int().min(5).max(120),
  timezone: z.string().min(1),
});

export async function updateBookingSettings(prevState: unknown, formData: FormData) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };

  if (!ctx.limits.allowBooking && !ctx.isAdmin) {
    return { message: "Tu plan no incluye agenda" };
  }

  const raw = {
    enabled: formData.get("enabled") === "true",
    slotInterval: parseInt(formData.get("slotInterval") as string) || 30,
    timezone: (formData.get("timezone") as string) || "America/Merida",
  };

  const parsed = UpdateSettingsSchema.safeParse(raw);
  if (!parsed.success) return { message: "Datos inválidos" };

  await prisma.bookingSettings.upsert({
    where: { cardId: ctx.card.id },
    update: parsed.data,
    create: { cardId: ctx.card.id, ...parsed.data },
  });

  revalidatePath("/dashboard/agenda");
  revalidatePath(`/${ctx.card.slug}`);
  return { message: "Configuración guardada", success: true };
}

// ─── SERVICES ──────────────────────────────────────────────

export async function getBookingServices() {
  const ctx = await getCardForUser();
  if (!ctx) return [];
  return prisma.bookingService.findMany({
    where: { cardId: ctx.card.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

const CreateServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0).optional(),
  active: z.boolean(),
  order: z.number().int().min(0),
});

export async function createBookingService(prevState: unknown, formData: FormData) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };
  if (!ctx.limits.allowBooking && !ctx.isAdmin) return { message: "Tu plan no incluye agenda" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    durationMinutes: parseInt(formData.get("durationMinutes") as string) || 30,
    price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
    active: formData.get("active") !== "false",
    order: parseInt(formData.get("order") as string) || 0,
  };

  const parsed = CreateServiceSchema.safeParse(raw);
  if (!parsed.success) return { message: "Datos inválidos" };

  await prisma.bookingService.create({
    data: { cardId: ctx.card.id, ...parsed.data },
  });

  revalidatePath("/dashboard/agenda");
  return { message: "Servicio creado", success: true };
}

export async function updateBookingService(prevState: unknown, formData: FormData) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };
  if (!ctx.limits.allowBooking && !ctx.isAdmin) return { message: "Tu plan no incluye agenda" };

  const id = formData.get("id") as string;
  if (!id) return { message: "ID requerido" };

  const existing = await prisma.bookingService.findFirst({
    where: { id, cardId: ctx.card.id },
  });
  if (!existing) return { message: "Servicio no encontrado" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    durationMinutes: parseInt(formData.get("durationMinutes") as string) || 30,
    price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
    active: formData.get("active") === "true",
    order: parseInt(formData.get("order") as string) || 0,
  };

  const parsed = CreateServiceSchema.safeParse(raw);
  if (!parsed.success) return { message: "Datos inválidos" };

  await prisma.bookingService.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/agenda");
  return { message: "Servicio actualizado", success: true };
}

export async function deleteBookingService(serviceId: string) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };

  const existing = await prisma.bookingService.findFirst({
    where: { id: serviceId, cardId: ctx.card.id },
  });
  if (!existing) return { message: "Servicio no encontrado" };

  await prisma.bookingService.delete({ where: { id: serviceId } });
  revalidatePath("/dashboard/agenda");
  return { message: "Servicio eliminado", success: true };
}

export async function toggleBookingService(serviceId: string, active: boolean) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };

  const existing = await prisma.bookingService.findFirst({
    where: { id: serviceId, cardId: ctx.card.id },
  });
  if (!existing) return { message: "Servicio no encontrado" };

  await prisma.bookingService.update({
    where: { id: serviceId },
    data: { active },
  });

  revalidatePath("/dashboard/agenda");
  return { message: "Servicio actualizado", success: true };
}

// ─── AVAILABILITY RULES ────────────────────────────────────

export async function getAvailabilityRules() {
  const ctx = await getCardForUser();
  if (!ctx) return [];
  return prisma.availabilityRule.findMany({
    where: { cardId: ctx.card.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function saveAvailabilityRules(prevState: unknown, formData: FormData) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };
  if (!ctx.limits.allowBooking && !ctx.isAdmin) return { message: "Tu plan no incluye agenda" };

  const rulesJson = formData.get("rules") as string;
  if (!rulesJson) return { message: "Datos inválidos" };

  let rules: Array<{ dayOfWeek: number; startTime: string; endTime: string; active: boolean }>;
  try {
    rules = JSON.parse(rulesJson);
  } catch {
    return { message: "Datos inválidos" };
  }

  if (!Array.isArray(rules)) return { message: "Datos inválidos" };

  await prisma.$transaction(async (tx) => {
    await tx.availabilityRule.deleteMany({ where: { cardId: ctx.card.id } });
    if (rules.length > 0) {
      await tx.availabilityRule.createMany({
        data: rules.map(r => ({
          cardId: ctx.card.id,
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
          active: r.active !== false,
        })),
      });
    }
  });

  revalidatePath("/dashboard/agenda");
  return { message: "Horarios guardados", success: true };
}

// ─── BOOKING BLOCKS ────────────────────────────────────────

export async function getBookingBlocks() {
  const ctx = await getCardForUser();
  if (!ctx) return [];
  return prisma.bookingBlock.findMany({
    where: { cardId: ctx.card.id },
    orderBy: { startAt: "asc" },
  });
}

const CreateBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  allDay: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().max(200).optional(),
});

export async function createBookingBlock(prevState: unknown, formData: FormData) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };
  if (!ctx.limits.allowBooking && !ctx.isAdmin) return { message: "Tu plan no incluye agenda" };

  const settings = await prisma.bookingSettings.findUnique({ where: { cardId: ctx.card.id } });
  const timezone = settings?.timezone || "America/Merida";

  const raw = {
    date: formData.get("date") as string,
    allDay: formData.get("allDay") === "true",
    startTime: (formData.get("startTime") as string) || undefined,
    endTime: (formData.get("endTime") as string) || undefined,
    reason: (formData.get("reason") as string) || undefined,
  };

  const parsed = CreateBlockSchema.safeParse(raw);
  if (!parsed.success) return { message: "Datos inválidos" };

  const [year, month, day] = parsed.data.date.split("-").map(Number);

  let startAt: Date;
  let endAt: Date;

  if (parsed.data.allDay) {
    startAt = localToUTC(year, month, day, 0, 0, timezone);
    endAt = localToUTC(year, month, day, 23, 59, timezone);
  } else {
    if (!parsed.data.startTime || !parsed.data.endTime) {
      return { message: "Hora de inicio y fin requeridas" };
    }
    const [sh, sm] = parsed.data.startTime.split(":").map(Number);
    const [eh, em] = parsed.data.endTime.split(":").map(Number);
    startAt = localToUTC(year, month, day, sh, sm, timezone);
    endAt = localToUTC(year, month, day, eh, em, timezone);
  }

  await prisma.bookingBlock.create({
    data: {
      cardId: ctx.card.id,
      startAt,
      endAt,
      allDay: parsed.data.allDay,
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath("/dashboard/agenda");
  return { message: "Bloqueo creado", success: true };
}

export async function deleteBookingBlock(blockId: string) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };

  const existing = await prisma.bookingBlock.findFirst({
    where: { id: blockId, cardId: ctx.card.id },
  });
  if (!existing) return { message: "Bloqueo no encontrado" };

  await prisma.bookingBlock.delete({ where: { id: blockId } });
  revalidatePath("/dashboard/agenda");
  return { message: "Bloqueo eliminado", success: true };
}

// ─── BOOKINGS (owner) ─────────────────────────────────────

export async function getOwnerBookings(statusFilter?: string) {
  const ctx = await getCardForUser();
  if (!ctx) return [];

  const where: Record<string, unknown> = { cardId: ctx.card.id };
  if (statusFilter && statusFilter !== "ALL") {
    where.status = statusFilter;
  }

  return prisma.booking.findMany({
    where,
    include: { service: { select: { name: true, durationMinutes: true, price: true } } },
    orderBy: { startAt: "desc" },
    take: 100,
  });
}

export async function getBookingsForDate(dateStr: string) {
  const ctx = await getCardForUser();
  if (!ctx) return [];

  const settings = await prisma.bookingSettings.findUnique({ where: { cardId: ctx.card.id } });
  const timezone = settings?.timezone || "America/Merida";

  const [year, month, day] = dateStr.split("-").map(Number);
  const { start, end } = getDayBoundariesUTC(new Date(year, month - 1, day), timezone);

  return prisma.booking.findMany({
    where: {
      cardId: ctx.card.id,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      startAt: { gte: start },
      endAt: { lte: end },
    },
    include: { service: { select: { name: true, durationMinutes: true } } },
    orderBy: { startAt: "asc" },
  });
}

const UpdateBookingStatusSchema = z.object({
  bookingId: z.string(),
  status: z.nativeEnum(BookingStatus),
});

export async function updateBookingStatus(prevState: unknown, formData: FormData) {
  const ctx = await getCardForUser();
  if (!ctx) return { message: "No autenticado" };

  const raw = {
    bookingId: formData.get("bookingId") as string,
    status: formData.get("status") as BookingStatus,
  };

  const parsed = UpdateBookingStatusSchema.safeParse(raw);
  if (!parsed.success) return { message: "Datos inválidos" };

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.bookingId, cardId: ctx.card.id },
  });
  if (!booking) return { message: "Reserva no encontrada" };

  const validTransitions: Record<string, BookingStatus[]> = {
    PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  };

  const allowed = validTransitions[booking.status];
  if (!allowed || !allowed.includes(parsed.data.status)) {
    return { message: "Transición de estado no válida" };
  }

  await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === BookingStatus.CANCELLED) {
    await prisma.bookingReminder.updateMany({
      where: { bookingId: parsed.data.bookingId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }

  revalidatePath("/dashboard/agenda");
  return { message: "Estado actualizado", success: true };
}

// ─── PUBLIC ACTIONS ────────────────────────────────────────

export async function getPublicBookingData(slug: string) {
  const card = await prisma.businessCard.findUnique({
    where: { slug, active: true },
    include: { user: { select: { plan: true } } },
  });
  if (!card) return null;

  const settings = await prisma.bookingSettings.findUnique({
    where: { cardId: card.id },
  });
  if (!settings || !settings.enabled) return null;

  const services = await prisma.bookingService.findMany({
    where: { cardId: card.id, active: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  if (services.length === 0) return null;

  return {
    cardId: card.id,
    businessName: card.title,
    location: card.location,
    timezone: settings.timezone,
    slotInterval: settings.slotInterval,
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: s.price,
    })),
  };
}

export async function getPublicAvailableSlots(
  cardId: string,
  serviceId: string,
  date: string
) {
  return getAvailableSlots(cardId, serviceId, date);
}

const CreateBookingSchema = z.object({
  cardId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(5).max(20),
  customerEmail: z.string().email().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export async function createBooking(prevState: unknown, formData: FormData) {
  const raw = {
    cardId: formData.get("cardId") as string,
    serviceId: formData.get("serviceId") as string,
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    customerName: formData.get("customerName") as string,
    customerPhone: formData.get("customerPhone") as string,
    customerEmail: (formData.get("customerEmail") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = CreateBookingSchema.safeParse(raw);
  if (!parsed.success) return { message: "Datos inválidos", error: true };

  const card = await prisma.businessCard.findUnique({
    where: { id: parsed.data.cardId, active: true },
  });
  if (!card) return { message: "Negocio no encontrado", error: true };

  const settings = await prisma.bookingSettings.findUnique({
    where: { cardId: parsed.data.cardId },
  });
  if (!settings || !settings.enabled) return { message: "Agenda no disponible", error: true };

  const service = await prisma.bookingService.findFirst({
    where: { id: parsed.data.serviceId, cardId: parsed.data.cardId, active: true },
  });
  if (!service) return { message: "Servicio no disponible", error: true };

  const timezone = settings.timezone;
  const [year, month, day] = parsed.data.date.split("-").map(Number);
  const [sh, sm] = parsed.data.startTime.split(":").map(Number);

  const startAt = localToUTC(year, month, day, sh, sm, timezone);
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);

  const available = await checkSlotAvailability(parsed.data.cardId, service.id, startAt, endAt);
  if (!available) {
    return { message: "Este horario acaba de ser reservado. Selecciona otro horario disponible.", error: true };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findMany({
        where: {
          cardId: parsed.data.cardId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });

      if (existing.length > 0) {
        throw new Error("SLOT_TAKEN");
      }

      const existingBlocks = await tx.bookingBlock.findMany({
        where: {
          cardId: parsed.data.cardId,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });

      if (existingBlocks.length > 0) {
        throw new Error("SLOT_BLOCKED");
      }

      return tx.booking.create({
        data: {
          cardId: parsed.data.cardId,
          serviceId: service.id,
          customerName: parsed.data.customerName.trim(),
          customerPhone: parsed.data.customerPhone.trim(),
          customerEmail: parsed.data.customerEmail?.trim() || null,
          notes: parsed.data.notes?.trim() || null,
          startAt,
          endAt,
          status: BookingStatus.PENDING,
        },
      });
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath(`/${card.slug}`);

    createRemindersForBooking(booking.id).catch(console.error);

    return {
      success: true,
      booking: {
        id: booking.id,
        serviceName: service.name,
        businessName: card.title,
        date: parsed.data.date,
        startTime: parsed.data.startTime,
        durationMinutes: service.durationMinutes,
        status: booking.status,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        location: card.location,
        notes: parsed.data.notes,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return { message: "Este horario acaba de ser reservado. Selecciona otro horario disponible.", error: true };
    }
    if (err instanceof Error && err.message === "SLOT_BLOCKED") {
      return { message: "Este horario ya no está disponible.", error: true };
    }
    console.error("Error creating booking:", err);
    return { message: "Error al crear la reserva", error: true };
  }
}

// ─── STATS ─────────────────────────────────────────────────

export async function getBookingStats() {
  const ctx = await getCardForUser();
  if (!ctx) return null;

  const now = new Date();
  const settings = await prisma.bookingSettings.findUnique({ where: { cardId: ctx.card.id } });
  const timezone = settings?.timezone || "America/Merida";
  const { start: todayStart, end: todayEnd } = getDayBoundariesUTC(now, timezone);

  const [todayCount, pendingCount, confirmedCount, upcomingCount] = await Promise.all([
    prisma.booking.count({
      where: {
        cardId: ctx.card.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { gte: todayStart },
        endAt: { lte: todayEnd },
      },
    }),
    prisma.booking.count({
      where: { cardId: ctx.card.id, status: "PENDING" },
    }),
    prisma.booking.count({
      where: { cardId: ctx.card.id, status: "CONFIRMED" },
    }),
    prisma.booking.count({
      where: {
        cardId: ctx.card.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { gte: now },
      },
    }),
  ]);

  return { todayCount, pendingCount, confirmedCount, upcomingCount };
}
