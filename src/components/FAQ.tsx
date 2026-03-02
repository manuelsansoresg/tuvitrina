"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "¿Es pago único?",
      answer: "Sí, pagas una sola vez por el diseño y la configuración. No hay mensualidades ni anualidades ocultas."
    },
    {
      question: "¿Cómo la comparto?",
      answer: "Puedes compartirla por WhatsApp, correo, redes sociales o mediante tu código QR personalizado. Es compatible con cualquier celular."
    },
    {
      question: "¿Puedo cambiar mi teléfono después?",
      answer: "¡Claro! Solo contáctanos y actualizamos tu información al instante para que tus clientes siempre tengan tus datos correctos."
    }
  ];

  return (
    <section id="faq" className="py-20 px-6 bg-black">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium text-lg">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 pt-0 text-gray-400 border-t border-gray-800/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
