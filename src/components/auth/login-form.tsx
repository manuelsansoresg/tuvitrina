"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { Mail, Lock, LogIn } from "lucide-react";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          <span>Iniciar Sesión</span>
          <LogIn className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-5">
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
            placeholder="Introduce tu correo"
            required
          />
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors" />
        </div>
      </div>
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
            placeholder="Introduce tu contraseña"
            required
            minLength={6}
          />
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 peer-focus:text-blue-500 transition-colors" />
        </div>
      </div>
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
        )}
      </div>
      <LoginButton />
    </form>
  );
}
