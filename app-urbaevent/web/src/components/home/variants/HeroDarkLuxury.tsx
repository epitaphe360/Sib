/**
 * DESIGN 7: Dark Luxury avec Or et Noir
 * Style haut de gamme, gold accents, effet marbre
 * Pour: Exclusivité, événement VIP, prestige maximum
 */

import { motion } from 'framer-motion';
import { Crown, Diamond, Star, ArrowUpRight } from 'lucide-react';

export default function HeroDarkLuxury() {
  return (
    <section className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* Fond avec effet marbre doré */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-600/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Grille dorée subtile */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(251, 191, 36, 0.3) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 py-20">
        {/* Badge VIP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-amber-200 text-sm font-medium tracking-widest uppercase">Édition Prestige</span>
            <Diamond className="w-4 h-4 text-amber-400" />
          </div>
        </motion.div>

        {/* Titre principal avec effet or */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-7xl sm:text-9xl lg:text-[10rem] font-black leading-none">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-2xl">
              SIB
            </span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-amber-400/80 text-lg tracking-[0.5em] uppercase font-light">
              2026
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </motion.div>

        {/* Sous-titre élégant */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-2xl sm:text-3xl text-gray-400 font-light mb-4 text-center"
        >
          Salon International du Bâtiment
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-gray-500 text-center max-w-xl mb-12"
        >
          L'excellence du BTP africain réunie à El Jadida
        </motion.p>

        {/* Date et lieu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-8 mb-12"
        >
          {[
            { label: '15-18 Juin', sublabel: '2026' },
            { label: 'El Jadida', sublabel: 'Maroc' },
            { label: 'Parc Expo', sublabel: 'International' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-amber-400 text-xl font-semibold">{item.label}</div>
              <div className="text-gray-600 text-sm">{item.sublabel}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons style luxe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-amber-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2 text-white font-bold text-lg">
              Réserver VIP
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </button>
          
          <button className="px-10 py-5 border border-amber-500/30 text-amber-400 rounded-lg font-medium hover:bg-amber-500/10 hover:border-amber-500/50 transition-all">
            Devenir exposant
          </button>
        </motion.div>

        {/* Étoiles décoratives */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute top-20 left-20 text-amber-500/20"
        >
          <Star className="w-8 h-8" fill="currentColor" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute top-40 right-32 text-amber-500/10"
        >
          <Star className="w-6 h-6" fill="currentColor" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-40 left-40 text-amber-500/15"
        >
          <Star className="w-10 h-10" fill="currentColor" />
        </motion.div>

        {/* Stats ligne du bas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-12 left-0 right-0"
        >
          <div className="max-w-4xl mx-auto flex justify-around px-6">
            {[
              { value: '25,000+', label: 'Professionnels' },
              { value: '500+', label: 'Exposants' },
              { value: '€50M', label: 'Opportunités' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}