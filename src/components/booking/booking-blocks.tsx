"use client";

import { useState, useTransition } from "react";
import { Plus, Trash, Loader2, Ban, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createBookingBlock, deleteBookingBlock } from "@/actions/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlockData {
  id: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  allDay: boolean;
}

interface Props {
  initialBlocks: BlockData[];
  timezone: string;
}

function formatBlockDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBlockTime(date: Date, tz: string): string {
  return new Date(date).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });
}

export function BookingBlocks({ initialBlocks, timezone }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [reason, setReason] = useState("");

  const handleCreate = () => {
    if (!date) {
      toast({ variant: "destructive", description: "Selecciona una fecha" });
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("date", date);
      fd.set("allDay", String(allDay));
      if (!allDay) {
        fd.set("startTime", startTime);
        fd.set("endTime", endTime);
      }
      if (reason.trim()) fd.set("reason", reason.trim());

      const result = await createBookingBlock(null, fd);
      if (result.success) {
        toast({ description: result.message });
        setShowForm(false);
        window.location.reload();
      } else {
        toast({ variant: "destructive", description: result.message });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteBookingBlock(id);
      if (result.success) {
        toast({ description: result.message });
        window.location.reload();
      } else {
        toast({ variant: "destructive", description: result.message });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Bloqueos</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus size={16} className="mr-1" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Fecha</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Tipo de bloqueo</Label>
            <Select value={allDay ? "allday" : "partial"} onValueChange={v => setAllDay(v === "allday")}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="allday" className="text-slate-200 focus:bg-slate-800">Día completo</SelectItem>
                <SelectItem value="partial" className="text-slate-200 focus:bg-slate-800">Horario específico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Desde</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Hasta</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-300">Motivo (opcional)</Label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ej. Vacaciones, Cita personal..."
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
              {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Crear bloqueo
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {blocks.length === 0 && !showForm && (
          <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl">
            <Ban className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-slate-500 text-sm">No hay bloqueos</p>
            <p className="text-slate-600 text-xs mt-1">Bloquea fechas u horarios específicos</p>
          </div>
        )}
        {blocks.map(b => (
          <div key={b.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-red-400" />
                <span className="text-sm font-medium text-white">
                  {formatBlockDate(b.startAt)}
                </span>
                {b.allDay ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    Todo el día
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    {formatBlockTime(b.startAt, timezone)} - {formatBlockTime(b.endAt, timezone)}
                  </span>
                )}
              </div>
              {b.reason && (
                <p className="text-xs text-slate-500 mt-1">{b.reason}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(b.id)}
              className="h-8 w-8 text-slate-500 hover:text-red-400 shrink-0"
            >
              <Trash size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
