/**
 * DESIGN 6: Carousel Immersif avec Transitions Fluides
 * Images plein écran qui défilent avec contenu superposé
 * Pour: Dynamisme, storytelling visuel, immersion
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

const slides = [
  {
    image: '/hero-sib.jpg',
    title: 'SIB 2026',
    subtitle: 'Salon International du Bâtiment',
    description: 'Le plus grand événement BTP d\'Afrique',
    accent: 'orange'
  },
  {
    image: '/parc-exposition-eljadida.jpg',
    title: 'EL JADIDA',
    subtitle: 'Parc d\'Exposition',
    description: 'Un site exceptionnel au cœur du Maroc',
    accent: 'blue'
  },
  {
    image: '/organisateurs.png',
    title: 'NETWORKING',
    subtitle: 'Rencontres d\'Affaires',
    description: '25 000+ professionnels attendus',
    accent: 'emerald'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
        >
          {/* Image de fond */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
          
          {/* Contenu */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-sm uppercase tracking-[0.3em] mb-4"
            >
              {slides[current].subtitle}
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`text-6xl sm:text-8xl lg:text-9xl font-black text-white mb-6`}
            >
              {slides[current].title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/80 max-w-2xl mb-8"
            >
              {slides[current].description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                Explorer
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                En savoir plus
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-10 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Indicateurs */}
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === current ? 'w-12 bg-white' : 'w-6 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Flèches */}
          <div className="flex gap-2">
            <button
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="absolute top-10 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6 text-white/80 text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              15-18 Juin 2026
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              El Jadida, Maroc
            </span>
          </div>
          <span className="text-white font-bold text-xl">SIB</span>
        </div>
      </div>
    </section>
  );
}