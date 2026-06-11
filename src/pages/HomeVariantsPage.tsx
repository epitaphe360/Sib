/**
 * Page de présentation des 8 designs de Hero pour le SIB 2026
 * Cette page permet au client de visualiser et choisir son design préféré
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Layout, 
  Sparkles, 
  Grid3X3, 
  Type, 
  Image, 
  Crown, 
  Palette,
  ArrowRight,
  Check,
  Eye
} from 'lucide-react';

const heroVariants = [
  {
    id: 'immersive-3d',
    name: 'Immersif 3D',
    description: 'Effet parallax cinématique avec particules flottantes et animations profondes',
    features: ['Parallax scrolling', 'Particules animées', 'Effet 3D', 'Vidéo de fond'],
    component: 'HeroImmersive3D',
    icon: Layers,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-900',
    bestFor: 'Impact immédiat, événement premium',
    path: '/home/immersive-3d'
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Design éditorial asymétrique inspiré des magazines de luxe',
    features: ['Layout 50/50', 'Style éditorial', 'Stats visibles', 'Moderne'],
    component: 'HeroSplitScreen',
    icon: Layout,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-900',
    bestFor: 'Moderne, magazines de luxe',
    path: '/home/split-screen'
  },
  {
    id: 'minimalist',
    name: 'Minimaliste Apple',
    description: 'Espace blanc, typographie soignée, micro-animations subtiles',
    features: ['Style Apple', 'Espace blanc', 'Épuré', 'Élégant'],
    component: 'HeroMinimalist',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-100',
    bestFor: 'Élégance, exclusivité, modernité',
    path: '/home/minimalist'
  },
  {
    id: 'dynamic-grid',
    name: 'Bento Grid',
    description: 'Grille dynamique asymétrique à la Apple Bento',
    features: ['Grid system', 'Cartes interactives', 'Moderne', 'Organisé'],
    component: 'HeroDynamicGrid',
    icon: Grid3X3,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-900',
    bestFor: 'Innovation, tech-forward',
    path: '/home/bento-grid'
  },
  {
    id: 'text-reveal',
    name: 'Text Reveal',
    description: 'Révélation lettre par lettre, style théâtre/cinéma',
    features: ['Animation lettres', 'Dramatique', 'Impact fort', 'Storytelling'],
    component: 'HeroTextReveal',
    icon: Type,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-900',
    bestFor: 'Impact émotionnel, storytelling',
    path: '/home/text-reveal'
  },
  {
    id: 'carousel',
    name: 'Carousel Immersif',
    description: 'Images plein écran qui défilent avec transitions fluides',
    features: ['Slides multiples', 'Transitions fluides', 'Swipe mobile', 'Dynamique'],
    component: 'HeroCarousel',
    icon: Image,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-900',
    bestFor: 'Dynamisme, storytelling visuel',
    path: '/home/carousel'
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    description: 'Style haut de gamme avec accents dorés et effet marbre',
    features: ['Or & Noir', 'Style VIP', 'Premium', 'Prestige'],
    component: 'HeroDarkLuxury',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-950',
    bestFor: 'Exclusivité, prestige maximum',
    path: '/home/dark-luxury'
  },
  {
    id: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Mesh gradient animé, glassmorphism, effets néon',
    features: ['Mesh animé', 'Glassmorphism', 'Néon', 'Futuriste'],
    component: 'HeroGradientMesh',
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-900',
    bestFor: 'Innovation, technologie, futurisme',
    path: '/home/gradient-mesh'
  }
];

export default function HomeVariantsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">SIB 2026</h1>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Sélection de designs Hero</span>
          </div>
          <Link 
            to="/home/demo"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir la démo
          </Link>
        </div>
      </header>

      {/* Hero de la page */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-6">
            <Layers className="w-4 h-4" />
            8 Designs Premium
          </span>
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Choisissez votre <span className="text-orange-500">Hero</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Des designs exceptionnels inspirés des plus grands événements internationaux 
            pour faire de SIB 2026 un salon inoubliable.
          </p>
        </motion.div>
      </section>

      {/* Grid des variants */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroVariants.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all hover:shadow-2xl hover:shadow-orange-500/10"
            >
              {/* Preview miniature */}
              <div className={`h-48 ${variant.bgColor} relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${variant.color} opacity-20`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <variant.icon className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`p-2 rounded-lg bg-gradient-to-r ${variant.color}`}>
                    <variant.icon className="w-5 h-5 text-white" />
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {variant.name}
                  </h3>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded-full">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {variant.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {variant.features.slice(0, 2).map((feature, i) => (
                    <span 
                      key={i}
                      className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-orange-400 mb-4">
                  Idéal: {variant.bestFor}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={variant.path}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </Link>
                  <button
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    title="Sélectionner ce design"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hover effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${variant.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section Demo */}
      <section className="px-6 py-20 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Voir tous les designs en action
          </h2>
          <p className="text-gray-400 mb-8">
            Naviguez entre les différentes variantes et choisissez celle qui correspond 
            le mieux à l'image de SIB 2026.
          </p>
          <Link
            to="/home/demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/25"
          >
            Lancer la démo interactive
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          SIB 2026 — Salon International du Bâtiment • 15-18 Juin 2026 • El Jadida, Maroc
        </p>
      </footer>
    </div>
  );
}