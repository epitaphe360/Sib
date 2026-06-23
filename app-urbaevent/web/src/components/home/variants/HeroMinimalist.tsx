/**
 * DESIGN 3: Minimaliste Épuré (Apple Style)
 * Espace blanc, typographie soignée, micro-animations
 * Pour: Élégance, exclusivité, modernité
 */

import { motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';

export default function HeroMinimalist() {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden flex flex-col justify-center items-center px-6">
      {/* Fond subtil avec grain */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Cercles décoratifs flottants */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-orange-500 blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-blue-500 blur-3xl"
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-orange-500" />
          Édition 2026 — El Jadida
        </span>
      </motion.div>

      {/* Titre principal avec effet de révélation */}
      <div className="text-center max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-8xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-none mb-8"
        >
          SIB
          <span className="block text-2xl sm:text-3xl lg:text-4xl font-light text-gray-400 mt-4 tracking-normal">
            Salon International du Bâtiment
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Le plus grand événement BTP d'Afrique. 
          <br />
          <span className="text-gray-900 font-medium">15-18 Juin 2026</span>
        </motion.p>

        {/* CTA minimalistes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button className="group px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-2">
            Réserver un stand
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </button>
          <button className="px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors underline decoration-gray-300 hover:decoration-gray-900 underline-offset-4">
            Programme complet
          </button>
        </motion.div>
      </div>

      {/* Stats minimalistes en bas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-20 left-0 right-0"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 border-t border-gray-200 pt-8">
            {[
              { value: "25,000+", label: "Professionnels" },
              { value: "500+", label: "Exposants" },
              { value: "45", label: "Pays représentés" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400"
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}