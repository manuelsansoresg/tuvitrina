"use client";

import { motion } from "framer-motion";
import { Trash2, Smartphone, RefreshCw } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-block p-3 rounded-full bg-red-500/10 text-red-500">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50">
            Deja de gastar en tarjetas de papel que terminan en la basura.
          </h2>
          <p className="text-slate-400 text-lg">
            Las tarjetas tradicionales son costosas, se pierden y quedan obsoletas en cuanto cambias un número.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-primary-start/50 transition-colors shadow-xl"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-50">Actualiza tus datos al instante</h3>
                <p className="text-slate-400">Cambia tu teléfono, dirección o catálogo sin reimprimir nada.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary/20 rounded-full text-secondary">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-50">Nunca te quedes sin tarjetas</h3>
                <p className="text-slate-400">Siempre disponible en tu celular, lista para compartir por WhatsApp o QR.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
