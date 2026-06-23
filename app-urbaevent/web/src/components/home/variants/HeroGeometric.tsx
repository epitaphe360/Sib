/**
 * DESIGN 12: Geometric Abstract
 * Formes géométriques abstraites avec animations
 * Pour: Design moderne, créativité
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight, Hexagon, Triangle, Square } from 'lucide-react';

export default function HeroGeometric() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shapes = [
    { Icon: Hexagon, color: "bg-orange-500", size: "w-32 h-32", delay: 0 },
    { Icon: Triangle, color: "bg-blue-500", size: "w-24 h-24", delay: 0.2 },
    { Icon: Square, color: "bg-purple-500", size: "w-20 h-20", delay: 0.4 },
  ];

  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden flex items-center">
      {/* Animated Geometric Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating Shapes */}
        {shapes.map((shape, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.1, 
              scale: 1,
              x: (mousePos.x - 0.5) * (index + 1) * 50,
              y: (mousePos.y - 0.5) * (index + 1) * 50,
              rotate: [0, 360]
            }}
            transition={{ 
              opacity: { duration: 1, delay: shape.delay },
              scale: { duration: 1, delay: shape.delay },
              rotate: { duration: 20 + index * 5, repeat: Infinity, ease: "linear" }
            }}
            className={`absolute ${shape.size} ${shape.color} rounded-2xl`}
            style={{
              top: `${20 + index * 25}%`,
              left: `${10 + index * 30}%`,
            }}
          />
        ))}

        {/* Additional Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-64 h-64 border-2 border-orange-200 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-48 h-48 border-2 border-blue-200 rotate-45"
        />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Édition 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-7xl font-black text-gray-900 mb-6 leading-tight"
            >
              SIB
              <span className="block text-orange-500">2026</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-lg"
            >
              Salon International du Bâtiment. Le plus grand événement BTP d'Afrique vous attend à El Jadida.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button className="group px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all flex items-center gap-2">
                Réserver maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors">
                En savoir plus
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-8"
            >
              {[
                { value: "25K+", label: "Visiteurs" },
                { value: "500+", label: "Exposants" },
                { value: "45", label: "Pays" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Geometric Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square">
              {/* Central Circle */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl"
              >
                <span className="text-6xl font-black text-white">SIB</span>
              </motion.div>

              {/* Orbiting Elements */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2"
                  style={{ transformOrigin: 'center' }}
                >
                  <div
                    className={`absolute w-12 h-12 rounded-lg ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'][i]}`}
                    style={{
                      top: `${-150 + i * 20}px`,
                      left: `${Math.sin(i) * 100}px`,
                    }}
                  />
                </motion.div>
              ))}

              {/* Date Badge */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-10 right-10 bg-white p-6 rounded-2xl shadow-xl"
              >
                <div className="text-4xl font-black text-gray-900">15-18</div>
                <div className="text-lg text-orange-500 font-semibold">Juin 2026</div>
                <div className="text-sm text-gray-500">El Jadida</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}