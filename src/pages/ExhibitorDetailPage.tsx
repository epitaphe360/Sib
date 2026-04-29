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
  AlertCircle,
  X,
  Clock
} from 'lucide-react';
import { useAppointmentStore } from '../store/appointmentStore';
import { isDateInSalonRange } from '../config/salonInfo';
import { Card } from '../components/ui/Card';
import ProductDetailModal from '../components/products/ProductDetailModal';
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
  const { isAuthenticated, user } = useAuthStore();
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof typeof CONFIG.tabIds>(CONFIG.tabIds.overview);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showRdvModal, setShowRdvModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const { timeSlots, fetchTimeSlots, appointments, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    const loadExhibitor = async () => {
      if (!id) {return;}

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

  // Fonction pour gérer le clic sur le bouton RDV — modal inline comme le Réseautage
  const handleAppointmentClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/exhibitors/${exhibitor?.id}`);
      return;
    }
    setSelectedTimeSlot('');
    setAppointmentMessage('');
    setShowRdvModal(true);
    if (exhibitor?.id) {
      fetchTimeSlots(exhibitor.id);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedTimeSlot) return;
    setIsBookingInProgress(true);
    try {
      const appointmentStore = useAppointmentStore.getState();
      await appointmentStore.bookAppointment(selectedTimeSlot, appointmentMessage);
      setShowRdvModal(false);
      setSelectedTimeSlot('');
      setAppointmentMessage('');
      toast.success('Demande de RDV envoyée avec succès !');
      await fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la réservation');
    } finally {
      setIsBookingInProgress(false);
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
      case 'bâtiment-industry':
      case 'port-industry': return Building2;
      case 'bâtiment-operations':
      case 'port-operations': return Target;
      case 'academic': return Award;
      default: return Building2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'institutional': return 'bg-purple-100 text-purple-600';
      case 'bâtiment-industry':
      case 'port-industry': return 'bg-blue-100 text-blue-600';
      case 'bâtiment-operations':
      case 'port-operations': return 'bg-green-100 text-green-600';
      case 'academic': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'institutional': return 'Institutionnel';
      case 'bâtiment-industry':
      case 'port-industry': return 'Industrie du Bâtiment';
      case 'bâtiment-operations':
      case 'port-operations': return 'Exploitation & Gestion';
      case 'academic': return 'Académique & Formation';
      default: return 'Industrie du Bâtiment';
    }
  };

  const CategoryIcon = getCategoryIcon(exhibitor.category);

  return (
    <>
    <div className="min-h-screen bg-gray-50">

      {/* Banner validation profil non publié — visible UNIQUEMENT par le propriétaire */}
      {exhibitor.isPublished === false && user && (user.id === exhibitor.userId || user.type === 'admin') && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-amber-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">Fiche en cours de validation — ce profil n'est pas encore visible publiquement.</p>
          </div>
        </div>
      )}

      {/* Hero Banner — design blanc & bleu SIB */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e4976] to-[#1a6496] relative overflow-hidden">
        {/* Motif subtil */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-0">
          {/* Breadcrumb */}
          <Link
            to={ROUTES.EXHIBITORS}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour au catalogue exposants
          </Link>

          {/* Contenu hero */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 pb-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative shrink-0"
            >
              <div className="h-36 w-36 lg:h-44 lg:w-44 rounded-2xl bg-white shadow-xl overflow-hidden flex items-center justify-center p-3 border-4 border-white/20">
                <img
                  src={exhibitor.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(exhibitor.companyName)}&background=1e3a5f&color=ffffff&size=200`}
                  alt={exhibitor.companyName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              {exhibitor.featured && (
                <div className="absolute -top-2 -right-2 h-9 w-9 bg-amber-400 rounded-xl shadow-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              )}
            </motion.div>

            {/* Infos */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 space-y-4"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                  SIB 2026 — Officiel
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(exhibitor.category)} bg-white/10 border border-white/20 text-white`}>
                  <CategoryIcon className="h-3 w-3" />
                  {getCategoryLabel(exhibitor.category)}
                </span>
                {exhibitor.verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                    <CheckCircle className="h-3 w-3" />
                    Vérifié
                  </span>
                )}
              </div>

              {/* Nom */}
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                {exhibitor.companyName}
              </h1>

              {/* Localisation & secteur */}
              <div className="flex flex-wrap items-center gap-5 text-blue-200 text-sm font-medium">
                {exhibitor.contactInfo?.city && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-300" />
                    {exhibitor.contactInfo.city}{exhibitor.contactInfo.country ? `, ${exhibitor.contactInfo.country}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-300" />
                  {exhibitor.sector}
                </span>
                {exhibitor.boothNumber && (
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-300" />
                    Stand {exhibitor.boothNumber}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Vague de transition vers le gris clair */}
        <div className="h-8 bg-gradient-to-b from-transparent to-gray-50" />
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Colonne gauche — actions & contact */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6"
            >
              {/* En-tête carte */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Actions rapides</h3>
                <p className="text-sm text-gray-500 mt-0.5">Prenez contact ou planifiez un rendez-vous</p>
              </div>

              {/* Boutons */}
              <div className="p-6 space-y-3">
                <button
                  onClick={handleAppointmentClick}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-[#1e3a5f] hover:bg-[#163055] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  Planifier un RDV B2B
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleContact}
                    className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium text-sm transition-colors border border-blue-200"
                  >
                    <Mail className="h-4 w-4" />
                    Contact
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-3 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-sm transition-colors border border-gray-200"
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </button>
                </div>

                <button
                  onClick={handleDownloadBrochure}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-sm transition-colors border border-gray-200"
                >
                  <Download className="h-4 w-4" />
                  Télécharger la brochure
                </button>
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-100" />

              {/* Informations stand */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Salon SIB 2026</h4>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="h-10 w-10 rounded-lg bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Stand {exhibitor.boothNumber || 'À confirmer'}</p>
                    <p className="text-xs text-gray-500">Pavillon principal — El Jadida</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>25 – 29 novembre 2026</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Complexe Mohammed VI — El Jadida, Maroc</span>
                </div>
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-100" />

              {/* Coordonnées */}
              <div className="p-6 space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coordonnées</h4>
                {exhibitor.contactInfo?.email && (
                  <a href={`mailto:${exhibitor.contactInfo.email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors group">
                    <Mail className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                    <span className="truncate">{exhibitor.contactInfo.email}</span>
                  </a>
                )}
                {exhibitor.contactInfo?.phone && (
                  <a href={`tel:${exhibitor.contactInfo.phone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors group">
                    <Phone className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                    <span>{exhibitor.contactInfo.phone}</span>
                  </a>
                )}
                {exhibitor.website && (
                  <a href={exhibitor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 transition-colors group">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Visiter le site web</span>
                    <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Colonne droite — onglets avec données réelles */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Barre d'onglets pill animée */}
              <div className="px-4 pt-4 pb-0 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'overview', label: "Vue d'ensemble", icon: Eye },
                    { id: 'projects', label: 'Produits', icon: Package },
                    { id: 'impact', label: 'À propos', icon: Users },
                    { id: 'contact', label: 'Contact', icon: Mail },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className="relative px-4 py-2.5 flex items-center gap-2 text-sm font-medium whitespace-nowrap rounded-t-xl transition-colors group focus:outline-none"
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-[#1e3a5f] rounded-t-xl shadow-md"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <tab.icon className={`relative z-10 h-4 w-4 transition-colors duration-200 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-[#1e3a5f]'}`} />
                      <span className={`relative z-10 transition-colors duration-200 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-[#1e3a5f]'}`}>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenu des onglets — données réelles */}
              <div className="min-h-[600px] p-6">

                {/* ─── VUE D'ENSEMBLE ─── */}
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Description */}
                    {exhibitor.description && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">À propos</h3>
                        <p className="text-gray-700 leading-relaxed">{exhibitor.description}</p>
                      </div>
                    )}

                    {/* Stats rapides — champs toujours disponibles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-4 text-center border border-[#1e3a5f]/10">
                        <p className="text-2xl font-bold text-[#1e3a5f]">{exhibitor.products?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Produits</p>
                      </div>
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-4 text-center border border-[#1e3a5f]/10">
                        <p className="text-2xl font-bold text-[#1e3a5f]">{exhibitor.verified ? '✓' : '—'}</p>
                        <p className="text-xs text-gray-500 mt-1">Vérifié</p>
                      </div>
                      <div className="bg-[#1e3a5f]/5 rounded-xl p-4 text-center border border-[#1e3a5f]/10">
                        <p className="text-2xl font-bold text-[#1e3a5f]">SIB</p>
                        <p className="text-xs text-gray-500 mt-1">2026</p>
                      </div>
                      {exhibitor.establishedYear && (
                        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                          <p className="text-2xl font-bold text-[#1e3a5f]">{exhibitor.establishedYear}</p>
                          <p className="text-xs text-gray-500 mt-1">Fondée</p>
                        </div>
                      )}
                      {exhibitor.employeeCount && (
                        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                          <p className="text-2xl font-bold text-[#1e3a5f]">{exhibitor.employeeCount}</p>
                          <p className="text-xs text-gray-500 mt-1">Employés</p>
                        </div>
                      )}
                      {exhibitor.markets?.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                          <p className="text-2xl font-bold text-[#1e3a5f]">{exhibitor.markets.length}</p>
                          <p className="text-xs text-gray-500 mt-1">Marchés</p>
                        </div>
                      )}
                    </div>

                    {/* Marchés ciblés */}
                    {exhibitor.markets?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Marchés ciblés</h3>
                        <div className="flex flex-wrap gap-2">
                          {exhibitor.markets.map((m: string) => (
                            <span key={m} className="px-3 py-1.5 bg-[#1e3a5f]/5 text-[#1e3a5f] text-sm rounded-lg border border-[#1e3a5f]/10 font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {exhibitor.certifications?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                          {exhibitor.certifications.map((c: string) => (
                            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" />{c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secteur */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Secteur d'activité</h3>
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 font-medium">
                        <TrendingUp className="h-4 w-4 text-blue-500" />{exhibitor.sector}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ─── PRODUITS ─── */}
                {activeTab === 'projects' && (
                  <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {exhibitor.products?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {exhibitor.products.map((product: any) => (
                          <div key={product.id} onClick={() => setSelectedProduct(product)} className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer">
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-gray-50">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f]/5 to-blue-50 flex items-center justify-center">
                                  <Package className="h-10 w-10 text-[#1e3a5f]/20" />
                                </div>
                              )}
                              {/* Badges superposés */}
                              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                                {product.featured && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">⭐ Vedette</span>}
                                {product.isNew && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">Nouveau</span>}
                              </div>
                              {product.inStock === false && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <span className="text-xs bg-white/90 text-gray-700 px-3 py-1 rounded-full font-semibold">Rupture de stock</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 space-y-2.5">
                              <div>
                                {product.category && <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">{product.category}</p>}
                                <h4 className="font-bold text-gray-900">{product.name}</h4>
                              </div>
                              {product.description && <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>}
                              <div className="flex items-center justify-between pt-1">
                                <div>
                                  {product.price && <p className="text-lg font-bold text-[#1e3a5f]">{product.price.toLocaleString('fr-MA')} <span className="text-sm font-medium">MAD</span></p>}
                                  {product.deliveryTime && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Livraison {product.deliveryTime}</p>}
                                </div>
                                {product.certified && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-medium">
                                    <CheckCircle className="h-3 w-3" /> Certifié
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="h-14 w-14 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">Aucun produit disponible</p>
                        <p className="text-sm text-gray-400 mt-1">Cet exposant n'a pas encore publié de produits</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ─── À PROPOS ─── */}
                {activeTab === 'impact' && (
                  <motion.div key="impact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-[#1e3a5f] flex items-center justify-center shrink-0 overflow-hidden">
                        {exhibitor.logo
                          ? <img src={exhibitor.logo} alt={exhibitor.companyName} className="h-full w-full object-contain p-2" />
                          : <Building2 className="h-8 w-8 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{exhibitor.companyName}</h2>
                        <p className="text-sm text-gray-500">{exhibitor.sector}</p>
                      </div>
                    </div>

                    {exhibitor.description && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed">{exhibitor.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {exhibitor.establishedYear && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                          <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Fondée en</p>
                            <p className="font-semibold text-gray-900">{exhibitor.establishedYear}</p>
                          </div>
                        </div>
                      )}
                      {exhibitor.employeeCount && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                          <Users className="h-5 w-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Effectif</p>
                            <p className="font-semibold text-gray-900">{exhibitor.employeeCount} employés</p>
                          </div>
                        </div>
                      )}
                      {exhibitor.contactInfo?.city && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                          <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Siège social</p>
                            <p className="font-semibold text-gray-900">{exhibitor.contactInfo.city}, {exhibitor.contactInfo.country}</p>
                          </div>
                        </div>
                      )}
                      {exhibitor.revenue && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                          <TrendingUp className="h-5 w-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Chiffre d'affaires</p>
                            <p className="font-semibold text-gray-900">{exhibitor.revenue}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {exhibitor.certifications?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Certifications & Normes</h3>
                        <div className="flex flex-wrap gap-2">
                          {exhibitor.certifications.map((c: string) => (
                            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" />{c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ─── CONTACT ─── */}
                {activeTab === 'contact' && (
                  <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Contactez {exhibitor.companyName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {exhibitor.contactInfo?.email && (
                        <a href={`mailto:${exhibitor.contactInfo.email}`}
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                            <Mail className="h-5 w-5 text-blue-600 group-hover:text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5">Email</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{exhibitor.contactInfo.email}</p>
                          </div>
                        </a>
                      )}
                      {exhibitor.contactInfo?.phone && (
                        <a href={`tel:${exhibitor.contactInfo.phone}`}
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                            <Phone className="h-5 w-5 text-blue-600 group-hover:text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Téléphone</p>
                            <p className="text-sm font-medium text-gray-900">{exhibitor.contactInfo.phone}</p>
                          </div>
                        </a>
                      )}
                      {exhibitor.website && (
                        <a href={exhibitor.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                            <Globe className="h-5 w-5 text-blue-600 group-hover:text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5">Site web</p>
                            <p className="text-sm font-medium text-blue-600 truncate">{exhibitor.website}</p>
                          </div>
                        </a>
                      )}
                      {exhibitor.contactInfo?.address && (
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                            <p className="text-sm font-medium text-gray-900">{exhibitor.contactInfo.address}</p>
                            {exhibitor.contactInfo.city && <p className="text-xs text-gray-500">{exhibitor.contactInfo.city}, {exhibitor.contactInfo.country}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA planifier RDV */}
                    <div className="mt-6 p-5 bg-[#1e3a5f] rounded-xl text-white">
                      <h4 className="font-semibold mb-1">Planifier une rencontre B2B</h4>
                      <p className="text-blue-200 text-sm mb-4">Réservez un créneau directement avec {exhibitor.companyName} lors du salon SIB 2026.</p>
                      <button onClick={handleAppointmentClick}
                        className="w-full bg-white text-[#1e3a5f] rounded-lg py-2.5 font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Planifier un RDV B2B
                      </button>
                    </div>
                  </motion.div>
                )}



              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal fiche produit */}
    {selectedProduct && (
      <ProductDetailModal
        product={selectedProduct}
        exhibitorName={exhibitor?.companyName}
        onClose={() => setSelectedProduct(null)}
      />
    )}

    {/* Modal RDV — même comportement que la page Réseautage */}
    {showRdvModal && exhibitor && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1e3a5f] to-blue-700 text-white p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Prendre RDV avec {exhibitor.companyName}</h3>
                <p className="text-blue-200 text-sm mt-0.5">Sélectionnez un créneau disponible</p>
              </div>
              <button
                onClick={() => setShowRdvModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Créneaux horaires */}
            {(() => {
              const filteredSlots = timeSlots.filter(slot => {
                if (slot.available === false) return false;
                if (!slot.date) return false;
                return isDateInSalonRange(new Date(slot.date as any));
              });

              if (filteredSlots.length === 0) return (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Aucun créneau disponible</p>
                  <p className="text-sm text-gray-400 mt-1">Veuillez réessayer plus tard ou contacter l'exposant</p>
                </div>
              );

              return (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Choisir un créneau horaire
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                    {filteredSlots.map(slot => {
                      const isSelected = selectedTimeSlot === slot.id;
                      const booked = appointments.find(a => a.timeSlotId === slot.id && a.visitorId === user?.id);
                      const dateLabel = new Date(slot.date as any).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: '2-digit', month: 'long'
                      });
                      return (
                        <button
                          key={slot.id}
                          disabled={!!booked}
                          onClick={() => !booked && setSelectedTimeSlot(slot.id)}
                          className={`p-3 border-2 rounded-xl text-left transition-all relative ${
                            booked
                              ? 'border-green-200 bg-green-50 opacity-70 cursor-not-allowed'
                              : isSelected
                              ? 'border-[#1e3a5f] bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow'
                          }`}
                        >
                          <div className="font-semibold text-gray-800 capitalize text-xs mb-1">{dateLabel}</div>
                          <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            {slot.startTime} – {slot.endTime}
                          </div>
                          {slot.location && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{slot.location}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {slot.currentBookings || 0}/{slot.maxBookings} réservé(s)
                          </div>
                          {booked && (
                            <span className={`absolute top-2 right-2 text-xs text-white px-2 py-0.5 rounded-full font-bold ${
                              booked.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {booked.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                            </span>
                          )}
                          {isSelected && !booked && (
                            <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-[#1e3a5f]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Message optionnel */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                Message (optionnel)
              </label>
              <textarea
                value={appointmentMessage}
                onChange={e => setAppointmentMessage(e.target.value)}
                placeholder="Décrivez brièvement l'objet de votre rendez-vous..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] resize-none text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleConfirmAppointment}
                disabled={!selectedTimeSlot || isBookingInProgress}
                className={`flex-1 h-12 rounded-xl font-bold text-sm transition-colors ${
                  selectedTimeSlot && !isBookingInProgress
                    ? 'bg-[#1e3a5f] text-white hover:bg-[#163055]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isBookingInProgress ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Envoi en cours...
                  </span>
                ) : selectedTimeSlot ? 'Envoyer la demande' : 'Sélectionnez un créneau'}
              </button>
              <button
                onClick={() => setShowRdvModal(false)}
                className="px-6 h-12 border-2 border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
