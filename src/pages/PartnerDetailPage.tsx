import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../lib/routes';
import { getEmbedUrl } from '../utils/videoUtils';
import { 
  ArrowLeft,
  ExternalLink,
  MapPin,
  Users,
  Calendar,
  MessageCircle,
  Download,
  Share2,
  Star,
  Award,
  Phone,
  Mail,
  Globe,
  Building2,
  Eye,
  Target,
  TrendingUp,
  CheckCircle,
  Crown,
  Handshake,
  FileText,
  AlertCircle,
  Play,
  Image as ImageIcon,
  Briefcase,
  Shield,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Sparkles,
  Zap,
  Heart,
  ThumbsUp,
  ChevronRight,
  Quote,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  BookOpen,
  Layers,
  Network,
  Lightbulb,
  GraduationCap,
  Camera,
  Newspaper
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import LogoWithFallback from '../components/ui/LogoWithFallback';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  startDate: Date;
  endDate?: Date;
  budget: string;
  impact: string;
  image: string;
  technologies: string[];
  team: string[];
  kpis: {
    progress: number;
    satisfaction: number;
    roi: number;
  };
  timeline: Array<{
    phase: string;
    date: Date;
    status: 'completed' | 'current' | 'upcoming';
    description: string;
  }>;
  partners: string[];
  documents: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  gallery: string[];
}

interface Partner {
  id: string;
  name: string;
  type: 'platinum' | 'gold' | 'silver' | 'bronze' | 'institutional';
  category: string;
  description: string;
  longDescription?: string;
  logo: string;
  website?: string;
  country: string;
  sector: string;
  verified: boolean;
  featured: boolean;
  sponsorshipLevel: string;
  contributions: string[];
  establishedYear: number;
  employees: string;
  projects: Project[];
  // Nouveaux champs pour enrichir la page
  mission?: string;
  vision?: string;
  values?: string[];
  certifications?: string[];
  awards?: Array<{ name: string; year: number; issuer: string }>;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  keyFigures?: Array<{ label: string; value: string; icon: string }>;
  testimonials?: Array<{ quote: string; author: string; role: string; avatar?: string }>;
  news?: Array<{ title: string; date: Date; excerpt: string; image?: string }>;
  expertise?: string[];
  clients?: string[];
  videoUrl?: string;
  gallery?: string[];
}

