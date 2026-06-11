/**
 * DESIGN 8: Gradient Mesh Animé (Style Apple WWDC)
 * Fond avec mesh gradient animé, glassmorphism, effets néon
 * Pour: Innovation, technologie, futurisme
 */

import { motion } from 'framer-motion';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroGradientMesh() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0">
        {/* Cercle 1 - Rose/Magenta */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-600/40 to-pink-600/40 blur-[100px]"
        />
        
        {/* Cercle 2 - Bleu/Cyan */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-blue-600/40 to-cyan-500/40 blur-[120px]"
        />
        
        {/* Cercle 3 - Orange/Jaune */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-orange-500/30 to-yellow-500/30 blur-[100px]"
        />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm font-medium">15-18 Juin 2026 • El Jadida</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-7xl sm:text-9xl lg:text-[11rem] font-black leading-none tracking-tighter">
            <span className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              SIB
            </span>
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full mt-4"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-light text-white/80 text-center mb-4"
        >
          Salon International du Bâtiment
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg text-white/50 text-center max-w-2xl mb-12"
        >
          L'événement BTP qui façonne l'avenir de la construction en Afrique
        </motion.p>

        {/* Stats Cards - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-12 w-full max-w-2xl"
        >
          {[
            { value: '25K+', label: 'Visiteurs', color: 'from-purple-500/20 to-blue-500/20' },
            { value: '500+', label: 'Exposants', color: 'from-pink-500/20 to-orange-500/20' },
            { value: '45', label: 'Pays', color: 'from-cyan-500/20 to-emerald-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-white/10 text-center`}
            >
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:shadow-2xl hover:shadow-white/25">
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Réserver mon stand
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all">
            Découvrir le programme
          </button>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-white/20"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-xl border border-white/20"
        />
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-20 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/30 to-yellow-500/30 backdrop-blur-xl border border-white/20 rotate-45"
        />
      </div>
    </section>
  );
}