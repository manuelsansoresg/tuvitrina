"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash, ToggleLeft, ToggleRight, Loader2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createBookingService, updateBookingService, deleteBookingService, toggleBookingService } from "@/actions/booking";
import type { BookingService } from "@prisma/client";

interface Props {
  initialServices: BookingService[];
}

interface FormData {
  id?: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: string;
  active: boolean;
  order: number;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  durationMinutes: 30,
  price: "",
  active: true,
  order: 0,
};

export function BookingServices({ initialServices }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [services, setServices] = useState(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s: BookingService) => {
    setForm({
      id: s.id,
      name: s.name,
      description: s.description || "",
      durationMinutes: s.durationMinutes,
      price: s.price != null ? String(s.price) : "",
      active: s.active,
      order: s.order,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ variant: "destructive", description: "El nombre es obligatorio" });
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      if (editingId) fd.set("id", editingId);
      fd.set("name", form.name.trim());
      fd.set("description", form.description.trim());
      fd.set("durationMinutes", String(form.durationMinutes));
      if (form.price) fd.set("price", form.price);
      fd.set("active", String(form.active));
      fd.set("order", String(form.order));

      const result = editingId
        ? await updateBookingService(null, fd)
        : await createBookingService(null, fd);

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
      const result = await deleteBookingService(id);
      if (result.success) {
        toast({ description: result.message });
        window.location.reload();
      } else {
        toast({ variant: "destructive", description: result.message });
      }
    });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleBookingService(id, !currentActive);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Servicios</h3>
        <Button onClick={openCreate} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus size={16} className="mr-1" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Nombre del servicio</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Corte de cabello"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Descripción (opcional)</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción breve del servicio"
              className="bg-slate-800 border-slate-700 text-white min-h-[60px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Duración (minutos)</Label>
              <Input
                type="number"
                min={5}
                max={480}
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 30 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Precio (opcional)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="$0.00"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
              {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {editingId ? "Actualizar" : "Crear"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.length === 0 && !showForm && (
          <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm">No hay servicios creados</p>
            <p className="text-slate-600 text-xs mt-1">Agrega servicios para que tus clientes puedan reservar</p>
          </div>
        )}
        {services.map(s => (
          <div key={s.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium truncate ${s.active ? "text-white" : "text-slate-500"}`}>{s.name}</p>
                {!s.active && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                    Inactivo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {s.durationMinutes} min
                </span>
                {s.price != null && (
                  <span className="flex items-center gap-1">
                    <DollarSign size={12} /> ${s.price.toLocaleString()}
                  </span>
                )}
              </div>
              {s.description && (
                <p className="text-xs text-slate-500 mt-1 truncate">{s.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggle(s.id, s.active)}
                className={`h-8 w-8 ${s.active ? "text-green-400" : "text-slate-500"}`}
              >
                {s.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8 text-slate-400 hover:text-white">
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-slate-500 hover:text-red-400">
                <Trash size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
