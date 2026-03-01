"use client";

import { motion } from "framer-motion";
import { QrCode, Smartphone } from "lucide-react";

export function AhaMoment() {
  return (
    <section className="py-20 px-6 bg-gray-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-black/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl inline-block"
        >
          <div className="flex flex-col md:flex-row items-center gap-12 justify-center">
            {/* Phone Scan Animation Placeholder */}
            <div className="relative w-48 h-80 bg-gray-800 rounded-[2rem] border-4 border-gray-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
              <motion.div 
                animate={{ y: [0, 100, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute w-full h-1 bg-primary/50 top-1/4 shadow-[0_0_20px_#0066FF]"
              />
              <QrCode className="w-24 h-24 text-white opacity-80" />
            </div>

            <div className="text-left max-w-sm">
              <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Escanea, Guarda y Conecta
              </h3>
              <p className="text-gray-300 mb-6">
                Tus clientes solo necesitan apuntar su cámara. Sin apps, sin descargas. 
                Tu información se guarda directamente en sus contactos.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium text-secondary">
                <Smartphone className="w-5 h-5" />
                Funciona en iPhone y Android
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
