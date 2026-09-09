"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Calendar, Clock, ChevronLeft, ChevronRight, Loader2, Check,
  CalendarPlus, Download, User, Phone, Mail, FileText, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicAvailableSlots, createBooking } from "@/actions/booking";
import { generateGoogleCalendarUrl, generateICSContent } from "@/lib/booking/calendar";

interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number | null;
}

interface BookingResult {
  id: string;
  serviceName: string;
  businessName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  startAt: string;
  endAt: string;
  location: string | null;
  notes: string | null;
}

interface Props {
  cardId: string;
  businessName: string;
  location: string | null;
  timezone: string;
  services: ServiceData[];
}

type Step = "service" | "date" | "time" | "info" | "confirm" | "done";

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
}

function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function PublicBookingFlow({ cardId, businessName, location, timezone, services }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; startAt: string; endAt: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    if (step === "time" && selectedService && selectedDate) {
      setLoadingSlots(true);
      getPublicAvailableSlots(cardId, selectedService.id, selectedDate)
        .then(s => {
          setSlots(s);
          setLoadingSlots(false);
        })
        .catch(() => {
          setSlots([]);
          setLoadingSlots(false);
        });
    }
  }, [step, selectedService, selectedDate, cardId]);

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("cardId", cardId);
      fd.set("serviceId", selectedService.id);
      fd.set("date", selectedDate);
      fd.set("startTime", selectedTime);
      fd.set("customerName", customerName.trim());
      fd.set("customerPhone", customerPhone.trim());
      fd.set("customerEmail", customerEmail.trim());
      fd.set("notes", notes.trim());

      const result = await createBooking(null, fd);
      if (result.success && result.booking) {
        setBookingResult(result.booking as BookingResult);
        setStep("done");
      } else {
        alert(result.message || "Error al crear la reserva");
      }
    });
  };

  const handleDownloadICS = () => {
    if (!bookingResult) return;
    const content = generateICSContent({
      businessName,
      serviceName: bookingResult.serviceName,
      startAt: new Date(bookingResult.startAt),
      endAt: new Date(bookingResult.endAt),
      location,
      notes: bookingResult.notes,
    });
    const blob = new Blob([content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cita-${bookingResult.serviceName.toLowerCase().replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGoogleCalendar = () => {
    if (!bookingResult) return;
    const url = generateGoogleCalendarUrl({
      businessName,
      serviceName: bookingResult.serviceName,
      startAt: new Date(bookingResult.startAt),
      endAt: new Date(bookingResult.endAt),
      location,
      notes: bookingResult.notes,
    });
    window.open(url, "_blank");
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

  const today = new Date();
  const todayStr = formatDateStr(today);

  const renderCalendar = () => {
    const { year, month } = calendarMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const monthName = new Date(year, month).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    const dayLabels = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalendarMonth(prev => {
              if (prev.month === 0) return { year: prev.year - 1, month: 11 };
              return { ...prev, month: prev.month - 1 };
            })}
            className="h-8 w-8 text-slate-400"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-medium text-white capitalize">{monthName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalendarMonth(prev => {
              if (prev.month === 11) return { year: prev.year + 1, month: 0 };
              return { ...prev, month: prev.month + 1 };
            })}
            className="h-8 w-8 text-slate-400"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map(d => (
            <div key={d} className="text-center text-[10px] text-slate-500 font-medium py-1">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={day}
                disabled={isPast}
                onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                className={`h-9 w-full rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isPast
                    ? "text-slate-700 cursor-not-allowed"
                    : isToday
                    ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-center" style={{ color: "#0f172a" }}>
        Reserva una cita
      </h2>

      {step === "service" && (
        <div className="space-y-3">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedService(s); setStep("date"); }}
              className="w-full p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <p className="font-medium text-slate-900">{s.name}</p>
              {s.description && <p className="text-xs text-slate-500 mt-1">{s.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Clock size={12} /> {s.durationMinutes} min</span>
                {s.price != null && <span className="font-semibold text-green-700">${s.price.toLocaleString()}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {step === "date" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("service")} className="text-slate-500 hover:text-slate-700">
              <ChevronLeft size={20} />
            </button>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{selectedService?.name}</span> · {selectedService?.durationMinutes} min
            </p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
            {renderCalendar()}
          </div>
          {selectedDate && (
            <Button
              onClick={() => setStep("time")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              Continuar <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      )}

      {step === "time" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("date")} className="text-slate-500 hover:text-slate-700">
              <ChevronLeft size={20} />
            </button>
            <p className="text-sm text-slate-600 capitalize">{formatDisplayDate(selectedDate)}</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">No hay horarios disponibles</p>
                <p className="text-xs text-slate-400 mt-1">Selecciona otra fecha</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === slot.time
                        ? "bg-blue-600 text-white"
                        : "bg-white/80 text-slate-700 border border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {formatTime12(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedTime && (
            <Button
              onClick={() => setStep("info")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              Continuar <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      )}

      {step === "info" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("time")} className="text-slate-500 hover:text-slate-700">
              <ChevronLeft size={20} />
            </button>
            <p className="text-sm text-slate-600">Tus datos</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 flex items-center gap-1"><User size={12} /> Nombre *</Label>
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Tu nombre completo"
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 flex items-center gap-1"><Phone size={12} /> Teléfono *</Label>
              <Input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Tu número de teléfono"
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 flex items-center gap-1"><Mail size={12} /> Email (opcional)</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 flex items-center gap-1"><FileText size={12} /> Notas (opcional)</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Algo que debamos saber..."
                className="bg-white border-slate-200 text-slate-900 min-h-[60px]"
                maxLength={500}
              />
            </div>
          </div>
          <Button
            onClick={() => setStep("confirm")}
            disabled={!customerName.trim() || !customerPhone.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            Revisar reserva <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("info")} className="text-slate-500 hover:text-slate-700">
              <ChevronLeft size={20} />
            </button>
            <p className="text-sm text-slate-600">Confirmar reserva</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Servicio</span>
              <span className="text-sm font-medium text-slate-900">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Fecha</span>
              <span className="text-sm font-medium text-slate-900 capitalize">{formatDisplayDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Hora</span>
              <span className="text-sm font-medium text-slate-900">{formatTime12(selectedTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Duración</span>
              <span className="text-sm font-medium text-slate-900">{selectedService?.durationMinutes} min</span>
            </div>
            {selectedService?.price != null && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Precio</span>
                <span className="text-sm font-bold text-green-700">${selectedService.price.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Nombre</span>
                <span className="text-sm text-slate-900">{customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Teléfono</span>
                <span className="text-sm text-slate-900">{customerPhone}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-medium"
            size="lg"
          >
            {isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}
            Confirmar reserva
          </Button>
        </div>
      )}

      {step === "done" && bookingResult && (
        <div className="space-y-4">
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900">Tu reserva fue registrada correctamente</h3>
            <p className="text-sm text-green-700 mt-1">Estado: Pendiente de confirmación</p>
          </div>

          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Servicio</span>
              <span className="text-sm font-medium text-slate-900">{bookingResult.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Negocio</span>
              <span className="text-sm font-medium text-slate-900">{bookingResult.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Fecha</span>
              <span className="text-sm font-medium text-slate-900 capitalize">{formatDisplayDate(bookingResult.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Hora</span>
              <span className="text-sm font-medium text-slate-900">{formatTime12(bookingResult.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Duración</span>
              <span className="text-sm font-medium text-slate-900">{bookingResult.durationMinutes} min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleGoogleCalendar} variant="outline" className="h-11 border-slate-200 text-slate-700 hover:bg-slate-50">
              <CalendarPlus size={16} className="mr-2" /> Google Calendar
            </Button>
            <Button onClick={handleDownloadICS} variant="outline" className="h-11 border-slate-200 text-slate-700 hover:bg-slate-50">
              <Download size={16} className="mr-2" /> Descargar .ics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
