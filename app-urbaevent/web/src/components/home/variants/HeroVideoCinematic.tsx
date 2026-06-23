/**
 * DESIGN 11: Video Cinematic
 * Hero avec effet cinématique et overlay vidéo simulé
 * Pour: Impact dramatique, immersion totale
 */

import { motion } from 'framer-motion';
import { Play, Volume2, Maximize, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function HeroVideoCinematic() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Image with Cinematic Effect */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920')`
          }}
        />
        {/* Cinematic Bars */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-black z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-20" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
      </div>

      {/* Play Button Center */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group"
      >
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl"
          />
          <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      </motion.button>

      {/* Video Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-24 left-6 right-6 z-30 flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <button className="p-2 text-white/70 hover:text-white transition-colors">
            <Volume2 className="w-5 h-5" />
          </button>
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-orange-500" />
          </div>
        </div>
        <button className="p-2 text-white/70 hover:text-white transition-colors">
          <Maximize className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Content */}
      <div className="relative z-30 min-h-screen flex flex-col justify-end pb-40 px-6 lg:px-20">
        <div className="max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded">
              ÉDITION 2026
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight"
          >
            SIB
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-light text-gray-300 mt-2">
              Salon International du Bâtiment
            </span>
          </motion.h1>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-6 text-gray-300 mb-8"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              15-18 Juin 2026
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              El Jadida, Maroc
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-wrap gap-4"
          >
            <button className="px-8 py-4 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 transition-colors">
              Réserver un stand
            </button>
            <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded hover:bg-white/10 transition-colors">
              Découvrir le programme
            </button>
          </motion.div>
        </div>
      </div>

      {/* Film Grain Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-40 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </section>
  );
}