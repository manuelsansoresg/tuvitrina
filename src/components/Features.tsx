"use client";

import { motion } from "framer-motion";
import { Save, MessageCircle, Image as ImageIcon, Zap } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <Save className="w-8 h-8 text-secondary" />,
      title: "Guardar en Contactos",
      description: "Tus clientes guardan tu info completa con un solo clic."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-500" />,
      title: "WhatsApp Directo",
      description: "Botón para chatear contigo sin necesidad de agregar tu número."
    },
    {
      icon: <ImageIcon className="w-8 h-8 text-primary" />,
      title: "Galería de Productos",
      description: "Muestra tu portafolio o menú de forma atractiva y visual."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Carga Ultra Rápida",
      description: "Optimizada para abrir al instante en cualquier conexión."
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)" }}
            className="p-6 rounded-2xl bg-slate-800 border border-slate-700 transition-all shadow-lg group"
          >
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-slate-50">{feature.title}</h3>
            <p className="text-slate-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
