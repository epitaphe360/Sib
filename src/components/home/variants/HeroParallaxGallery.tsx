/**
 * DESIGN 9: Parallax Gallery
 * Galerie d'images avec effet parallax profond
 * Pour: Portfolio, événement visuel
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Play, Calendar, MapPin } from 'lucide-react';

export default function HeroParallaxGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const images = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
  ];

  return (
    <section ref={containerRef} className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />

      {/* Floating Images with Parallax */}
      <motion.div style={{ y: y1 }} className="absolute top-20 left-[10%] w-64 h-80 rounded-2xl overflow-hidden shadow-2xl rotate-[-5deg]">
        <img src={images[0]} alt="Construction 1" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute top-40 right-[15%] w-72 h-96 rounded-2xl overflow-hidden shadow-2xl rotate-[3deg]">
        <img src={images[1]} alt="Construction 2" className="w-full h-full object-cover" />
      </motion.div>

      <motion.div style={{ y: y3 }} className="absolute bottom-32 left-[20%] w-56 h-72 rounded-2xl overflow-hidden shadow-2xl rotate-[6deg]">
        <img src={images[2]} alt="Construction 3" className="w-full h-full object-cover" />
      </motion.div>

      {/* Main Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Play className="w-4 h-4" />
            Édition 2026
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-6"
        >
          SIB
          <span className="block text-3xl sm:text-4xl font-light text-gray-400 mt-2">2026</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl text-gray-300 max-w-2xl mb-8"
        >
          Salon International du Bâtiment
        </motion.p>

        {/* Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 text-gray-400 mb-12"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            15-18 Juin 2026
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Parc Expo, El Jadida
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors">
            Explorer le salon
          </button>
          <button className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
            Voir la galerie
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
    </section>
  );
}