/**
 * DESIGN 10: Kinetic Typography
 * Typographie cinétique avec animations fluides
 * Pour: Impact visuel maximal, modernité
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Users, Globe } from 'lucide-react';

export default function HeroKineticType() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const letters = "SIB".split("");
  const subLetters = "2026".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const letterVariants = {
    hidden: { y: 100, opacity: 0, rotateX: -90 },
    visible: { 
      y: 0, 
      opacity: 1, 
      rotateX: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center">
      {/* Animated Background Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(249, 115, 22, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `perspective(500px) rotateX(${(mousePos.y - 0.5) * 10}deg) rotateY(${(mousePos.x - 0.5) * 10}deg)`
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -80, 0], 
          y: [0, 60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 w-full px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Title with Kinetic Effect */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="flex justify-center lg:justify-start gap-2 perspective-1000">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="text-[15vw] lg:text-[12vw] font-black text-white leading-none inline-block"
                  style={{
                    textShadow: '0 0 80px rgba(249, 115, 22, 0.5)',
                    transform: `translateZ(${Math.sin(index + mousePos.x * 10) * 20}px)`
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            
            {/* Subtitle */}
            <div className="flex justify-center lg:justify-start gap-1 mt-[-2vw]">
              {subLetters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                  className="text-[5vw] lg:text-[3vw] font-light text-orange-500"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center lg:text-left mb-12"
          >
            <h2 className="text-2xl lg:text-4xl font-light text-gray-300 mb-4">
              Salon International du Bâtiment
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
              Le rendez-vous incontournable des professionnels du BTP en Afrique. 
              Innovation, networking et opportunités d'affaires.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-wrap justify-center lg:justify-start gap-8 mb-12"
          >
            {[
              { icon: Building2, value: "500+", label: "Exposants" },
              { icon: Users, value: "25K+", label: "Visiteurs" },
              { icon: Globe, value: "45", label: "Pays" },
            ].map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <stat.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button className="group px-8 py-4 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
              Réserver un stand
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
              Télécharger le brochure
            </button>
          </motion.div>

          {/* Date Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-12 right-6 lg:right-20 text-right hidden lg:block"
          >
            <div className="text-6xl font-black text-white/10">15-18</div>
            <div className="text-2xl font-light text-orange-500">Juin 2026</div>
            <div className="text-gray-500">El Jadida, Maroc</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}