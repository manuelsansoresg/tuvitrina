"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const phoneNumber = "529991575581";
  const message = "Hola, necesito ayuda con mi tarjeta digital en TuVitrina.";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Link
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-background group"
      aria-label="Contactar por WhatsApp"
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="h-8 w-8 fill-current" />
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </div>
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-medium transition-all duration-300 group-hover:max-w-xs group-hover:pr-2">
        ¿Necesitas ayuda?
      </span>
    </Link>
  );
}
