/**
 * DESIGN 15: Liquid Morph
 * Effet liquide avec morphing et dégradés fluides
 * Pour: Créativité, fluidité, modernité
 */

import { motion } from 'framer-motion';
import { Droplets, Waves, Sparkles } from 'lucide-react';

export default function HeroLiquidMorph() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 overflow-hidden flex items-center">
      {/* Animated Liquid Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
          borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", 
                       "30% 60% 70% 40% / 50% 60% 30% 60%",
                       "60% 40% 30% 70% / 60% 30% 70% 40%"]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-400 to-pink-500 opacity-60 blur-3xl"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -80, 0],
          y: [0, 80, 0],
          borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%",
                       "60% 40% 30% 70% / 60% 30% 70% 40%",
                       "40% 60% 70% 30% / 40% 50% 60% 50%"]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 opacity-60 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-30 blur-3xl rounded-full"
      />

      {/* Glass Content Card */}
      <div className="relative z-10 w-full px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 lg:p-16 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Édition 2026</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl sm:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight"
              style={{ textShadow: '0 0 60px rgba(255,255,255,0.3)' }}
            >
              SIB
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl lg:text-3xl text-white/80 font-light mb-4"
            >
              Salon International du Bâtiment
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-4 text-white/60 mb-12"
            >
              <Droplets className="w-5 h-5" />
              <span>15-18 Juin 2026</span>
              <span>•</span>
              <span>El Jadida, Maroc</span>
              <Waves className="w-5 h-5" />
            </motion.div>

            {/* Stats in Glass Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
            >
              {[
                { value: "500+", label: "Exposants" },
                { value: "25K+", label: "Visiteurs" },
                { value: "45", label: "Pays" },
              ].map((stat, index) => (
                <div key={index} className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-3xl lg:text-4xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="px-8 py-4 bg-white text-purple-900 rounded-full font-bold hover:bg-white/90 transition-colors">
                Réserver un stand
              </button>
              <button className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-full font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">
                Explorer le programme
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </section>
  );
}