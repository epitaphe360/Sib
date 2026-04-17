import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { MapPin, Users, ArrowRight, Calendar, CheckCircle, Eye, MessageCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useExhibitorStore } from '../../store/exhibitorStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { translateSector } from '../../utils/sectorTranslations';
import { MoroccanPattern } from '../ui/MoroccanDecor';
import LogoWithFallback from '../ui/LogoWithFallback';

export const FeaturedExhibitors: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { exhibitors, fetchExhibitors, isLoading } = useExhibitorStore();
  const { t } = useTranslation();

  // Afficher uniquement les exposants vérifiés et avec mini-site publié
  const verifiedPublished = exhibitors.filter(e => e.verified && e.miniSite?.published === true);
  const featuredExhibitors = verifiedPublished.filter(e => e.featured).slice(0, 3).length > 0
    ? verifiedPublished.filter(e => e.featured).slice(0, 3)
    : verifiedPublished.slice(0, 3);

  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (exhibitors.length === 0) {
      fetchExhibitors();
    }
  }, [exhibitors.length, fetchExhibitors]);

  // Charger les vraies vues depuis minisite_views pour les exposants vedettes
  useEffect(() => {
    if (featuredExhibitors.length === 0) {return;}
    import('../../services/supabaseService').then(({ SupabaseService }) => {
      Promise.all(
        featuredExhibitors.map(e =>
          SupabaseService.getMiniSiteViewCount(e.id).then(count => ({ id: e.id, count }))
        )
      ).then(results => {
        const map: Record<string, number> = {};
        results.forEach(({ id, count }) => { map[id] = count; });
        setViewsMap(map);
      });
    });
  }, [featuredExhibitors.length]);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = (exhibitorId: string) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec redirection vers les RDV
  navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
      // Rediriger vers la page de networking avec l'action de connexion
  navigate(`${ROUTES.NETWORKING}?action=connect&exhibitor=${exhibitorId}&source=homepage`);
    }
  };

  const getCategoryLabel = (category: string) => {
    // Map backend values to translation keys
    // institutional -> categories.institutional
    // construction-industry -> categories.construction-industry
    // building-operations -> categories.building-operations
    // academic -> categories.academic

    // Check if category matches one of our keys, otherwise return as is or fallback
    // Note: The keys in translations.ts are 'categories.institutional' etc.
    const key = `categories.${category}`;
    const value = t(key);

    // If translation returns the key itself, it means translation is missing
    return value !== key ? value : category;
  };

  const getCategoryColor = (category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors = {
      'institutional': 'success' as const,
      'construction-industry': 'error' as const,
      'building-operations': 'info' as const,
      'academic': 'warning' as const
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 h-80">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-28 bg-[#F8F9FA] relative overflow-hidden">
      {/* Grain doré ultra-subtil */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(231,209,146,1) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      {/* Fine ligne dorée en haut */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px]" style={{ background: 'rgba(231,209,146,0.4)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header section luxe */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="luxury-badge mb-5 inline-flex items-center gap-2">
            <Users className="h-3 w-3" />
            {t('home.featured_exhibitors_badge', 'Exposants Officiels')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-light text-[#1A1A1A] mb-4 mt-3"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {t('home.featured_exhibitors_title', 'Exposants à la Une')}
          </h2>
          <p className="text-base text-[#666] max-w-2xl mx-auto leading-relaxed font-light">
            {t('home.featured_exhibitors_desc', 'Les organisations leaders qui soutiennent SIB 2026')}
          </p>
          <div className="luxury-divider mt-6">
            <span />
          </div>
        </motion.div>

        {featuredExhibitors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t('home.no_exhibitors_yet', 'Les exposants seront bientôt disponibles.')}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredExhibitors.map((exhibitor, index) => (
            <motion.div
              key={exhibitor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full relative">
                <div className="flex flex-col h-full p-5">
                  {/* Badge vérifié en haut à droite */}
                  {exhibitor.verified && (
                    <Badge variant="success" size="sm" className="absolute top-3 right-3 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('home.verified')}
                    </Badge>
                  )}

                  {/* Logo centré */}
                  <div className="flex justify-center mb-4">
                    <LogoWithFallback
                      src={exhibitor.logo}
                      alt={exhibitor.companyName}
                      className="h-24 w-24 rounded-xl object-contain border border-gray-100 bg-white p-2 shadow-sm"
                    />
                  </div>

                  {/* Nom et secteur centrés */}
                  <div className="text-center mb-3">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight px-2">
                      {exhibitor.companyName}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">{translateSector(exhibitor.sector, t)}</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed text-center">
                    {exhibitor.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      <span>{viewsMap[exhibitor.id] ?? exhibitor.miniSite?.views ?? 0} {t('home.views', 'vues')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-yellow-500" />
                      <span>{exhibitor.products.length || (exhibitor.miniSite?.sections?.filter(s => s.type === 'products').length ?? 0)} {t('home.products', 'produits')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Link to={`/minisite/${exhibitor.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        <Eye className="h-4 w-4 mr-2" />
                        {t('home.see_profile', 'Voir le Profil')}
                      </Button>
                    </Link>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 justify-center"
                        onClick={() => handleAppointmentClick(exhibitor.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('home.make_appointment', 'Prendre RDV')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Veuillez vous connecter pour envoyer un message');
                            navigate('/login');
                            return;
                          }
                          navigate(`/messages?userId=${exhibitor.id}`);
                        }}
                        title={t('ui.contact_directly')}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to={ROUTES.EXHIBITORS}>
            <button className="luxury-btn group flex items-center gap-2">
              {t('home.discover_all_exhibitors', 'Découvrez tous les exposants')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};