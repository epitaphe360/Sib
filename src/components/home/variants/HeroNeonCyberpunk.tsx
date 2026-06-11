/**
 * DESIGN 14: Neon Cyberpunk
 * Style cyberpunk avec néons et effets futuristes
 * Pour: Innovation, technologie, futur
 */

import { motion } from 'framer-motion';
import { Zap, Cpu, Wifi, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HeroNeonCyberpunk() {
  const [glitchText, setGlitchText] = useState("SIB 2026");
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
        const glitch = "SIB 2026".split("").map((char, i) => 
          Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : char
        ).join("");
        setGlitchText(glitch);
        setTimeout(() => setGlitchText("SIB 2026"), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gray-950 overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 perspective-1000">
        <motion.div
          animate={{ 
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(249, 115, 22, 0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'rotateX(60deg) translateY(-100px) scale(2)'
          }}
        />
      </div>

      {/* Neon Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />

      <div className="relative z-20 min-h-screen flex flex-col justify-center items-center px-6">
        {/* Glitch Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter relative">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"
              style={{ textShadow: '0 0 40px rgba(249, 115, 22, 0.8)' }}>
              {glitchText}
            </span>
            {/* Glitch layers */}
            <span className="absolute top-0 left-0 -ml-1 text-red-500 opacity-50 animate-pulse" 
              style={{ clipPath: 'inset(0 0 50% 0)', transform: 'translateX(-2px)' }}>
              {glitchText}
            </span>
            <span className="absolute top-0 left-0 -ml-1 text-cyan-500 opacity-50 animate-pulse" 
              style={{ clipPath: 'inset(50% 0 0 0)', transform: 'translateX(2px)' }}>
              {glitchText}
            </span>
          </h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 mx-auto mt-4"
          />
        </motion.div>

        {/* Subtitle with Typewriter Effect */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl sm:text-2xl text-gray-400 mb-4 font-mono"
        >
          <span className="text-orange-500">{'>'}</span> SYSTEM.INIT(SALON_BTP)
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-lg text-gray-500 mb-12 max-w-2xl text-center font-mono"
        >
          Le futur de la construction commence ici.
          <br />
          <span className="text-orange-400">15-18 JUIN 2026 // EL JADIDA, MA</span>
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mb-12"
        >
          {[
            { icon: Zap, label: "Innovation", color: "text-yellow-400" },
            { icon: Cpu, label: "Smart Tech", color: "text-cyan-400" },
            { icon: Wifi, label: "Connecté", color: "text-green-400" },
            { icon: Shield, label: "Sécurisé", color: "text-purple-400" },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, borderColor: 'rgba(249, 115, 22, 0.5)' }}
              className="p-4 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-lg text-center"
            >
              <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
              <span className="text-gray-400 text-sm font-mono">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="group relative px-8 py-4 bg-orange-500 text-white font-bold font-mono overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              ACCÉDER_SALON
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
          
          <button className="px-8 py-4 border-2 border-orange-500/50 text-orange-400 font-mono hover:bg-orange-500/10 transition-colors">
            [ TÉLÉCHARGER_DOSSIER ]
          </button>
        </motion.div>

        {/* Binary Code Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-10 left-6 text-xs font-mono text-orange-500 leading-relaxed hidden lg:block"
        >
          01010011 01001001 01000010
          <br />
          00110010 00110000 00110010 001100110
        </motion.div>

        {/* Version Tag */}
        <div className="absolute top-6 right-6 text-xs font-mono text-gray-600">
          v2.6.2026 // BUILD 1592
        </div>
      </div>
    </section>
  );
}