"use client";

import { useState } from "react";
import { Calendar, Clock, Scissors, Ban, Settings, ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingServices } from "./booking-services";
import { BookingList } from "./booking-list";
import { BookingBlocks } from "./booking-blocks";
import { BookingSettingsPanel } from "./booking-settings";
import type {
  BookingSettings,
  BookingService,
  AvailabilityRule,
  BookingBlock,
  Booking,
  BookingStatus,
} from "@prisma/client";

interface BookingAgendaClientProps {
  settings: BookingSettings | { cardId: string; enabled: boolean; slotInterval: number; timezone: string } | null;
  services: BookingService[];
  bookings: (Booking & { service: { name: string; durationMinutes: number; price: number | null } })[];
  rules: AvailabilityRule[];
  blocks: BookingBlock[];
  stats: { todayCount: number; pendingCount: number; confirmedCount: number; upcomingCount: number } | null;
  userPlan: string;
  isAdmin: boolean;
}

const TABS = [
  { id: "bookings", label: "Reservas", icon: Calendar },
  { id: "services", label: "Servicios", icon: Scissors },
  { id: "blocks", label: "Bloqueos", icon: Ban },
  { id: "settings", label: "Configuración", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function BookingAgendaClient({
  settings: initialSettings,
  services: initialServices,
  bookings: initialBookings,
  rules: initialRules,
  blocks: initialBlocks,
  stats,
  userPlan,
  isAdmin,
}: BookingAgendaClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("bookings");
  const [settings, setSettings] = useState(initialSettings);
  const [services, setServices] = useState(initialServices);
  const [bookings, setBookings] = useState(initialBookings);
  const [rules, setRules] = useState(initialRules);
  const [blocks, setBlocks] = useState(initialBlocks);

  const isEnabled = settings && (settings as any).enabled;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/dashboard")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <h1 className="text-lg font-semibold text-white">Agenda</h1>
            </div>
          </div>

          {stats && (
            <div className="flex gap-3 pb-4 overflow-x-auto no-scrollbar">
              <StatBadge label="Hoy" value={stats.todayCount} color="blue" />
              <StatBadge label="Pendientes" value={stats.pendingCount} color="amber" />
              <StatBadge label="Confirmadas" value={stats.confirmedCount} color="green" />
              <StatBadge label="Próximas" value={stats.upcomingCount} color="purple" />
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-3">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!isEnabled && activeTab !== "settings" && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
            <Clock size={20} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-sm text-amber-200 font-medium">La agenda no está activada</p>
              <p className="text-xs text-amber-400/70">
                Ve a Configuración para activar las reservaciones.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto border-amber-500/30 text-amber-400 hover:bg-amber-500/10 shrink-0"
              onClick={() => setActiveTab("settings")}
            >
              Activar
            </Button>
          </div>
        )}

        {activeTab === "bookings" && (
          <BookingList initialBookings={bookings} />
        )}
        {activeTab === "services" && (
          <BookingServices initialServices={services} />
        )}
        {activeTab === "blocks" && (
          <BookingBlocks initialBlocks={blocks} timezone={(settings as any)?.timezone || "America/Merida"} />
        )}
        {activeTab === "settings" && (
          <BookingSettingsPanel
            initialSettings={settings}
            initialRules={rules}
            userPlan={userPlan}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${colors[color]}`}>
      {label}: <span className="font-bold">{value}</span>
    </div>
  );
}
