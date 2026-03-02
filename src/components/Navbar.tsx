"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 rounded-full border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <a href="#" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-primary-end">
          TuVitrina
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Beneficios</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <a href="#faq" className="hover:text-white transition-colors">Preguntas</a>
          
          {user ? (
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              Ir al Panel
            </motion.a>
          ) : (
            <div className="flex items-center gap-4">
              <a href="/login" className="hover:text-white transition-colors">Entrar</a>
              <motion.a
                href="#pricing"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-primary-start to-primary-end text-white font-bold shadow-lg shadow-blue-500/20"
              >
                Empezar
              </motion.a>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full mt-2 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 flex flex-col gap-4 md:hidden"
        >
          <a href="#features" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">Beneficios</a>
          <a href="#pricing" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">Precios</a>
          <a href="#faq" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">Preguntas</a>
          
          {user ? (
            <a href="/dashboard" onClick={() => setIsOpen(false)} className="text-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold">
              Ir al Panel
            </a>
          ) : (
            <>
              <a href="/login" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white text-center">Entrar</a>
              <a href="#pricing" onClick={() => setIsOpen(false)} className="text-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-start to-primary-end text-white font-bold">
                Empezar
              </a>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
}
