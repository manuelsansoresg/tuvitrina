"use client";

import { useState, useTransition } from "react";
import { Search, Check, X, CheckCircle, Loader2, Phone, User, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateBookingStatus } from "@/actions/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingWithService {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  startAt: Date;
  endAt: Date;
  status: string;
  service: {
    name: string;
    durationMinutes: number;
    price: number | null;
  };
}

interface Props {
  initialBookings: BookingWithService[];
}

const STATUS_FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  CONFIRMED: { label: "Confirmada", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  COMPLETED: { label: "Completada", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function formatBookingDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatBookingTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function BookingList({ initialBookings }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = initialBookings.filter(b => {
    if (filter !== "ALL" && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.service.name.toLowerCase().includes(q) ||
        (b.customerEmail && b.customerEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (bookingId: string, status: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("bookingId", bookingId);
      fd.set("status", status);
      const result = await updateBookingStatus(null, fd);
      if (result.success) {
        toast({ description: result.message });
        window.location.reload();
      } else {
        toast({ variant: "destructive", description: result.message });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, teléfono, servicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white h-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-white h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {STATUS_FILTERS.map(f => (
              <SelectItem key={f.value} value={f.value} className="text-slate-200 focus:bg-slate-800">
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl">
          <Calendar className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-slate-500 text-sm">No hay reservas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const statusInfo = STATUS_LABELS[b.status] || STATUS_LABELS.PENDING;
            return (
              <div key={b.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{b.customerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">{b.service.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatBookingDate(b.startAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatBookingTime(b.startAt)}
                      </span>
                      <span>{b.service.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {b.customerPhone}
                      </span>
                      {b.customerEmail && (
                        <span className="truncate">{b.customerEmail}</span>
                      )}
                    </div>
                    {b.notes && (
                      <p className="text-xs text-slate-600 mt-1 italic">&quot;{b.notes}&quot;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {b.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(b.id, "CONFIRMED")}
                          disabled={isPending}
                          className="h-8 text-xs bg-green-600 hover:bg-green-500 text-white"
                        >
                          <Check size={14} className="mr-1" /> Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(b.id, "CANCELLED")}
                          disabled={isPending}
                          className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X size={14} className="mr-1" /> Cancelar
                        </Button>
                      </>
                    )}
                    {b.status === "CONFIRMED" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(b.id, "COMPLETED")}
                          disabled={isPending}
                          className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          <CheckCircle size={14} className="mr-1" /> Completada
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(b.id, "CANCELLED")}
                          disabled={isPending}
                          className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X size={14} className="mr-1" /> Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
