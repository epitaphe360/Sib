/**
 * DESIGN 16: Architect Blueprint
 * Style plan d'architecte avec lignes techniques
 * Pour: BTP, construction, professionnel technique
 */

import { motion } from 'framer-motion';
import { Ruler, Compass, PenTool, Calculator } from 'lucide-react';

export default function HeroArchitectBlueprint() {
  // Generate grid lines
  const gridLines = Array.from({ length: 20 }, (_, i) => i);

  return (
    <section className="relative min-h-screen bg-blue-950 overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-30">
        {/* Horizontal lines */}
        {gridLines.map((i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-blue-400/30"
            style={{ top: `${i * 5}%` }}
          />
        ))}
        {/* Vertical lines */}
        {gridLines.map((i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full border-l border-blue-400/30"
            style={{ left: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* Technical Drawing Elements */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
        <motion.path
          d="M 100 200 L 300 200 L 300 400 L 100 400 Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
        />
        <motion.path
          d="M 400 150 L 600 150 L 600 350 L 400 350 Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1 }}
        />
        <motion.circle
          cx="800"
          cy="300"
          r="100"
          stroke="white"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
        />
        {/* Dimension lines */}
        <motion.line
          x1="100" y1="420" x2="300" y2="420"
          stroke="white"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 2 }}
        />
      </svg>

      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/40" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-white/40" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white/40" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/40" />

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 lg:px-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Project Label */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded text-white/80 text-sm font-mono">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  PROJET: SIB-2026-ELJ
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl sm:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tighter"
              >
                SIB
                <span className="block text-2xl sm:text-3xl font-mono font-normal text-orange-400 mt-2 tracking-normal">
                  ÉDITION 2026
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-blue-200 mb-8 max-w-lg font-light leading-relaxed"
              >
                Salon International du Bâtiment. Le plus grand événement BTP d'Afrique, 
                conçu pour connecter les professionnels de la construction.
              </motion.p>

              {/* Technical Specs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                {[
                  { label: "DATE", value: "15-18 JUIN 2026" },
                  { label: "LIEU", value: "EL JADIDA, MA" },
                  { label: "SUPERFICIE", value: "25,000 m²" },
                  { label: "STANDS", value: "500+" },
                ].map((spec, index) => (
                  <div key={index} className="border border-white/20 bg-white/5 p-4 rounded">
                    <div className="text-xs text-blue-300 font-mono mb-1">{spec.label}</div>
                    <div className="text-white font-semibold">{spec.value}</div>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <button className="px-8 py-4 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Soumettre projet
                </button>
                <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded hover:bg-white/10 transition-colors">
                  Voir les plans
                </button>
              </motion.div>
            </div>

            {/* Right - Technical Drawing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square border-2 border-white/20 bg-white/5 rounded-lg p-8">
                {/* Stylized Building Drawing */}
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Building outline */}
                  <motion.rect
                    x="100" y="100" width="200" height="200"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                  {/* Windows */}
                  {[0, 1, 2].map((row) => (
                    [0, 1].map((col) => (
                      <motion.rect
                        key={`${row}-${col}`}
                        x={130 + col * 80} y={130 + row * 50}
                        width="40" height="30"
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 + (row * 0.2) + (col * 0.1) }}
                      />
                    ))
                  ))}
                  {/* Roof */}
                  <motion.path
                    d="M 80 100 L 200 20 L 320 100"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  {/* Dimensions */}
                  <motion.text
                    x="200" y="380"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontFamily="monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    25,000 m²
                  </motion.text>
                </svg>

                {/* Scale indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/60 text-xs font-mono">
                  <Ruler className="w-4 h-4" />
                  <span>ÉCHELLE 1:100</span>
                </div>
              </div>

              {/* Floating Tools */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <Compass className="w-8 h-8 text-orange-400" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <Calculator className="w-8 h-8 text-blue-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Technical Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-0 right-0 px-6"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center text-white/40 text-xs font-mono">
          <span>SIB-2026-REV-A</span>
          <span>PARIS EXPO - EL JADIDA</span>
          <span>15-18/06/2026</span>
        </div>
      </motion.div>
    </section>
  );
}