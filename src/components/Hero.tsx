"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
      {/* Background Images with Animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div className="hidden md:block relative w-full h-full">
          <Image
            src="/images/hero-desktop.jpg"
            alt="Hero Background Desktop"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="block md:hidden relative w-full h-full">
          <Image
            src="/images/hero-mobile.jpg"
            alt="Hero Background Mobile"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
      </motion.div>

      {/* Blue Glow Effect - Behind Phone Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
      >
        <div className="w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto z-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-50 drop-shadow-xl">
          Tu Tarjeta de Presentación, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-start to-primary-end drop-shadow-sm">
            Ahora en el Celular de tus Clientes
          </span>
        </h1>
        
        <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
          Lleva tu negocio al siguiente nivel con una tarjeta digital profesional, 
          ecológica y lista para compartir por WhatsApp.
        </p>

        <motion.a
          href="#pricing"
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-start to-primary-end text-white font-bold py-4 px-8 rounded-full text-lg shadow-xl transition-all border border-white/20 backdrop-blur-sm"
        >
          Quiero mi Tarjeta Ahora
          <ArrowRight className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </section>
  );
}
