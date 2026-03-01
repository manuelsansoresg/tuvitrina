"use client";

import { useActionState, useState } from "react";
import { register } from "@/actions/register";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Check, User, Mail, Lock } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          <span>Crear Cuenta</span>
          <Check className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

const plans = [
  {
    id: "EXPRESS",
    name: "Express",
    price: "$399",
    features: ["Básico", "1 año"],
    color: "border-slate-600",
  },
  {
    id: "EMPRENDEDOR",
    name: "Emprendedor",
    price: "$799",
    features: ["Recomendado", "1 año"],
    color: "border-blue-500 bg-blue-900/20",
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: "$1,299",
    features: ["Full", "1 año"],
    color: "border-amber-500/50",
  },
];

export default function RegisterForm() {
  const [state, dispatch] = useActionState(register, undefined);
  const [selectedPlan, setSelectedPlan] = useState("EMPRENDEDOR");

  return (
    <form action={dispatch} className="space-y-5">
      {/* Name Input */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-300"
          htmlFor="name"
        >
          Nombre Completo
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-lg border border-slate-700 bg-slate-800/50 py-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            id="name"
            type="text"
            name="name"
            placeholder="Juan Pérez"
            required
          />
          <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors" />
        </div>
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-500">{state.errors.name}</p>
        )}
      </div>

      {/* Email Input */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-300"
          htmlFor="email"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-lg border border-slate-700 bg-slate-800/50 py-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            id="email"
            type="email"
            name="email"
            placeholder="juan@ejemplo.com"
            required
          />
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors" />
        </div>
        {state?.errors?.email && (
          <p className="mt-1 text-xs text-red-500">{state.errors.email}</p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-300"
          htmlFor="password"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-lg border border-slate-700 bg-slate-800/50 py-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            id="password"
            type="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
          />
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors" />
        </div>
        {state?.errors?.password && (
          <p className="mt-1 text-xs text-red-500">{state.errors.password}</p>
        )}
      </div>

      {/* Plan Selection */}
      <div>
        <label className="mb-3 block text-sm font-medium text-slate-300">
          Elige tu Plan
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className={`relative cursor-pointer rounded-xl border p-3 shadow-sm focus:outline-none transition-all ${
                selectedPlan === plan.id
                  ? `ring-2 ring-blue-500 ${plan.color}`
                  : "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                className="sr-only"
                checked={selectedPlan === plan.id}
                onChange={() => setSelectedPlan(plan.id)}
              />
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  {plan.name}
                </span>
                <span className="mt-1 text-lg font-bold text-white">
                  {plan.price}
                </span>
              </div>
            </label>
          ))}
        </div>
        {state?.errors?.plan && (
          <p className="mt-1 text-xs text-red-500">{state.errors.plan}</p>
        )}
      </div>

      {/* General Error Message */}
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {state?.message && (
          <p className="text-sm text-red-500 font-medium">{state.message}</p>
        )}
      </div>

      <SubmitButton />
      
      <div className="text-center mt-4">
        <p className="text-sm text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  );
}
