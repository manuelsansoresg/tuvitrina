import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BookingAgendaClient } from "@/components/booking/booking-agenda-client";
import {
  getBookingSettings,
  getBookingServices,
  getOwnerBookings,
  getAvailabilityRules,
  getBookingBlocks,
  getBookingStats,
} from "@/actions/booking";

export default async function BookingAgendaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const [settings, services, bookings, rules, blocks, stats] = await Promise.all([
    getBookingSettings(),
    getBookingServices(),
    getOwnerBookings(),
    getAvailabilityRules(),
    getBookingBlocks(),
    getBookingStats(),
  ]);

  return (
    <BookingAgendaClient
      settings={settings}
      services={services}
      bookings={bookings}
      rules={rules}
      blocks={blocks}
      stats={stats}
      userPlan={user?.plan || "EXPRESS"}
      isAdmin={session.user.role === Role.ADMIN}
    />
  );
}
