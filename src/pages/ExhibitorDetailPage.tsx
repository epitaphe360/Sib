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

  if (isLoading || !exhibitor) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 dark:border-neutral-800 border-t-primary-600 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 tracking-tight">
            Chargement de l'exposant...
          </h3>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'institutional': return Crown;
      case 'bâtiment-industry': return Building2;
      case 'bâtiment-operations': return Target;
      case 'academic': return Award;
      default: return Building2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'institutional': return 'bg-accent-500/15 text-accent-500';
      case 'bâtiment-industry': return 'bg-primary-500/20 text-primary-300';
      case 'bâtiment-operations': return 'bg-success-500/20 text-success-300';
      case 'academic': return 'bg-warning-500/20 text-warning-300';
      default: return 'bg-white/10 text-white/80';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'institutional': return 'Institutionnel';
      case 'bâtiment-industry': return 'Industrie du Bâtiment';
      case 'bâtiment-operations': return 'Exploitation & Gestion';
      case 'academic': return 'Académique & Formation';
      default: return category;
    }
  };

  const CategoryIcon = getCategoryIcon(exhibitor.category);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Banner pour profils non publiés */}
      {exhibitor.isPublished === false && (
        <div className="bg-warning-500 text-white py-3 px-4 shadow-sm">
          <div className="max-w-container mx-auto flex items-center justify-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold text-center">
              Fiche en cours de validation — ce profil n'est pas encore visible publiquement
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative min-h-[520px] flex items-end pt-24 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-primary-900">
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/60 via-primary-900/85 to-white dark:to-neutral-950" />
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        </div>

        <div className="relative max-w-container mx-auto px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10"
          >
            <Link
              to={ROUTES.EXHIBITORS}
              className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Retour au catalogue</span>
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-end gap-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative shrink-0"
            >
              <div className="absolute -inset-4 bg-accent-500/20 rounded-3xl blur-2xl" />
              <div className="relative h-44 w-44 rounded-2xl bg-white p-5 shadow-xl border border-white/20 overflow-hidden flex items-center justify-center">
                <img
                  src={exhibitor.logo || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={exhibitor.companyName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {exhibitor.featured && (
                <div className="absolute -top-3 -right-3 h-11 w-11 bg-accent-500 rounded-xl shadow-lg flex items-center justify-center border-2 border-primary-900">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-accent-500 text-[11px] font-semibold uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                    SIB 2026 Official
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] border border-white/15 ${getCategoryColor(exhibitor.category)}`}>
                    <CategoryIcon className="h-3 w-3" />
                    {getCategoryLabel(exhibitor.category)}
                  </div>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] flex flex-wrap items-center gap-3">
                  {exhibitor.companyName}
                  {exhibitor.verified && (
                    <CheckCircle className="h-8 w-8 text-accent-500" />
                  )}
                </h1>

                <div className="flex flex-wrap items-center gap-5 text-white/70">
                  {exhibitor.contactInfo?.city && (
                    <div className="inline-flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-accent-500" />
                      <span>
                        {exhibitor.contactInfo.city}, {exhibitor.contactInfo.country}
                      </span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-accent-500" />
                    <span>{exhibitor.sector}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-container mx-auto px-6 lg:px-8 -mt-16 relative z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Actions */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 sticky top-24"
            >
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAppointmentClick}
                  className="w-full group"
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  Planifier un RDV B2B
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="md" onClick={handleContact}>
                    <Mail className="mr-1 h-3.5 w-3.5" />
                    Contact
                  </Button>
                  <Button variant="secondary" size="md" onClick={handleShare}>
                    <Share2 className="mr-1 h-3.5 w-3.5" />
                    Partager
                  </Button>
                </div>

                <Button variant="outline" size="md" onClick={handleDownloadBrochure} className="w-full">
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Brochure PDF
                </Button>

                <Button variant="ghost" size="md" onClick={handleMessageClick} className="w-full">
                  <MessageCircle className="mr-1 h-3.5 w-3.5" />
                  Envoyer un message
                </Button>
              </div>

              {/* Localisation & contact */}
              <div className="mt-7 pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-5">
                <div>
                  <div className="sib-kicker mb-3">Emplacement salon</div>
                  <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
                        Stand {exhibitor.boothNumber || 'Zone A-42'}
                      </div>
                      <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Pavillon principal
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="sib-kicker mb-3">Contact direct</div>
                  <div className="space-y-2.5">
                    {exhibitor.contactInfo?.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span className="truncate">{exhibitor.contactInfo.email}</span>
                      </div>
                    )}
                    {exhibitor.contactInfo?.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <span>{exhibitor.contactInfo.phone}</span>
                      </div>
                    )}
                    {exhibitor.website && (
                      <a
                        href={exhibitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Visiter le site web
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Tabs */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 pb-0">
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-1 rounded-xl flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide">
                    {[
                      { id: 'overview', label: "Vue d'ensemble" },
                      { id: 'projects', label: 'Produits' },
                      { id: 'impact', label: 'À propos' },
                      { id: 'contact', label: 'Contact' },
                      { id: 'minisite', label: 'Mini-site' },
                    ].map((tab) => (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 h-10 px-4 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all min-w-[100px] ${
                          activeTab === tab.id
                            ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[520px] p-6 pt-2">
                  <MiniSitePreview exhibitor={exhibitor} activeTab={activeTab as any} embedded={true} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


