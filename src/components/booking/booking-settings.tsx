"use client";

import { useState, useTransition } from "react";
import { Save, Plus, Trash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { updateBookingSettings, saveAvailabilityRules } from "@/actions/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsData {
  cardId: string;
  enabled: boolean;
  slotInterval: number;
  timezone: string;
}

interface RuleData {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const TIMEZONES = [
  "America/Merida",
  "America/Mexico_City",
  "America/Cancun",
  "America/Tijuana",
  "America/Chihuahua",
  "America/Monterrey",
  "America/Guadalajara",
  "America/Bogota",
  "America/Lima",
  "America/Buenos_Aires",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/Madrid",
];

const INTERVALS = [
  { value: 15, label: "15 minutos" },
  { value: 20, label: "20 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 60, label: "60 minutos" },
];

interface Props {
  initialSettings: SettingsData | null;
  initialRules: RuleData[];
  userPlan: string;
  isAdmin: boolean;
}

export function BookingSettingsPanel({ initialSettings, initialRules, userPlan, isAdmin }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [enabled, setEnabled] = useState(initialSettings?.enabled ?? false);
  const [slotInterval, setSlotInterval] = useState(initialSettings?.slotInterval ?? 30);
  const [timezone, setTimezone] = useState(initialSettings?.timezone ?? "America/Merida");

  const [rules, setRules] = useState<RuleData[]>(initialRules);

  const handleSaveSettings = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("enabled", String(enabled));
      fd.set("slotInterval", String(slotInterval));
      fd.set("timezone", timezone);
      const result = await updateBookingSettings(null, fd);
      toast({ description: result.message });
    });
  };

  const handleSaveRules = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("rules", JSON.stringify(rules));
      const result = await saveAvailabilityRules(null, fd);
      toast({ description: result.message });
    });
  };

  const addRule = (dayOfWeek: number) => {
    setRules([...rules, { dayOfWeek, startTime: "09:00", endTime: "18:00", active: true }]);
  };

  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const updateRule = (index: number, field: keyof RuleData, value: string | boolean) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const getRulesForDay = (day: number) =>
    rules
      .map((r, i) => ({ ...r, _idx: i }))
      .filter(r => r.dayOfWeek === day);

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Configuración General</h3>

        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">Permitir reservaciones</Label>
              <p className="text-xs text-slate-500 mt-1">
                Activa la agenda para que tus clientes puedan reservar citas.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Intervalo de horarios</Label>
            <Select value={String(slotInterval)} onValueChange={v => setSlotInterval(parseInt(v))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {INTERVALS.map(i => (
                  <SelectItem key={i.value} value={String(i.value)} className="text-slate-200 focus:bg-slate-800">
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Zona horaria</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 max-h-[200px]">
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz} className="text-slate-200 focus:bg-slate-800">
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Save size={16} className="mr-2" />
            {isPending ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Horarios Semanales</h3>
        <p className="text-sm text-slate-400">
          Define los horarios de atención para cada día de la semana.
        </p>

        <div className="space-y-3">
          {DAYS.map(day => {
            const dayRules = getRulesForDay(day.value);
            return (
              <div key={day.value} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">{day.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addRule(day.value)}
                    className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Plus size={14} className="mr-1" /> Horario
                  </Button>
                </div>

                {dayRules.length === 0 ? (
                  <p className="text-xs text-slate-600">Cerrado</p>
                ) : (
                  <div className="space-y-2">
                    {dayRules.map(rule => (
                      <div key={rule._idx} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={rule.startTime}
                          onChange={e => updateRule(rule._idx, "startTime", e.target.value)}
                          className="h-8 text-xs bg-slate-800 border-slate-700 text-white w-28"
                        />
                        <span className="text-xs text-slate-500">a</span>
                        <Input
                          type="time"
                          value={rule.endTime}
                          onChange={e => updateRule(rule._idx, "endTime", e.target.value)}
                          className="h-8 text-xs bg-slate-800 border-slate-700 text-white w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRule(rule._idx)}
                          className="h-8 w-8 text-slate-500 hover:text-red-400"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleSaveRules}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Save size={16} className="mr-2" />
          {isPending ? "Guardando..." : "Guardar horarios"}
        </Button>
      </div>
    </div>
  );
}
