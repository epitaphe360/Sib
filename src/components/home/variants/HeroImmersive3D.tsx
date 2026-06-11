/**
 * DESIGN 1: Hero Immersif Cinématique
 * Effet parallax profond, vidéo de fond, texte qui apparaît avec animation
 * Pour: Impact immédiat, événement premium
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Play, Calendar, MapPin, Users } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function HeroImmersive3D() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      {/* Vidéo de fond avec overlay gradient */}
      <motion.div 
        style={{ scale }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero-sib.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-transparent" />
      </motion.div>

      {/* Particules flottantes */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "100%",
              opacity: 0 
            }}
            animate={{ 
              y: "-10%",
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8"
      >
        {/* Badge édition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Édition 2026
          </span>
        </motion.div>

        {/* Titre principal avec effet 3D */}
        <motion.h1
          initial={{ opacity: 0, y: 50, rotateX: 45 }}
          animate={isLoaded ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-6xl sm:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight"
          style={{ perspective: "1000px" }}
        >
          <span className="block bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            SIB
          </span>
          <span className="block text-3xl sm:text-5xl lg:text-6xl font-light text-orange-400 mt-2">
            Salon International
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl font-light text-white/80 mt-2">
            du Bâtiment
          </span>
        </motion.h1>

        {/* Sous-titre animé */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl text-white/70 max-w-3xl mb-8 font-light"
        >
          Le plus grand rendez-vous de l'industrie BTP en Afrique
        </motion.p>

        {/* Info cards flottantes */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          {[
            { icon: Calendar, label: "15-18 Juin 2026", color: "bg-blue-500" },
            { icon: MapPin, label: "El Jadida, Maroc", color: "bg-orange-500" },
            { icon: Users, label: "500+ Exposants", color: "bg-emerald-500" },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full overflow-hidden transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Découvrir l'événement
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-full border border-white/30 transition-all"
          >
            Exposer au salon
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>

      {/* Bordure décorative */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a1628] to-transparent z-10" />
    </section>
  );
}