// Les données du partenaire sont maintenant chargées depuis Supabase

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedNews, setSelectedNews] = useState<{ title: string; date: Date; excerpt: string; image?: string } | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExpertise, setExpandedExpertise] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const loadPartner = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await SupabaseService.getPartnerById(id);
        if (data) {
          setPartner(data);
          // Incrémenter les vues
          SupabaseService.incrementPartnerViews(id).catch(err => 
            console.error("Erreur incrémentation vues partenaire:", err)
          );
        } else {
          setError("Partenaire non trouvé");
        }
      } catch (err) {
        console.error("Erreur chargement partenaire:", err);
        setError("Erreur lors du chargement du partenaire");
      } finally {
        setIsLoading(false);
      }
    };

    loadPartner();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement du partenaire...
          </h3>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <Card className="max-w-lg w-full p-8 text-center shadow-xl border-0">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Handshake className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            {t('partner.notFound', 'Partenaire non disponible')}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error === "Partenaire non trouvé" 
              ? t('partner.notFoundDesc', "Ce partenaire n'a pas encore complété son profil ou n'est pas encore visible publiquement. Revenez bientôt pour découvrir notre réseau de partenaires !")
              : error || t('partner.notFoundGeneric', "Le partenaire que vous recherchez n'existe pas ou a été supprimé.")}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={ROUTES.PARTNERS}>
              <Button variant="outline" className="group w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                {t('partner.backToList', 'Voir tous les partenaires')}
              </Button>
            </Link>
            <Link to={ROUTES.HOME}>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full sm:w-auto">
                <Crown className="h-4 w-4 mr-2" />
                {t('partner.discoverSIB', 'Découvrir SIB 2026')}
              </Button>
            </Link>
          </div>
          
          {/* Message informatif */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-purple-600">{t('partner.areYouPartner', 'Vous êtes partenaire ?')}</span>
              <br />
              {t('partner.completeProfile', 'Complétez votre profil depuis votre tableau de bord pour apparaître dans notre annuaire des partenaires.')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'institutional': return Crown;
      case 'platinum': return Award;
      case 'gold': return Star;
      case 'silver': return Building2;
      case 'bronze': return Handshake;
      default: return Building2;
    }
  };

  const TypeIcon = getTypeIcon(partner.type);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'institutional': return 'bg-purple-100 text-purple-600';
      case 'platinum': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-600';
      case 'silver': return 'bg-gray-100 text-gray-600';
      case 'bronze': return 'bg-orange-100 text-orange-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'En cours';
      case 'planned': return 'Planifié';
      default: return status;
    }
  };

  const handleContact = () => {
    // Ouvrir un modal de contact ou rediriger vers la page de contact
    setShowContactModal(true);
  };

  const handleShare = () => {
    const shareData = {
      title: partner.name,
      text: `Découvrez ${partner.name} - ${partner.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      // Fallback: copier le lien dans le presse-papiers
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success('Lien copié dans le presse-papiers !'))
        .catch(() => toast.error('Impossible de copier le lien'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de validation pour les profils non publiés */}
      {partner.is_published === false && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <p className="text-base font-semibold text-center">
              ?? Fiche en cours de validation - Ce profil n'est pas encore visible publiquement
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link to={ROUTES.PARTNERS}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux partenaires
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-6"
          >
            <LogoWithFallback
              src={partner.logo}
              alt={partner.name}
              className="h-48 w-48 rounded-xl object-contain border-2 border-gray-200 bg-white p-4 shadow-sm"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {partner.name}
                </h1>
                {partner.verified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(partner.type)}`}>
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {partner.category}
                </div>
                <Badge variant="info" size="sm">
                  {partner.sector}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.country}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 max-w-3xl">
                {partner.description}
              </p>
              
              <div className="flex items-center space-x-4">
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Site officiel</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                <Button variant="default" size="sm" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
                
                <Button variant="default" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
              
              {/* Réseaux sociaux */}
              {partner.socialMedia && (
                <div className="flex items-center space-x-3 mt-4">
                  {partner.socialMedia.linkedin && (
                    <a href={partner.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {partner.socialMedia.twitter && (
                    <a href={partner.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors">
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {partner.socialMedia.facebook && (
                    <a href={partner.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {partner.socialMedia.youtube && (
                    <a href={partner.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs - Plus d'onglets */}
        <div className="mb-8 overflow-x-auto">
          <nav className="flex space-x-2 md:space-x-4 min-w-max pb-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
              { id: 'about', label: 'À propos', icon: Building2 },
              { id: 'expertise', label: 'Expertise', icon: Lightbulb },
              { id: 'projects', label: 'Projets', icon: Target },
              { id: 'gallery', label: 'Galerie', icon: ImageIcon },
              { id: 'news', label: 'Actualités', icon: BookOpen },
              { id: 'contact', label: 'Contact', icon: MessageCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero Stats avec chiffres clés */}
            {Array.isArray(partner.keyFigures) && partner.keyFigures.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {partner.keyFigures.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all" />
                    <div className="relative p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-3 shadow-lg">
                        {stat.icon === 'Calendar' && <Calendar className="h-6 w-6" />}
                        {stat.icon === 'Users' && <Users className="h-6 w-6" />}
                        {stat.icon === 'Target' && <Target className="h-6 w-6" />}
                        {stat.icon === 'ThumbsUp' && <ThumbsUp className="h-6 w-6" />}
                        {stat.icon === 'TrendingUp' && <TrendingUp className="h-6 w-6" />}
                        {stat.icon === 'Globe' && <Globe className="h-6 w-6" />}
                        {stat.icon === 'BarChart3' && <BarChart3 className="h-6 w-6" />}
                        {!['Calendar','Users','Target','ThumbsUp','TrendingUp','Globe','BarChart3'].includes(stat.icon) && <Activity className="h-6 w-6" />}
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-blue-300" />
                <p className="text-gray-600 font-medium">Les chiffres clés seront disponibles bientôt</p>
              </Card>
            )}

            {/* Description longue avec vidéo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Qui sommes-nous ?
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  {partner.longDescription || partner.description}
                </p>
                
                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {partner.mission && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-900">Notre Mission</h4>
                      </div>
                      <p className="text-sm text-blue-800">{partner.mission}</p>
                    </div>
                  )}
                  {partner.vision && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center mb-2">
                        <Eye className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-900">Notre Vision</h4>
                      </div>
                      <p className="text-sm text-purple-800">{partner.vision}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Vidéo de présentation */}
              <Card className="p-0 overflow-hidden">
                {partner.videoUrl ? (
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <img 
                        src={partner.gallery?.[0] || partner.logo || ''}
                        alt="Video thumbnail"
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                      />
                      <div className="relative z-10 w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-blue-600 ml-1" />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="font-medium">Découvrez {partner.name}</p>
                        <p className="text-sm text-white/80">Vidéo de présentation</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-80" />
                      <p className="font-semibold">Vidéo bientôt disponible</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Valeurs */}
            {partner.values && partner.values.length > 0 ? (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Nos Valeurs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {partner.values.map((value, index) => {
                    const valText = typeof value === 'object' ? ((value as any).name || JSON.stringify(value)) : String(value);
                    return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{valText}</span>
                    </motion.div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <Heart className="h-10 w-10 mx-auto mb-3 text-red-200" />
                <p className="text-gray-500 font-medium">Les valeurs de l'organisation seront disponibles bientôt</p>
              </Card>
            )}

            {/* Certifications & Récompenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certifications */}
              {partner.certifications && partner.certifications.length > 0 ? (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Certifications
                  </h3>
                  <div className="space-y-3">
                    {partner.certifications.map((cert, idx) => {
                      const certText = typeof cert === 'object' ? ((cert as any).name || JSON.stringify(cert)) : String(cert);
                      return (
                      <div key={idx} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-900">{certText}</span>
                      </div>
                      );
                    })}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <Shield className="h-10 w-10 mx-auto mb-3 text-green-200" />
                  <p className="text-gray-500 font-medium">Les certifications seront disponibles bientôt</p>
                </Card>
              )}

              {/* Récompenses */}
              {partner.awards && partner.awards.length > 0 ? (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Récompenses
                  </h3>
                  <div className="space-y-3">
                    {partner.awards.map((award, idx) => {
                      const awardName = typeof award === 'string' ? award : (award?.name || '');
                      const awardIssuer = typeof award === 'string' ? '' : (award?.issuer || '');
                      const awardYear = typeof award === 'string' ? '' : (award?.year || '');
                      return (
                      <div key={idx} className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <Star className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">{awardName}</p>
                          {(awardIssuer || awardYear) && <p className="text-xs text-yellow-700">{awardIssuer}{awardIssuer && awardYear ? ' • ' : ''}{awardYear}</p>}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <Award className="h-10 w-10 mx-auto mb-3 text-yellow-200" />
                  <p className="text-gray-500 font-medium">Les récompenses seront disponibles bientôt</p>
                </Card>
              )}
            </div>

            {/* Témoignages */}
            {partner.testimonials && partner.testimonials.length > 0 ? (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Quote className="h-5 w-5 mr-2 text-blue-600" />
                  Ce que disent nos partenaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partner.testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.author}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white p-6 rounded-xl shadow-sm"
                    >
                      <Quote className="h-8 w-8 text-blue-200 mb-4" />
                      <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                      <div className="flex items-center">
                        {testimonial.avatar && (
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.author}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.author}</p>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <Quote className="h-10 w-10 mx-auto mb-3 text-blue-200" />
                <p className="text-gray-500 font-medium">Les témoignages seront disponibles bientôt</p>
              </Card>
            )}

            {/* Contributions SIB */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Handshake className="h-5 w-5 mr-2 text-indigo-600" />
                Contributions au Salon SIB 2026
              </h3>
              {partner.contributions && partner.contributions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {partner.contributions.map((contribution, idx) => {
                  const text = typeof contribution === 'object' && contribution !== null
                    ? ((contribution as any).name || (contribution as any).description || JSON.stringify(contribution))
                    : String(contribution);
                  return (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-indigo-900">{text}</span>
                  </motion.div>
                  );
                })}
              </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Zap className="h-10 w-10 mx-auto mb-3 text-indigo-200" />
                  <p className="font-medium">Les contributions seront disponibles bientôt</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Onglet À propos */}
        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de {partner.name}</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">{partner.longDescription || partner.description}</p>
                
                {partner.mission && (
                  <div className="my-8 p-6 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Notre Mission</h3>
                    <p className="text-blue-800">{partner.mission}</p>
                  </div>
                )}
                
                {partner.vision && (
                  <div className="my-8 p-6 bg-purple-50 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">Notre Vision</h3>
                    <p className="text-purple-800">{partner.vision}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline historique */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Notre Histoire
              </h3>
              <div className="text-center py-8">
                <Clock className="h-10 w-10 mx-auto mb-3 text-blue-200" />
                <p className="text-gray-500 font-medium">L'historique détaillé sera disponible bientôt</p>
              </div>
            </Card>

            {/* Clients référents */}
            {partner.clients && partner.clients.length > 0 ? (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                  Ils nous font confiance
                </h3>
                <div className="flex flex-wrap gap-3">
                  {partner.clients.map((client, idx) => {
                    const clientText = typeof client === 'object' ? ((client as any).name || JSON.stringify(client)) : String(client);
                    return (
                    <Badge key={idx} variant="info" size="md" className="px-4 py-2">
                      {clientText}
                    </Badge>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <Briefcase className="h-10 w-10 mx-auto mb-3 text-green-200" />
                <p className="text-gray-500 font-medium">La liste des clients sera disponible bientôt</p>
              </Card>
            )}
          </motion.div>
        )}

        {/* Onglet Expertise */}
        {activeTab === 'expertise' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Domaines d'expertise */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-600" />
                  Nos Domaines d'Expertise
                </h3>
                <div className="space-y-4">
                  {(partner.expertise || []).length > 0 ? (partner.expertise || []).map((exp, index) => {
                    const isExpanded = expandedExpertise[index] || false;
                    
                    // Descriptions génériques basées sur les domaines courants
                    const getExpertiseDescription = (title: string) => {
                      const lowerTitle = title.toLowerCase();
                      // Infrastructure & Équipement
                      if (lowerTitle.includes('routière') || lowerTitle.includes('routes') || lowerTitle.includes('route')) {
                        return "Planification, construction et entretien du réseau routier national incluant routes nationales, régionales et provinciales pour une connectivité territoriale optimale.";
                      }
                      if (lowerTitle.includes('port') && (lowerTitle.includes('construction') || lowerTitle.includes('infrastructure'))) {
                        return "Développement, modernisation et gestion des infrastructures BTP stratégiques pour renforcer la compétitivité construction et le commerce international du Maroc.";
                      }
                      if (lowerTitle.includes('eau') || lowerTitle.includes('ressources en eau') || lowerTitle.includes('hydraulique')) {
                        return "Gestion intégrée des ressources hydriques du pays : mobilisation, distribution, assainissement et préservation des ressources en eau face aux défis du changement climatique.";
                      }
                      if (lowerTitle.includes('aéroport') || lowerTitle.includes('aérien') || lowerTitle.includes('aviation')) {
                        return "Conception, construction et supervision des infrastructures aéroBTP assurant la connectivité aérienne nationale et internationale du Maroc.";
                      }
                      if (lowerTitle.includes('autoroute') || lowerTitle.includes('voies express')) {
                        return "Planification et déploiement du réseau autoroutier et des voies express pour désenclaver les régions et fluidifier les échanges économiques à l'échelle nationale.";
                      }
                      if (lowerTitle.includes('barrage') || lowerTitle.includes('ouvrage')) {
                        return "Construction et exploitation de grands barrages et ouvrages hydrauliques pour la régulation des eaux, l'irrigation agricole et la production d'énergie hydroélectrique.";
                      }
                      if (lowerTitle.includes('météo') || lowerTitle.includes('climatol')) {
                        return "Service de prévision météorologique, surveillance climatique et alerte précoce pour la protection des personnes, des biens et le soutien aux secteurs économiques sensibles.";
                      }
                      if (lowerTitle.includes('aménagement') || lowerTitle.includes('territoire')) {
                        return "Élaboration des schémas d'aménagement du territoire et coordination des politiques de développement spatial pour un équilibre régional durable.";
                      }
                      // Transport & Logistique
                      if (lowerTitle.includes('transport routier')) {
                        return "Régulation et développement du transport routier de personnes et de marchandises, incluant la sécurité routière et la modernisation du parc véhicules.";
                      }
                      if (lowerTitle.includes('transport construction') || lowerTitle.includes('marine marchande')) {
                        return "Encadrement et développement du transport construction et de la marine marchande, incluant la réglementation, la sécurité et la compétitivité de la flotte nationale.";
                      }
                      if (lowerTitle.includes('transport aérien')) {
                        return "Supervision du transport aérien civil, promotion de la connectivité aérienne et développement des accords de ciel ouvert pour renforcer l'attractivité du Maroc.";
                      }
                      if (lowerTitle.includes('ferroviaire') || lowerTitle.includes('train') || lowerTitle.includes('lgv')) {
                        return "Planification et développement du réseau ferroviaire incluant les lignes à grande vitesse et les services de transport de passagers et de fret.";
                      }
                      if (lowerTitle.includes('logistique') || lowerTitle.includes('supply') || lowerTitle.includes('chaîne')) {
                        return "Mise en œuvre de la stratégie nationale logistique visant à réduire les coûts, développer les zones logistiques et optimiser les flux de marchandises.";
                      }
                      if (lowerTitle.includes('sécurité routière')) {
                        return "Politique nationale de sécurité routière : prévention des accidents, sensibilisation, contrôle technique et amélioration des infrastructures de sécurité.";
                      }
                      if (lowerTitle.includes('réglementation')) {
                        return "Élaboration du cadre juridique et réglementaire régissant les activités de transport, de logistique et de mobilité au niveau national.";
                      }
                      // BTP & BTP
                      if (lowerTitle.includes('navigation') || lowerTitle.includes('voies navigable')) {
                        return "Développement et maintenance des infrastructures de navigation intérieure et côtière pour un transport fluvial et construction sûr et efficace.";
                      }
                      if (lowerTitle.includes('bâtiment') && !lowerTitle.includes('construction')) {
                        return "Gestion et développement des infrastructures BTP pour améliorer la compétitivité des ports et faciliter les échanges commerciaux.";
                      }
                      if (lowerTitle.includes('waterborne') || lowerTitle.includes('inland') || lowerTitle.includes('fluvial')) {
                        return "Infrastructure et opérations de transport par voies navigables intérieures et BTP pour une mobilité durable et économique.";
                      }
                      // Industrie & Économie
                      if (lowerTitle.includes('métallurg') || lowerTitle.includes('sidérurg') || lowerTitle.includes('acier')) {
                        return "Développement et structuration des industries métallurgiques et sidérurgiques pour une production compétitive et conforme aux normes internationales.";
                      }
                      if (lowerTitle.includes('mécanique') || lowerTitle.includes('électromécanique')) {
                        return "Promotion et accompagnement des industries mécaniques et électromécaniques dans leur montée en compétence et leur intégration aux chaînes de valeur mondiales.";
                      }
                      if (lowerTitle.includes('industriel') || lowerTitle.includes('industrie')) {
                        return "Soutien au tissu industriel national par l'accompagnement stratégique, la veille sectorielle et la facilitation de l'accès aux marchés.";
                      }
                      // Culture & Patrimoine
                      if (lowerTitle.includes('art') || lowerTitle.includes('artistique') || lowerTitle.includes('création')) {
                        return "Promotion de la création artistique contemporaine et soutien aux artistes à travers des expositions, résidences et programmes de médiation culturelle.";
                      }
                      if (lowerTitle.includes('patrimoine') || lowerTitle.includes('héritage')) {
                        return "Préservation, valorisation et diffusion du patrimoine culturel matériel et immatériel pour les générations futures.";
                      }
                      if (lowerTitle.includes('musée') || lowerTitle.includes('muséo') || lowerTitle.includes('exposition')) {
                        return "Développement et gestion d'espaces muséaux et d'expositions pour la découverte et l'éducation du public autour de l'art et de l'histoire.";
                      }
                      // Académique & Formation
                      if (lowerTitle.includes('formation') || lowerTitle.includes('enseignement') || lowerTitle.includes('pédagogie')) {
                        return "Programmes de formation spécialisée alliant théorie et pratique pour préparer les professionnels aux défis des secteurs construction et bâtiment.";
                      }
                      if (lowerTitle.includes('recherche') || lowerTitle.includes('r&d') || lowerTitle.includes('innovation')) {
                        return "Activités de recherche scientifique et d'innovation technologique pour développer de nouvelles solutions adaptées aux enjeux du secteur.";
                      }
                      if (lowerTitle.includes('naval') || lowerTitle.includes('marine')) {
                        return "Ingénierie et expertise navale couvrant la conception, la construction et la maintenance des navires et systèmes BTP.";
                      }
                      if (lowerTitle.includes('vts') || lowerTitle.includes('trafic') || lowerTitle.includes('surveillance')) {
                        return "Systèmes de surveillance et de gestion du trafic construction pour la sécurité de la navigation et la protection de l'environnement côtier.";
                      }
                      // Sécurité & Défense
                      if (lowerTitle.includes('sécurité publique') || lowerTitle.includes('sûreté') || lowerTitle.includes('ordre public')) {
                        return "Maintien de l'ordre public et protection des personnes et des biens sur l'ensemble du territoire national.";
                      }
                      if (lowerTitle.includes('police') || lowerTitle.includes('judiciaire') || lowerTitle.includes('gendarmerie')) {
                        return "Missions de police judiciaire et administrative au service de la justice et de la sécurité des citoyens.";
                      }
                      // Réseaux & Coopération
                      if (lowerTitle.includes('coopération') || lowerTitle.includes('international')) {
                        return "Développement de partenariats internationaux et échanges d'expertise pour promouvoir les meilleures pratiques et renforcer les capacités.";
                      }
                      if (lowerTitle.includes('réseau') || lowerTitle.includes('networking')) {
                        return "Animation d'un réseau professionnel dynamique favorisant les échanges, le mentorat et les opportunités de collaboration.";
                      }
                      if (lowerTitle.includes('plaidoyer') || lowerTitle.includes('advocacy') || lowerTitle.includes('promotion')) {
                        return "Actions de plaidoyer et de sensibilisation pour promouvoir l'inclusion, la diversité et l'égalité des chances dans le secteur.";
                      }
                      // Digital & Tech
                      if (lowerTitle.includes('transformation') || lowerTitle.includes('digital')) {
                        return "Accompagnement complet dans la digitalisation de vos processus et infrastructures pour optimiser votre compétitivité.";
                      }
                      if (lowerTitle.includes('cyber') || lowerTitle.includes('sécurité informatique')) {
                        return "Protection avancée de vos systèmes et données contre les menaces cybernétiques avec des solutions de pointe.";
                      }
                      if (lowerTitle.includes('big data') || lowerTitle.includes('analytics') || lowerTitle.includes('données')) {
                        return "Exploitation intelligente de vos données massives pour des décisions stratégiques éclairées et prédictives.";
                      }
                      if (lowerTitle.includes('intelligence artificielle') || lowerTitle.includes('ia') || lowerTitle.includes('ai')) {
                        return "Intégration d'algorithmes d'apprentissage automatique pour automatiser et optimiser vos opérations.";
                      }
                      if (lowerTitle.includes('cloud')) {
                        return "Infrastructure cloud évolutive et sécurisée pour une flexibilité maximale et une réduction des coûts.";
                      }
                      if (lowerTitle.includes('blockchain')) {
                        return "Technologie blockchain pour une traçabilité transparente et des transactions sécurisées et décentralisées.";
                      }
                      if (lowerTitle.includes('iot') || lowerTitle.includes('objets connectés')) {
                        return "Solutions IoT innovantes pour connecter, surveiller et optimiser vos équipements et infrastructures en temps réel.";
                      }
                      if (lowerTitle.includes('durable') || lowerTitle.includes('environnement') || lowerTitle.includes('écologi')) {
                        return "Stratégies de développement durable intégrant réduction d'empreinte carbone, efficacité énergétique et préservation des écosystèmes.";
                      }
                      // Normalisation & Standards
                      if (lowerTitle.includes('normalisation') || lowerTitle.includes('norme') || lowerTitle.includes('standard')) {
                        return "Élaboration et diffusion de normes et standards techniques pour garantir la qualité, la sécurité et l'interopérabilité.";
                      }
                      if (lowerTitle.includes('veille') || lowerTitle.includes('intelligence économique')) {
                        return "Activités de veille stratégique et technologique pour anticiper les évolutions du marché et orienter les décisions.";
                      }
                      if (lowerTitle.includes('compétitivité') || lowerTitle.includes('export') || lowerTitle.includes('marché')) {
                        return "Accompagnement des entreprises dans leur développement commercial, à l'export et sur les marchés internationaux.";
                      }
                      // Fallback intelligent basé sur le contexte du partenaire
                      return `Expertise reconnue en ${title.toLowerCase()} au service de l'excellence et de l'innovation dans le secteur.`;
                    };
                    
                    return (
                      <motion.div
                        key={exp}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setExpandedExpertise(prev => ({ ...prev, [index]: !prev[index] }))}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-800 flex-1">{exp}</span>
                          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                        {isExpanded && (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 ml-14 text-sm text-gray-600 leading-relaxed"
                          >
                            {getExpertiseDescription(exp)}
                          </motion.p>
                        )}
                      </motion.div>
                    );
                  }) : (
                    <div className="text-center py-6">
                      <Layers className="h-10 w-10 mx-auto mb-3 text-blue-200" />
                      <p className="text-gray-500 font-medium">Les domaines d'expertise seront disponibles bientôt</p>
                    </div>
                  )}
                </div>
              </Card>
              {/* Expertise - Utiliser les vraies données de la DB */}
              {partner.expertise && partner.expertise.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Network className="h-5 w-5 mr-2 text-blue-600" />
                    Domaines d'Expertise
                  </h3>
                  <div className="grid gap-3">
                    {partner.expertise.map((exp, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{exp}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Certifications */}
            {partner.certifications && partner.certifications.length > 0 ? (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                  Certifications & Accréditations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {partner.certifications.map((cert, idx) => {
                    const certText = typeof cert === 'object' ? ((cert as any).name || JSON.stringify(cert)) : String(cert);
                    return (
                    <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                      <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">{certText}</p>
                    </div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 text-green-200" />
                <p className="text-gray-500 font-medium">Les certifications seront disponibles bientôt</p>
              </Card>
            )}
          </motion.div>
        )}

        {/* Onglet Galerie */}
        {activeTab === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Galerie Photos</h2>
              {partner.gallery?.length > 0 && <Badge variant="info">{partner.gallery.length} photos</Badge>}
            </div>
            
            {partner.gallery && partner.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {partner.gallery.map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setSelectedImage(image);
                    setShowGalleryModal(true);
                  }}
                >
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <p className="text-gray-600 font-medium">La galerie photo sera disponible bientôt</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Onglet Actualités */}
        {activeTab === 'news' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dernières Actualités</h2>
            
            {partner.news && partner.news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {partner.news.map((news, index) => (
                <motion.div
                  key={news.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card hover className="h-full overflow-hidden">
                    {news.image && (
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-5">
                      <span className="text-sm text-blue-600 font-medium">
                        {formatDate(new Date(news.date))}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3">{news.title}</h3>
                      <p className="text-gray-600 text-sm">{news.excerpt}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setSelectedNews(news);
                          setShowNewsModal(true);
                        }}
                      >
                        Lire plus <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Newspaper className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <p className="text-gray-600 font-medium">Les actualités seront disponibles bientôt</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nos Projets</h2>
              {partner.projects?.length > 0 && <Badge variant="success">{partner.projects.length} projets</Badge>}
            </div>
            {partner.projects && partner.projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {partner.projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full overflow-hidden">
                    <div className="relative">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(project.name)}`;
                        }}
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(project.status)}`} size="sm">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {project.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {project.kpis.progress}%
                          </div>
                          <div className="text-xs text-gray-600">Avancement</div>
                        </div>
                        <div className="text-center border-x border-gray-200">
                          <div className="text-lg font-bold text-green-600">
                            {project.kpis.satisfaction}%
                          </div>
                          <div className="text-xs text-gray-600">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {project.kpis.roi}%
                          </div>
                          <div className="text-xs text-gray-600">ROI</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="default"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => handleViewProjectDetails(project)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            ) : (
              <Card className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-blue-200" />
                <p className="text-gray-600 font-medium">Les projets seront disponibles bientôt</p>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Informations de Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-lg">Coordonnées</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Entreprise</p>
                        <p className="font-medium text-gray-900">{partner.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Localisation</p>
                        <p className="font-medium text-gray-900">{partner.country}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-gray-900">+212 5 22 XX XX XX</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">contact@{partner?.name?.toLowerCase().replace(/\s+/g, '') || 'contact'}.com</p>
                      </div>
                    </div>
                    
                    {partner.website && (
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Globe className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Site web</p>
                          <a href={partner.website} className="font-medium text-blue-600 hover:underline">
                            {partner.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-4">Contact SIB</h4>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Ahmed El Mansouri</p>
                        <p className="text-sm text-gray-600">Directeur Partenariats</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        ahmed.mansouri@portcasablanca.ma
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                        +212 5 22 XX XX XX
                      </p>
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600"
                      onClick={handleContact}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modal Vidéo */}
      {showVideoModal && partner.videoUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowVideoModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <ArrowLeft className="h-8 w-8" />
            </button>
            {getEmbedUrl(partner.videoUrl) && (
              <iframe
                src={getEmbedUrl(partner.videoUrl)!}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </motion.div>
        </div>
      )}

      {/* Modal Article / News */}
      {showNewsModal && selectedNews && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowNewsModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image de l'article */}
            {selectedNews.image && (
              <div className="relative">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
                <button
                  onClick={() => setShowNewsModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </button>
              </div>
            )}
            
            {/* Contenu de l'article */}
            <div className="p-6">
              {!selectedNews.image && (
                <button
                  onClick={() => setShowNewsModal(false)}
                  className="mb-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary" className="bg-blue-100 text-blue-700">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Article
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDate(new Date(selectedNews.date))}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedNews.title}
              </h2>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedNews.excerpt}
                </p>
                
                {/* Contenu étendu généré */}
                <p className="text-gray-600 leading-relaxed mb-4">
                  Cette actualité témoigne de l'engagement continu de {partner.name} dans l'innovation et le développement du secteur du bâtiment. 
                  Notre équipe travaille sans relâche pour apporter des solutions innovantes qui répondent aux défis actuels du secteur de la construction.
                </p>
                
                <p className="text-gray-600 leading-relaxed mb-4">
                  Ce projet s'inscrit dans notre stratégie globale de transformation digitale et de développement durable, 
                  en ligne avec notre mission : "{partner.mission?.substring(0, 100)}..."
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                    Points clés
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Innovation technologique au service du secteur du bâtiment
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Engagement pour le développement durable
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      Partenariats stratégiques renforcés
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
                <Button 
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => setShowNewsModal(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Galerie */}
      {showGalleryModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowGalleryModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGalleryModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <ArrowLeft className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Gallery"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </motion.div>
        </div>
      )}

      {/* Modal Détails Projet */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-blue-100">{partner.name}</p>
                </div>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <Badge className={getStatusColor(selectedProject.status)} size="sm">
                  {getStatusLabel(selectedProject.status)}
                </Badge>
                <span className="text-blue-100 text-sm">
                  Budget: {selectedProject.budget}
                </span>
                <span className="text-blue-100 text-sm">
                  Impact: {selectedProject.impact}
                </span>
              </div>
            </div>

            {/* Contenu Modal */}
            <div className="p-6">
              {/* Image Principale */}
              <div className="mb-6">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  className="w-full h-64 object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/800x400/e2e8f0/64748b?text=${encodeURIComponent(selectedProject.name)}`;
                  }}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description du Projet
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Détails Techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Détails Techniques</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <Badge className={getStatusColor(selectedProject.status)} size="sm">
                        {getStatusLabel(selectedProject.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Début:</span>
                      <span className="font-medium">{formatDate(selectedProject.startDate)}</span>
                    </div>
                    {selectedProject.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fin prévue:</span>
                        <span className="font-medium">{formatDate(selectedProject.endDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-bold text-green-600">{selectedProject.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Équipe:</span>
                      <span className="font-medium">
                        {selectedProject.status === 'completed' ? '45 experts' : 
                         selectedProject.status === 'active' ? '32 experts' : '15 experts'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">KPIs du Projet</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Avancement</span>
                        <span className="font-medium">{selectedProject.kpis.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedProject.kpis.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Satisfaction</span>
                        <span className="font-medium">{selectedProject.kpis.satisfaction}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedProject.kpis.satisfaction}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">ROI</span>
                        <span className="font-medium">{selectedProject.kpis.roi}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(selectedProject.kpis.roi, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies Utilisées */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Technologies Utilisées</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech: string) => (
                    <Badge key={tech} variant="info" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Chronologie du Projet */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Chronologie du Projet</h4>
                <div className="space-y-4">
                  {selectedProject.timeline.map((phase: Project['timeline'][0]) => (
                    <div key={phase.phase} className="flex items-start space-x-4">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        phase.status === 'completed' ? 'bg-green-500' :
                        phase.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-gray-900">{phase.phase}</h5>
                          <span className="text-sm text-gray-500">{formatDate(phase.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partenaires du Projet */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Partenaires du Projet</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.partners.map((partnerName: string) => (
                    <Badge key={partnerName} variant="success" size="sm">
                      <Handshake className="h-3 w-3 mr-1" />
                      {partnerName}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Documents et Ressources */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Documents & Ressources</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedProject.documents.map((doc: Project['documents'][0]) => (
                    <div key={doc.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Galerie Photos */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Galerie du Projet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedProject.gallery.map((image: string, index: number) => (
                    <img
                      key={`gallery-${image.slice(-20)}-${index}`}
                      src={image}
                      alt={`Projet ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://placehold.co/400x300/e2e8f0/64748b?text=Photo+${index + 1}`;
                      }}                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button variant="default" className="flex-1" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter l'Équipe Projet
                </Button>
                <Button variant="default" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    if (selectedProject) {
                      // Créer un rapport complet
                      const report = `
==============================================
RAPPORT DE PROJET COMPLET
==============================================

Projet: ${selectedProject.name}
Client: ${selectedProject.client}
Statut: ${getStatusLabel(selectedProject.status)}
Période: ${formatDate(new Date(selectedProject.startDate))} - ${formatDate(new Date(selectedProject.endDate))}

DESCRIPTION
${selectedProject.description}

INDICATEURS CLÉS (KPIs)
- Avancement: ${selectedProject.kpis.progress}%
- Satisfaction: ${selectedProject.kpis.satisfaction}%
- ROI: ${selectedProject.kpis.roi}%

BUDGET
${selectedProject.budget}

TECHNOLOGIES
${selectedProject.technologies.join(', ')}

ÉQUIPE
${selectedProject.team.map(m => `- ${m.name} (${m.role})`).join('\n')}

JALONS PRINCIPAUX
${selectedProject.milestones.map(m => `- ${m.title} (${m.date}) ${m.completed ? '? Complété' : '? En cours'}`).join('\n')}

DÉFIS ET SOLUTIONS
${selectedProject.challenges.map(c => `
Défi: ${c.challenge}
Solution: ${c.solution}
`).join('\n')}

TÉMOIGNAGE CLIENT
"${selectedProject.testimonial.text}"
- ${selectedProject.testimonial.author}, ${selectedProject.testimonial.role}

==============================================
Rapport généré le ${new Date().toLocaleDateString('fr-FR')}
==============================================
                      `;
                      
                      // Créer et télécharger le fichier
                      const blob = new Blob([report], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Rapport_${selectedProject.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      
                      toast.success('Rapport téléchargé avec succès');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Rapport Complet
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Contact */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacter {partner.name}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre nom
                  </label>
                  <input type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom complet"
                   aria-label="Votre nom complet" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                   aria-label="votre@email.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Objet de votre message"
                   aria-label="Objet de votre message" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre message..."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowContactModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      toast.success('Message envoyé avec succès !');
                      setShowContactModal(false);
                    }}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};



