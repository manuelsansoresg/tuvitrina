"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { createSubscriptionPreference } from "@/actions/subscription";

export function Pricing() {
  const handleSubscribe = async (planName: string, priceString: string) => {
    try {
      // Remove '$' and ',' to get number
      const price = parseFloat(priceString.replace('$', '').replace(',', ''));
      const result = await createSubscriptionPreference(planName, price);
      
      if (result.init_point) {
        window.location.href = result.init_point;
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error starting subscription:", error);
      alert("Hubo un error al iniciar el proceso de pago. Por favor intenta de nuevo.");
    }
  };

  const plans = [
    {
      name: "Express",
      price: "$399",
      features: ["1 foto perfil", "Botones de contacto", "QR personalizado", "WhatsApp directo"],
      copy: "Ideal para no perder ni un prospecto en eventos",
      highlight: false
    },
    {
      name: "Emprendedor",
      price: "$799",
      features: ["Galería de 3-5 fotos", "Diseño de marca", "Ubicación Maps", "Todo lo del Express"],
      copy: "Muestra tus mejores productos mientras te contactan",
      highlight: true
    },
    {
      name: "Premium",
      price: "$1,299",
      features: ["Galería de 12 fotos", "Botón de catálogo/pago", "Prioridad en soporte", "Diseño avanzado"],
      copy: "La herramienta definitiva para equipos de ventas y empresas serias",
      highlight: false
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-50">Elige tu Plan</h2>
        <p className="text-slate-400">Pago único. Sin mensualidades ocultas.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            variants={item}
            className={`relative p-8 rounded-3xl border flex flex-col h-full transition-colors ${
              plan.highlight 
                ? "bg-slate-800 border-secondary/50 shadow-[0_0_30px_rgba(212,175,55,0.15)] scale-105 z-10" 
                : "bg-slate-800 border-slate-700 hover:border-slate-600"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-slate-900 font-bold px-4 py-1 rounded-full text-sm shadow-lg">
                Más Popular
              </div>
            )}
            
            <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-secondary" : "text-white"}`}>
              {plan.name}
            </h3>
            <div className="text-4xl font-bold mb-4 text-white">
              {plan.price}
              <span className="text-lg text-slate-500 font-normal ml-1">MXN</span>
            </div>
            
            <p className="text-slate-400 mb-6 text-sm min-h-[40px] italic">
              &quot;{plan.copy}&quot;
            </p>

            <ul className="space-y-4 mb-8 flex-1 text-left">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSubscribe(plan.name, plan.price)}
              className={`w-full py-3 rounded-full font-bold transition-all shadow-lg ${
                plan.highlight 
                  ? "bg-secondary text-slate-900 hover:bg-yellow-400" 
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              Elegir Plan
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
