import { prisma } from "@/lib/prisma";

interface ReminderProvider {
  send(to: string, subject: string, body: string): Promise<boolean>;
}

class NoopReminderProvider implements ReminderProvider {
  async send(_to: string, _subject: string, _body: string): Promise<boolean> {
    console.log("[ReminderProvider] NoopProvider: reminder would be sent");
    return true;
  }
}

let provider: ReminderProvider = new NoopReminderProvider();

export function setReminderProvider(p: ReminderProvider) {
  provider = p;
}

export async function processReminders() {
  const now = new Date();

  const pendingReminders = await prisma.bookingReminder.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { lte: now },
    },
    include: {
      booking: {
        include: {
          service: true,
          card: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const reminder of pendingReminders) {
    const booking = reminder.booking;

    if (booking.status === "CANCELLED") {
      await prisma.bookingReminder.update({
        where: { id: reminder.id },
        data: { status: "CANCELLED" },
      });
      continue;
    }

    const recipient = booking.customerEmail || booking.customerPhone;
    if (!recipient) {
      await prisma.bookingReminder.update({
        where: { id: reminder.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
        },
      });
      failed++;
      continue;
    }

    const subject = `Recordatorio: ${booking.service.name} - ${booking.card.title}`;
    const startDate = new Date(booking.startAt);
    const body = [
      `Hola ${booking.customerName},`,
      ``,
      `Te recordamos tu cita:`,
      `Servicio: ${booking.service.name}`,
      `Negocio: ${booking.card.title}`,
      `Fecha: ${startDate.toLocaleDateString("es-MX")}`,
      `Hora: ${startDate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`,
      `Duración: ${booking.service.durationMinutes} min`,
      booking.notes ? `Notas: ${booking.notes}` : "",
    ].filter(Boolean).join("\n");

    try {
      const success = await provider.send(recipient, subject, body);
      await prisma.bookingReminder.update({
        where: { id: reminder.id },
        data: {
          status: success ? "SENT" : "FAILED",
          sentAt: success ? new Date() : undefined,
          attempts: { increment: 1 },
        },
      });
      if (success) sent++;
      else failed++;
    } catch {
      await prisma.bookingReminder.update({
        where: { id: reminder.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
        },
      });
      failed++;
    }
  }

  return { processed: pendingReminders.length, sent, failed };
}

export async function createRemindersForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { card: { include: { bookingSettings: true } } },
  });
  if (!booking) return;

  const startAt = new Date(booking.startAt);
  const reminderTimes = [
    { hours: 24, type: "email_24h" },
    { hours: 2, type: "email_2h" },
  ];

  for (const r of reminderTimes) {
    const scheduledFor = new Date(startAt.getTime() - r.hours * 60 * 60 * 1000);
    if (scheduledFor > new Date()) {
      await prisma.bookingReminder.create({
        data: {
          bookingId,
          scheduledFor,
          type: r.type,
          status: "PENDING",
        },
      });
    }
  }
}
