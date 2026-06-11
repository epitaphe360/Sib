/**
 * DESIGN 4: Grid Dynamique avec Bento Box
 * Style moderne avec grille asymétrique comme Apple Bento
 * Pour: Innovation, tech-forward, organisation claire
 */

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Building2, ArrowUpRight, Play } from 'lucide-react';

export default function HeroDynamicGrid() {
  return (
    <section className="relative min-h-screen bg-[#0f0f0f] overflow-hidden px-4 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-4">
            SIB <span className="text-orange-500">2026</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Le salon qui redéfinit l'industrie du bâtiment en Afrique
          </p>
        </motion.div>

        {/* Grille Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {/* Carte 1: Hero Large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 lg:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url('/hero-sib.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold mb-4 w-fit">
                À NE PAS MANQUER
              </span>
              <h3 className="text-3xl font-bold text-white mb-2">L'événement BTP de l'année</h3>
              <p className="text-gray-300">25 000+ professionnels réunis à El Jadida</p>
            </div>
          </motion.div>

          {/* Carte 2: Date */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <Calendar className="w-8 h-8 text-white/80" />
            <div>
              <div className="text-4xl font-black text-white">15-18</div>
              <div className="text-white/80 font-medium">Juin 2026</div>
            </div>
          </motion.div>

          {/* Carte 3: Location */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-900 rounded-3xl p-6 flex flex-col justify-between group hover:bg-gray-800 transition-colors cursor-pointer border border-gray-800"
          >
            <MapPin className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-lg font-bold text-white">El Jadida</div>
              <div className="text-gray-400 text-sm">Maroc</div>
              <div className="text-gray-500 text-xs mt-1">Parc d'Exposition</div>
            </div>
          </motion.div>

          {/* Carte 4: Exposants */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-900 rounded-3xl p-6 flex flex-col justify-between group hover:bg-gray-800 transition-colors cursor-pointer border border-gray-800"
          >
            <Building2 className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-3xl font-black text-white">500+</div>
              <div className="text-gray-400 text-sm">Exposants</div>
            </div>
          </motion.div>

          {/* Carte 5: Visiteurs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gray-900 rounded-3xl p-6 flex flex-col justify-between group hover:bg-gray-800 transition-colors cursor-pointer border border-gray-800"
          >
            <Users className="w-8 h-8 text-emerald-500" />
            <div>
              <div className="text-3xl font-black text-white">25K</div>
              <div className="text-gray-400 text-sm">Visiteurs attendus</div>
            </div>
          </motion.div>

          {/* Carte 6: Video CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="text-white font-bold text-lg mb-1">Découvrir l'édition 2025</div>
              <div className="text-white/70 text-sm">Retour en images</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </motion.div>

          {/* Carte 7: CTA Principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="text-gray-900 font-bold mb-2">Devenir exposant</div>
            <div className="flex items-center gap-1 text-orange-600 font-medium">
              Réserver <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}