import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
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
  Package,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import MiniSitePreview from '../components/minisite/MiniSitePreview';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { ROUTES } from '../lib/routes';
import { useExhibitorStore } from '../store/exhibitorStore';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';
import { SupabaseService } from '../services/supabaseService';
import type { Exhibitor } from '../types';

export default function ExhibitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof typeof CONFIG.tabIds>(CONFIG.tabIds.overview);

  useEffect(() => {
    const loadExhibitor = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await SupabaseService.getExhibitorById(id);
        setExhibitor(data);
      } catch (error) {
        console.error('Erreur chargement exposant:', error);
        setExhibitor(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadExhibitor();
  }, [id]);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/appointments?exhibitor=${exhibitor?.id}`);
    } else {
      navigate(`/appointments?exhibitor=${exhibitor?.id}`);
    }
  };

  // Fonction pour gérer le clic sur le bouton Message
  const handleMessageClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/messages?userId=${exhibitor?.id}`);
    } else {
      navigate(`/messages?userId=${exhibitor?.id}`);
    }
  };

  const handleContact = () => {
    if (exhibitor?.contactInfo?.email) {
      window.open(`mailto:${exhibitor.contactInfo.email}`, '_blank');
    } else {
      toast.error('Adresse email non disponible');
    }
  };

  const handleShare = () => {
    const shareData = {
      title: `Découvrez ${exhibitor?.companyName}`,
      text: exhibitor?.description,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success('Lien copié dans le presse-papiers !'))
        .catch(() => toast.error('Impossible de copier le lien'));
    }
  };

  const handleDownloadBrochure = () => {
    // Get brochure URL from exhibitor data
    const brochureUrl = exhibitor?.brochure_url || exhibitor?.documents?.[0]?.url;

    if (!brochureUrl) {
      toast.error('Brochure non disponible pour cet exposant');
      return;
    }

    const link = document.createElement('a');
    link.href = brochureUrl;
    link.download = `${exhibitor?.companyName || 'exposant'}-brochure.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Téléchargement de la brochure démarré');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement de l'exposant...
          </h3>
        </div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement de l'exposant...
          </h3>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'institutional': return Crown;
      case 'port-industry': return Building2;
      case 'port-operations': return Target;
      case 'academic': return Award;
      default: return Building2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'institutional': return 'bg-purple-100 text-purple-600';
      case 'port-industry': return 'bg-blue-100 text-blue-600';
      case 'port-operations': return 'bg-green-100 text-green-600';
      case 'academic': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'institutional': return 'Institutionnel';
      case 'port-industry': return 'Industrie Portuaire';
      case 'port-operations': return 'Exploitation & Gestion';
      case 'academic': return 'Académique & Formation';
      default: return category;
    }
  };

  const CategoryIcon = getCategoryIcon(exhibitor.category);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Banner de validation pour les profils non publiés */}
      {exhibitor.isPublished === false && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <p className="text-base font-semibold text-center">
              ?? Fiche en cours de validation - Ce profil n'est pas encore visible publiquement
            </p>
          </div>
        </div>
      )}

      {/* Hero Banner Ultra-Premium */}
      <div className="relative min-h-[600px] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Sophistiqué */}
        <div className="absolute inset-0 bg-slate-950">
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay scale-110"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-[#f8fafc]" />
          
          {/* Cercles de Lumière & Patterns */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link to={ROUTES.EXHIBITORS} className="group inline-flex items-center space-x-3 text-white/50 hover:text-white transition-all">
              <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Retour au Catalogue</span>
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-end gap-12">
            {/* Logo avec traitement de luxe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative shrink-0"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-[3rem] blur-2xl" />
              <div className="relative h-56 w-56 rounded-[2.5rem] bg-white p-6 shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center">
                <img
                  src={exhibitor.logo || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={exhibitor.companyName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {exhibitor.featured && (
                <div className="absolute -top-4 -right-4 h-14 w-14 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-900 rotate-12">
                  <Crown className="h-7 w-7 text-white" />
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 animate-pulse" />
                    SIB 2026 OFFICIAL
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center shadow-lg border-2 border-white/10 ${getCategoryColor(exhibitor.category).replace('bg-', 'bg-opacity-90 bg-')}`}>
                    <CategoryIcon className="h-3 w-3 mr-2" />
                    {getCategoryLabel(exhibitor.category)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none flex items-center gap-4">
                    {exhibitor.companyName}
                    {exhibitor.verified && (
                      <CheckCircle className="h-10 w-10 text-blue-500 fill-blue-500/10" />
                    )}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {exhibitor.contactInfo?.city && (
                    <div className="flex items-center space-x-3 text-white/60 font-bold">
                      <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <MapPin className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-lg">{exhibitor.contactInfo.city}, {exhibitor.contactInfo.country}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-white/60 font-bold">
                    <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-lg">{exhibitor.sector}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Deluxe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Essential Actions */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100 sticky top-24"
            >
              <div className="space-y-4">
                <button 
                  onClick={handleAppointmentClick}
                  className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                >
                  <Calendar className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  Planifier un RDV B2B
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleContact}
                    className="py-4 bg-slate-50 hover:bg-blue-50 text-slate-900 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all border border-slate-100 flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                    Contact
                  </button>
                  <button 
                    onClick={handleShare}
                    className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all border border-slate-100 flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </button>
                </div>
                
                <button 
                  onClick={handleDownloadBrochure}
                  className="w-full py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
                >
                  <Download className="h-4 w-4" />
                  Brochure PDF (Digital)
                </button>
              </div>

              {/* Quick Connect & Presence */}
              <div className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Emplacement Salon</h4>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase">Stand {exhibitor.boothNumber || 'Zone A-42'}</div>
                      <div className="text-[10px] font-bold text-slate-500">Pavillon Principal</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Direct</h4>
                  <div className="space-y-3">
                    {exhibitor.contactInfo?.email && (
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <Mail className="h-4 w-4 text-slate-300" />
                        {exhibitor.contactInfo.email}
                      </div>
                    )}
                    {exhibitor.contactInfo?.phone && (
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <Phone className="h-4 w-4 text-slate-300" />
                        {exhibitor.contactInfo.phone}
                      </div>
                    )}
                    {exhibitor.website && (
                      <a href={exhibitor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold text-blue-600 hover:underline">
                        <Globe className="h-4 w-4 text-blue-300" />
                        Visiter le site web
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Tabs & Details */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Mini-Site Deluxe Container */}
              <div className="bg-white rounded-[3rem] p-1 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="p-8 pb-0">
                   <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
                      {[
                        { id: 'overview', label: 'Vue d\'ensemble' },
                        { id: 'projects', label: 'Produits' },
                        { id: 'impact', label: 'À propos' },
                        { id: 'contact', label: 'Contact' },
                        { id: 'minisite', label: 'Mini-site' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-[80px] sm:min-w-[120px] ${
                            activeTab === tab.id 
                              ? 'bg-white text-slate-900 shadow-md' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="min-h-[600px] p-8">
                  <MiniSitePreview 
                    exhibitor={exhibitor} 
                    activeTab={activeTab as any}
                    embedded={true}
                  />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}


