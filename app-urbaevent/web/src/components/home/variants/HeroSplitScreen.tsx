/**
 * DESIGN 2: Split Screen Asymétrique
 * Design coupé en deux avec contenu à gauche et visuel à droite
 * Style: Moderne, éditorial, inspiré des magazines de luxe
 */

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Building2, Globe, Users } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function HeroSplitScreen() {
  const { t } = useTranslation();

  const stats = [
    { value: "25K+", label: "Visiteurs", icon: Users },
    { value: "500+", label: "Exposants", icon: Building2 },
    { value: "45+", label: "Pays", icon: Globe },
  ];

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Partie gauche - Contenu */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-20 lg:py-0 relative z-10">
          {/* Logo animé */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
              SIB
            </span>
            <span className="block text-sm text-gray-500 uppercase tracking-[0.3em] mt-2">
              2026
            </span>
          </motion.div>

          {/* Titre avec animation lettre par lettre */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            L'avenir du
            <span className="block text-orange-500">bâtiment</span>
            s'écrit ici
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-400 text-lg mb-8 max-w-md"
          >
            Le rendez-vous incontournable des professionnels du BTP en Afrique. 
            Innovation, networking et opportunités d'affaires.
          </motion.p>

          {/* Stats horizontales */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex gap-8 mb-10"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <button className="group flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all">
              Réserver mon stand
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 text-white font-semibold hover:text-orange-500 transition-colors">
              Télécharger la brochure
            </button>
          </motion.div>
        </div>

        {/* Partie droite - Image avec effets */}
        <div className="lg:w-1/2 relative">
          {/* Image principale */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('/hero-sib.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
          </motion.div>

          {/* Éléments décoratifs */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute top-20 right-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
          >
            <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-white">+35%</div>
            <div className="text-xs text-gray-400">Croissance 2025</div>
          </motion.div>

          {/* Date flottante */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute bottom-20 right-10 text-right"
          >
            <div className="text-6xl font-black text-white/10">15-18</div>
            <div className="text-2xl font-bold text-orange-500">JUIN 2026</div>
            <div className="text-gray-400">El Jadida, Maroc</div>
          </motion.div>

          {/* Lignes décoratives */}
          <div className="absolute top-0 right-0 w-32 h-full border-l border-orange-500/20" />
          <div className="absolute top-0 right-10 w-px h-full bg-gradient-to-b from-transparent via-orange-500/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}