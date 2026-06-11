/**
 * DESIGN 13: Magazine Editorial
 * Style magazine avec mise en page éditoriale
 * Pour: Élégance, contenu riche, professionnel
 */

import { motion } from 'framer-motion';
import { ArrowUpRight, Bookmark, Share2 } from 'lucide-react';

export default function HeroMagazine() {
  const featuredArticles = [
    { title: "Innovation BTP", category: "Technologie", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400" },
    { title: "Architecture Durable", category: "Green", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" },
    { title: "Matériaux 2026", category: "Tendances", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
  ];

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter">SIB MAGAZINE</div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <span>Édition 2026</span>
            <span>•</span>
            <span>Juin</span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Editorial Layout */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Main Feature */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              {/* Category Tag */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider">
                  Couverture
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[0.9] mb-6">
                SALON
                <span className="block text-orange-500">INTERNATIONAL</span>
                <span className="block">DU BÂTIMENT</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-600 mb-8 max-w-lg font-light leading-relaxed">
                Le rendez-vous incontournable des professionnels du BTP en Afrique. 
                Découvrez les innovations qui façonnent l'avenir de la construction.
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 border-t border-b border-gray-200 py-4">
                <span className="font-semibold text-gray-900">15-18 Juin 2026</span>
                <span>Parc des Expositions, El Jadida</span>
                <span className="text-orange-500 font-medium">#SIB2026</span>
              </div>

              {/* CTA */}
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors">
                Lire l'article complet
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </motion.div>

            {/* Right Column - Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800" 
                  alt="SIB 2026" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Image Caption */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm font-medium mb-2">Photo: SIB 2025</p>
                  <p className="text-xs text-gray-300">Plus de 25,000 professionnels réunis</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Grid - More Articles */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid sm:grid-cols-3 gap-6"
          >
            {featuredArticles.map((article, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  {article.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 group-hover:text-orange-500 transition-colors">
                  {article.title}
                </h3>
              </div>
            ))}
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-between items-center gap-8 border-t border-gray-200 pt-8"
          >
            {[
              { value: "500+", label: "Exposants" },
              { value: "25,000+", label: "Visiteurs attendus" },
              { value: "45", label: "Pays représentés" },
              { value: "4", label: "Jours d'exposition" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}