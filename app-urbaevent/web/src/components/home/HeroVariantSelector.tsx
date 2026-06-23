/**
 * Composant de sélection et démonstration des 16 designs de Hero
 * Permet de switcher entre les différentes variantes
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Eye, 
  Code, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Layout,
  Grid3X3,
  Type,
  Image,
  Crown,
  Palette,
  Images,
  Type as TypeIcon,
  Play,
  Shapes,
  BookOpen,
  Zap,
  Droplets,
  PenTool
} from 'lucide-react';
import HeroImmersive3D from './variants/HeroImmersive3D';
import HeroSplitScreen from './variants/HeroSplitScreen';
import HeroMinimalist from './variants/HeroMinimalist';
import HeroDynamicGrid from './variants/HeroDynamicGrid';
import HeroTextReveal from './variants/HeroTextReveal';
import HeroCarousel from './variants/HeroCarousel';
import HeroDarkLuxury from './variants/HeroDarkLuxury';
import HeroGradientMesh from './variants/HeroGradientMesh';
import HeroParallaxGallery from './variants/HeroParallaxGallery';
import HeroKineticType from './variants/HeroKineticType';
import HeroVideoCinematic from './variants/HeroVideoCinematic';
import HeroGeometric from './variants/HeroGeometric';
import HeroMagazine from './variants/HeroMagazine';
import HeroNeonCyberpunk from './variants/HeroNeonCyberpunk';
import HeroLiquidMorph from './variants/HeroLiquidMorph';
import HeroArchitectBlueprint from './variants/HeroArchitectBlueprint';

const heroVariants = [
  {
    id: 'immersive-3d',
    name: 'Immersif 3D',
    description: 'Effet parallax cinématique avec particules',
    component: HeroImmersive3D,
    icon: Layers,
    color: 'from-blue-500 to-purple-600',
    bestFor: 'Impact immédiat, événement premium'
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Design éditorial asymétrique',
    component: HeroSplitScreen,
    icon: Layout,
    color: 'from-orange-500 to-red-600',
    bestFor: 'Moderne, magazines de luxe'
  },
  {
    id: 'minimalist',
    name: 'Minimaliste',
    description: 'Style Apple, espace blanc',
    component: HeroMinimalist,
    icon: Sparkles,
    color: 'from-gray-400 to-gray-600',
    bestFor: 'Élégance, exclusivité'
  },
  {
    id: 'dynamic-grid',
    name: 'Bento Grid',
    description: 'Grille dynamique asymétrique',
    component: HeroDynamicGrid,
    icon: Grid3X3,
    color: 'from-emerald-500 to-teal-600',
    bestFor: 'Innovation, tech-forward'
  },
  {
    id: 'text-reveal',
    name: 'Text Reveal',
    description: 'Révélation lettre par lettre',
    component: HeroTextReveal,
    icon: Type,
    color: 'from-indigo-500 to-purple-600',
    bestFor: 'Impact émotionnel, storytelling'
  },
  {
    id: 'carousel',
    name: 'Carousel',
    description: 'Slides immersives avec transitions',
    component: HeroCarousel,
    icon: Image,
    color: 'from-pink-500 to-rose-600',
    bestFor: 'Dynamisme, storytelling visuel'
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    description: 'Or et noir, style VIP',
    component: HeroDarkLuxury,
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    bestFor: 'Exclusivité, prestige maximum'
  },
  {
    id: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Mesh animé, glassmorphism',
    component: HeroGradientMesh,
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    bestFor: 'Innovation, technologie'
  },
  {
    id: 'parallax-gallery',
    name: 'Parallax Gallery',
    description: 'Galerie d\'images avec effet parallax profond',
    component: HeroParallaxGallery,
    icon: Images,
    color: 'from-cyan-500 to-blue-600',
    bestFor: 'Portfolio, événement visuel'
  },
  {
    id: 'kinetic-type',
    name: 'Kinetic Type',
    description: 'Typographie cinétique avec animations fluides',
    component: HeroKineticType,
    icon: TypeIcon,
    color: 'from-red-500 to-orange-600',
    bestFor: 'Impact visuel maximal, modernité'
  },
  {
    id: 'video-cinematic',
    name: 'Video Cinematic',
    description: 'Effet cinématique avec overlay vidéo',
    component: HeroVideoCinematic,
    icon: Play,
    color: 'from-gray-700 to-gray-900',
    bestFor: 'Impact dramatique, immersion totale'
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Formes géométriques abstraites avec animations',
    component: HeroGeometric,
    icon: Shapes,
    color: 'from-teal-500 to-green-600',
    bestFor: 'Design moderne, créativité'
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Style magazine avec mise en page éditoriale',
    component: HeroMagazine,
    icon: BookOpen,
    color: 'from-slate-600 to-slate-800',
    bestFor: 'Élégance, contenu riche, professionnel'
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Style cyberpunk avec néons et effets futuristes',
    component: HeroNeonCyberpunk,
    icon: Zap,
    color: 'from-fuchsia-500 to-cyan-500',
    bestFor: 'Innovation, technologie, futur'
  },
  {
    id: 'liquid-morph',
    name: 'Liquid Morph',
    description: 'Effet liquide avec morphing et dégradés fluides',
    component: HeroLiquidMorph,
    icon: Droplets,
    color: 'from-violet-500 to-pink-500',
    bestFor: 'Créativité, fluidité, modernité'
  },
  {
    id: 'architect-blueprint',
    name: 'Architect Blueprint',
    description: 'Style plan d\'architecte avec lignes techniques',
    component: HeroArchitectBlueprint,
    icon: PenTool,
    color: 'from-blue-700 to-blue-900',
    bestFor: 'BTP, construction, professionnel technique'
  }
];

export default function HeroVariantSelector() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentVariant = heroVariants[currentIndex];
  const CurrentHero = currentVariant.component;

  const nextVariant = () => {
    setCurrentIndex((prev) => (prev + 1) % heroVariants.length);
  };

  const prevVariant = () => {
    setCurrentIndex((prev) => (prev - 1 + heroVariants.length) % heroVariants.length);
  };

  const goToVariant = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen bg-gray-900'}`}>
      {/* Hero Display */}
      <div className="relative">
        <CurrentHero />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 transition-colors"
            title="Toggle Info"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 transition-colors"
            title="Toggle Fullscreen"
          >
            <Code className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevVariant}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextVariant}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 z-40"
          >
            <div className="max-w-7xl mx-auto">
              {/* Current Variant Info */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`p-2 rounded-lg bg-gradient-to-r ${currentVariant.color}`}>
                      <currentVariant.icon className="w-5 h-5 text-white" />
                    </span>
                    <h2 className="text-2xl font-bold text-white">
                      {currentVariant.name}
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                      {currentIndex + 1} / {heroVariants.length}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-1">{currentVariant.description}</p>
                  <p className="text-sm text-orange-400">
                    Idéal pour: {currentVariant.bestFor}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={prevVariant}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={nextVariant}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-8 gap-2 max-w-6xl mx-auto">
                {heroVariants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => goToVariant(index)}
                    className={`group relative p-3 rounded-xl transition-all ${
                      index === currentIndex
                        ? 'bg-white/20 ring-2 ring-orange-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-r ${variant.color} flex items-center justify-center`}>
                      <variant.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[10px] text-center text-white/60 truncate">
                      {variant.name}
                    </p>
                    {index === currentIndex && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-orange-500 rounded-full text-white shadow-lg"
      >
        <Layers className="w-6 h-6" />
      </button>
    </div>
  );
}