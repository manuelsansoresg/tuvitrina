"use client";

import { motion } from "framer-motion";

export function ScarcityBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary text-black font-bold text-center py-2 px-4 text-sm md:text-base sticky top-0 z-50"
    >
      🔥 Oferta de Lanzamiento: 20% de descuento solo para los primeros 10 clientes de Mérida
    </motion.div>
  );
}
