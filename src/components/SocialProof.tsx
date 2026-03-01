"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function SocialProof() {
  return (
    <section className="py-12 px-6 bg-gray-900/50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-300"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-gray-400">
                U{i}
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            Únete a los profesionales que ya digitalizaron su networking
          </p>
        </motion.div>
      </div>
    </section>
  );
}
