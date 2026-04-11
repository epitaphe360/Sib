import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { 
  Share2,
  MessageCircle,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  AlertCircle,
  Loader2,
  ChevronDown,
  Star,
  Calendar,
  CheckCircle2,
  Sparkles,
  Building2,
  ExternalLink,
  Eye,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  FileText,
  List,
  Settings,
  Info,
  Download,
  Truck,
  Award,
  TrendingUp,
  Play,
  Copy,
  Check,
  Users
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { SupabaseService } from '../../services/supabaseService';
import { toast } from 'sonner';
import EnhancedProductModal from './EnhancedProductModal';

interface MiniSiteData {
  id: string;
  exhibitor_id: string;
  logo_url?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  sections: any[];
  published: boolean;
  views: number;
  last_updated: string;
}

interface ExhibitorData {
  id: string;
  company_name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
    social?: {
      linkedin?: string;
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
  };
}

// Image avec fallback
const SafeImage = ({ src, alt, className, fallback }: { src?: string; alt: string; className?: string; fallback?: React.ReactNode }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return fallback || <div className={className}><Building2 className="w-full h-full p-4 text-gray-300" /></div>;
  }
  
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export default function MiniSitePreviewSimple() {
  const { exhibitorId } = useParams<{ exhibitorId: string }>();
  const navigate = useNavigate();
  
  const [miniSiteData, setMiniSiteData] = useState<MiniSiteData | null>(null);
  const [exhibitorData, setExhibitorData] = useState<ExhibitorData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<{ [key: number]: boolean }>({});

  // Parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    if (!exhibitorId) {
      setError('ID exposant manquant');
      setIsLoading(false);
      return;
    }
    loadData();
  }, [exhibitorId]);

  const loadData = async () => {
    if (!exhibitorId) return;
    setIsLoading(true);
    try {
      const [miniSite, exhibitor, prods] = await Promise.all([
        SupabaseService.getMiniSite(exhibitorId),
        SupabaseService.getExhibitorForMiniSite(exhibitorId),
        SupabaseService.getExhibitorProducts(exhibitorId)
      ]);

      console.log('[MiniSite] Data:', { miniSite, exhibitor, products: prods });

      if (!miniSite) {
        setError('Mini-site non trouvé');
        return;
      }

      // Si l'exposant n'est pas trouvé, créer une structure minimale pour éviter l'erreur
      if (!exhibitor) {
        console.warn('[MiniSite] Exhibitor data missing, using fallback');
        setExhibitorData({
          id: exhibitorId!,
          company_name: 'Exposant',
          logo_url: null,
          description: 'Informations en cours de mise à jour',
          website: null,
          contact_info: {}
        });
      } else {
        setExhibitorData(exhibitor);
      }

      setMiniSiteData(miniSite);
      setProducts(prods || []);
      
      await SupabaseService.incrementMiniSiteViews(exhibitorId);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du mini-site...</p>
        </div>
      </div>
    );
  }

  // Error - Mini-site non trouvé (On accepte maintenant exhibitorData null si miniSiteData existe)
  if (error || !miniSiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-lg w-full p-8 text-center shadow-xl border-0">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Mini-site non disponible</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error === 'Mini-site non trouvé' || !miniSiteData
              ? "Cet exposant n'a pas encore créé son mini-site vitrine. Revenez bientôt pour découvrir leur présentation complète !"
              : error || "Ce mini-site n'existe pas ou n'est plus disponible."}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(ROUTES.EXHIBITORS)} variant="outline" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voir tous les exposants
            </Button>
            <Button onClick={() => navigate(ROUTES.HOME)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Découvrir SIB 2026
            </Button>
          </div>
          
          {/* Message informatif pour exposants */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-blue-600">Vous êtes exposant ?</span>
              <br />
              Créez votre mini-site vitrine depuis votre tableau de bord pour présenter votre entreprise aux visiteurs.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Theme avec valeurs par défaut
  const theme = {
    primaryColor: miniSiteData.theme?.primaryColor || '#1a365d',
    secondaryColor: miniSiteData.theme?.secondaryColor || '#2b6cb0',
    accentColor: miniSiteData.theme?.accentColor || '#4299e1',
    fontFamily: miniSiteData.theme?.fontFamily || 'Inter'
  };

  // Extraire les sections
  const heroSection = miniSiteData.sections?.find(s => s.type === 'hero');
  const aboutSection = miniSiteData.sections?.find(s => s.type === 'about');
  
  // Priorité au logo du mini-site, puis fallback sur le logo de l'exposant
  const effectiveLogoUrl = miniSiteData.logo_url || exhibitorData.logo_url;
  
  // Features/Values - S'assurer que c'est un array de strings
  let features = aboutSection?.content?.features || aboutSection?.content?.values || [];
  if (features.length > 0 && typeof features[0] === 'object') {
    // Si les features sont des objets, extraire les noms
    features = features.map((f: any) => f.name || f.title || f.label || '');
  }
  features = features.filter((f: any) => typeof f === 'string' && f.trim() !== '');
  
  // Contact info
  const contactInfo = exhibitorData.contact_info || {};
  const socialLinks = contactInfo.social || {};

  // Fonction de scroll avec offset pour le header sticky
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Hauteur du header sticky
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: theme.fontFamily }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BARRE DE NAVIGATION STICKY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <SafeImage 
                  src={miniSiteData?.logo_url || exhibitorData?.logo_url}
                  alt={exhibitorData?.company_name}
                  className="h-10 w-10 rounded object-contain"
                />
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {exhibitorData?.company_name}
                </span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                🏠 Vue d'ensemble
              </button>
              <button
                onClick={() => scrollToSection('products')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                📦 Produits
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                ℹ️ À propos
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                💬 Contact
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Lien copié !');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Partager"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate(ROUTES.EXHIBITORS)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                title="Retour"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION HERO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {heroSection?.content?.backgroundImage ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroSection.content.backgroundImage})` }}
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
            />
          )}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white pt-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <SafeImage 
              src={effectiveLogoUrl}
              alt={exhibitorData.company_name}
              className="h-36 w-36 mx-auto rounded-2xl bg-white p-4 shadow-2xl object-contain"
              fallback={
                <div className="h-36 w-36 mx-auto rounded-2xl bg-white p-4 shadow-2xl flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
              }
            />
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              SIB 2026 - Exposant Officiel
            </Badge>
          </motion.div>

          {/* Titre */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {heroSection?.content?.title || exhibitorData.company_name}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto"
          >
            {heroSection?.content?.subtitle || heroSection?.content?.description || exhibitorData.description || 'Solutions innovantes pour l\'industrie du bâtiment'}
          </motion.p>

          {/* Boutons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-xl"
              style={{ backgroundColor: theme.accentColor }}
              onClick={() => scrollToSection('products')}
            >
              {heroSection?.content?.ctaText || 'Découvrir nos solutions'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => scrollToSection('contact')}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Nous contacter
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 cursor-pointer"
          onClick={() => scrollToSection('about')}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION À PROPOS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full" style={{ 
            backgroundImage: `radial-gradient(circle, ${theme.accentColor} 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/50 text-blue-700 text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="h-4 w-4" />
              À propos de nous
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {aboutSection?.content?.title || 'Notre expertise'}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed mb-8">
              {aboutSection?.content?.description || aboutSection?.content?.text || exhibitorData.description || 'Nous sommes fiers de présenter nos solutions innovantes à SIB 2026.'}
            </p>
            
            {/* Certification Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <Award className="h-4 w-4 mr-2" />
                ISO 9001
              </Badge>
              <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <Award className="h-4 w-4 mr-2" />
                ISO 27001
              </Badge>
              <Badge className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <Star className="h-4 w-4 mr-2" />
                Certifié depuis 2008
              </Badge>
            </div>
          </div>

          {/* Features/Values - TOUJOURS AFFICHÉES avec design amélioré */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.length > 0 ? (
              features.map((feature: any, index: number) => {
                // Ensure feature is a string
                const featureName = typeof feature === 'string' ? feature : (feature?.name || feature?.title || '');
                if (!featureName) return null;
                
                const featureIcons = [Sparkles, Star, Award, CheckCircle2];
                const FeatureIcon = featureIcons[index % featureIcons.length];
                const isExpanded = expandedFeatures[index] || false;
                
                // Descriptions génériques basées sur les domaines courants
                const getFeatureDescription = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('transformation') || lowerTitle.includes('digital')) {
                    return "Accompagnement complet dans la digitalisation de vos processus et infrastructures pour optimiser votre compétitivité.";
                  }
                  if (lowerTitle.includes('cyber') || lowerTitle.includes('sécurité')) {
                    return "Protection avancée de vos systèmes et données contre les menaces cybernétiques avec des solutions de pointe.";
                  }
                  if (lowerTitle.includes('big data') || lowerTitle.includes('analytics')) {
                    return "Exploitation intelligente de vos données massives pour des décisions stratégiques éclairées et prédictives.";
                  }
                  if (lowerTitle.includes('intelligence') || lowerTitle.includes('ia') || lowerTitle.includes('ai')) {
                    return "Intégration d'algorithmes d'apprentissage automatique pour automatiser et optimiser vos opérations.";
                  }
                  if (lowerTitle.includes('cloud')) {
                    return "Infrastructure cloud évolutive et sécurisée pour une flexibilité maximale et une réduction des coûts.";
                  }
                  if (lowerTitle.includes('blockchain')) {
                    return "Technologie blockchain pour une traçabilité transparente et des transactions sécurisées et décentralisées.";
                  }
                  return "Solution complète et personnalisée adaptée à vos besoins spécifiques et enjeux métiers.";
                };
                
                return (
                  <Card 
                    key={featureName} 
                    className="p-8 text-center hover:shadow-2xl transition-all duration-300 group bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-blue-200 hover:-translate-y-2 relative overflow-hidden cursor-pointer"
                    onClick={() => setExpandedFeatures(prev => ({ ...prev, [index]: !prev[index] }))}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryColor}05, ${theme.accentColor}05)` }}
                    />
                    <div className="relative z-10">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}
                      >
                        <FeatureIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{featureName}</h3>
                      {isExpanded && (
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{getFeatureDescription(featureName)}</p>
                      )}
                      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4 transform origin-center transition-all duration-300 group-hover:w-full"></div>
                    </div>
                  </Card>
                );
              })
            ) : (
              // Valeurs par défaut avec icônes spécifiques
              [
                { title: 'Intelligence Artificielle Bâtiment', icon: Sparkles },
                { title: 'Plateforme IoT intégrée', icon: Star },
                { title: 'Support technique 24/7', icon: Users },
                { title: 'Déploiement international', icon: Globe }
              ].map((feature, index) => {
                const FeatureIcon = feature.icon;
                
                return (
                  <Card key={feature.title} className="p-8 text-center hover:shadow-2xl transition-all duration-300 group bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-blue-200 hover:-translate-y-2 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryColor}05, ${theme.accentColor}05)` }}
                    />
                    <div className="relative z-10">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}
                      >
                        <FeatureIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4 transform origin-center transition-all duration-300 group-hover:w-full"></div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Image About */}
          {(aboutSection?.content?.image || aboutSection?.content?.images?.length > 0) && (
            <div className={`grid grid-cols-1 gap-6 ${(aboutSection?.content?.images?.length > 0 || (aboutSection?.content?.image && aboutSection?.content?.images?.length > 0)) ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-2xl mx-auto'}`}>
              {aboutSection?.content?.image && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={aboutSection.content.image} 
                    alt="À propos"
                    className="w-full h-64 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              {aboutSection?.content?.images?.map((img: string) => (
                <div key={`img-${img.slice(-20)}`} className="rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={img} 
                    alt="Image galerie"
                    className="w-full h-64 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {aboutSection?.content?.stats?.length > 0 && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl" style={{ backgroundColor: `${theme.primaryColor}08` }}>
              {aboutSection.content.stats.map((stat: any) => (
                <div key={`stat-${stat.label || stat.number}`} className="text-center">
                  <div className="text-4xl font-bold mb-1" style={{ color: theme.primaryColor }}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION PRODUITS - Enhanced Modern Design */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="products" className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Header - Enhanced */}
          <div className="text-center mb-16">
            <Badge className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border-2 border-emerald-200/50 mb-6">
              <Sparkles className="h-4 w-4 mr-2 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Nos Solutions Premium</span>
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Produits & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez notre gamme complète de solutions innovantes pour transformer votre activité
            </p>
          </div>

          {/* Products Grid - Enhanced Cards */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-4 border-gray-100 hover:border-blue-200 group relative"
                >
                  {/* Animated border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500 pointer-events-none rounded-lg" />
                  
                  {/* Image with enhanced overlay */}
                  <div className="h-56 bg-gray-100 relative overflow-hidden">
                    <SafeImage 
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                            <Package className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      }
                    />
                    
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    {/* Stock & Category Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      {/* Stock Badge */}
                      {product.inStock !== false && (
                        <Badge className="px-3 py-1 text-xs font-bold shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          En stock
                        </Badge>
                      )}
                      
                      {/* Category Badge */}
                      {product.category && (
                        <Badge className="px-3 py-1 text-xs font-bold shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Content - Enhanced */}
                  <div className="p-6 relative z-10">
                    <h3 className="text-xl font-black mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Features with modern styling */}
                    {product.features?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {product.features.slice(0, 3).map((f: string) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-medium line-clamp-1">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Price & CTA - Enhanced */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 group-hover:border-blue-200 transition-colors">
                      <div className="flex-1">
                        {product.price ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">À partir de</span>
                            <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              {product.price}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">Tarif</span>
                            <span className="font-bold text-gray-700">Sur devis</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="rounded-xl px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <span className="mr-1">En savoir +</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl border-2 border-dashed border-gray-300">
              <div className="bg-gradient-to-br from-gray-100 to-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Aucun produit n'a encore été ajouté</p>
            </div>
          )}

          {/* Call to Action - Enhanced */}
          {products.length > 0 && (
            <Card className="mt-12 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-left flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    💬 Besoin d'une solution personnalisée ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Notre équipe d'experts est à votre disposition
                  </p>
                </div>
                <Button
                  size="lg"
                  className="rounded-xl px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => scrollToSection('contact')}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contactez-nous
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION CONTACT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              <MessageCircle className="h-4 w-4" />
              Contact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: theme.primaryColor }}>
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Notre équipe est à votre disposition
            </p>
          </div>

          {/* Contact Cards - TOUJOURS AU MOINS LES ÉLÉMENTS DE BASE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Email */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.accentColor}15` }}>
                <Mail className="h-7 w-7" style={{ color: theme.accentColor }} />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              {contactInfo.email ? (
                <a href={`mailto:${contactInfo.email}`} className="text-sm text-gray-600 hover:text-blue-600 break-all">
                  {contactInfo.email}
                </a>
              ) : (
                <span className="text-sm text-gray-400">Non renseigné</span>
              )}
            </Card>

            {/* Téléphone */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.secondaryColor}15` }}>
                <Phone className="h-7 w-7" style={{ color: theme.secondaryColor }} />
              </div>
              <h3 className="font-semibold mb-2">Téléphone</h3>
              {contactInfo.phone ? (
                <a href={`tel:${contactInfo.phone}`} className="text-sm text-gray-600 hover:text-blue-600">
                  {contactInfo.phone}
                </a>
              ) : (
                <span className="text-sm text-gray-400">Non renseigné</span>
              )}
            </Card>

            {/* Site Web */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <Globe className="h-7 w-7" style={{ color: theme.primaryColor }} />
              </div>
              <h3 className="font-semibold mb-2">Site Web</h3>
              {exhibitorData.website ? (
                <a href={exhibitorData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1">
                  Visiter <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-gray-400">Non renseigné</span>
              )}
            </Card>

            {/* Adresse */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-50">
                <MapPin className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="font-semibold mb-2">Adresse</h3>
              {contactInfo.address ? (
                <span className="text-sm text-gray-600">{contactInfo.address}</span>
              ) : (
                <span className="text-sm text-gray-400">Non renseignée</span>
              )}
            </Card>
          </div>

          {/* Social Links */}
          {Object.values(socialLinks).some(Boolean) && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Suivez-nous</p>
              <div className="flex justify-center gap-4">
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#0077B5' }}>
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#1877F2' }}>
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#1DA1F2' }}>
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#FF0000' }}>
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="py-12" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo & Name */}
            <div className="flex items-center gap-4">
              <SafeImage 
                src={effectiveLogoUrl}
                alt={exhibitorData.company_name}
                className="h-12 w-12 rounded-xl bg-white p-2 object-contain"
                fallback={<div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center"><Building2 className="h-6 w-6 text-white/60" /></div>}
              />
              <div className="text-white">
                <h3 className="font-bold text-lg">{exhibitorData.company_name}</h3>
                <p className="text-white/70 text-sm">Exposant SIB 2026</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{miniSiteData.views} vues</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(miniSiteData.last_updated).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center text-white/60 text-sm">
            <p>© {new Date().getFullYear()} {exhibitorData.company_name}. Tous droits réservés.</p>
            <p className="mt-2">
              Propulsé par <Link to={ROUTES.HOME} className="text-white hover:underline">SIB Platform</Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Modal Produit Améliorée */}
      <AnimatePresence>
        {selectedProduct && (
          <EnhancedProductModal
            product={selectedProduct}
            theme={theme}
            onClose={() => setSelectedProduct(null)}
            onContactClick={() => scrollToSection('contact')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
