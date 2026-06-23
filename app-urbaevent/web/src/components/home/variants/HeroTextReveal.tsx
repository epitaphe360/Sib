/**
 * DESIGN 5: Text Reveal Dramatique
 * Effet de révélation lettre par lettre, style théâtre/cinéma
 * Pour: Impact émotionnel, storytelling
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Ticket } from 'lucide-react';

export default function HeroTextReveal() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const title = "SIB 2026";
  const subtitle = "Le futur du bâtiment";
  
  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    })
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex items-center justify-center">
      {/* Fond avec motif architectural */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Cercles lumineux */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-[100px]" />
        <div className="absolute inset-20 rounded-full bg-blue-500/20 blur-[80px]" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-12"
        >
          <Ticket className="w-4 h-4 text-orange-400" />
          <span className="text-white/80 text-sm font-medium">15-18 Juin 2026 • El Jadida</span>
        </motion.div>

        {/* Titre avec révélation lettre par lettre */}
        <div className="mb-8 overflow-hidden">
          <h1 className="text-7xl sm:text-9xl lg:text-[12rem] font-black text-white leading-none">
            {title.split("").map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={letterVariants}
                className="inline-block"
                style={{ 
                  textShadow: "0 0 80px rgba(249, 115, 22, 0.5)",
                  WebkitTextStroke: i > 2 ? "2px rgba(255,255,255,0.3)" : "none",
                  color: i > 2 ? "transparent" : "white"
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Sous-titre */}
        <div className="mb-12 overflow-hidden">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-2xl sm:text-4xl text-orange-400 font-light tracking-wide"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-12"
        >
          Rejoignez 25 000 professionnels du BTP pour 4 jours d'innovation, 
          de networking et d'opportunités d'affaires exceptionnelles.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
            Obtenir mon badge
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 border border-white/30 hover:border-white/60 text-white font-medium rounded-lg transition-all">
            Programme 2026
          </button>
        </motion.div>

        {/* Stats line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="absolute bottom-20 left-0 right-0"
        >
          <div className="flex justify-center gap-16 text-center">
            {[
              { value: "500+", label: "Exposants" },
              { value: "45", label: "Pays" },
              { value: "200+", label: "Conférences" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lignes décoratives verticales */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute right-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </section>
  );
}