import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { MapPin, Users, ArrowRight, Calendar, Eye, MessageCircle, Package } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useExhibitorStore } from '../../store/exhibitorStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { translateSector } from '../../utils/sectorTranslations';
import LogoWithFallback from '../ui/LogoWithFallback';
import { LogoShowcaseSection } from './LogoShowcaseSection';

export const FeaturedExhibitors: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { exhibitors, fetchExhibitors, isLoading } = useExhibitorStore();
  const { t } = useTranslation();

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

  useEffect(() => {
    if (featuredExhibitors.length === 0) return;
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

  const handleAppointmentClick = (exhibitorId: string) => {
    if (!isAuthenticated) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
      navigate(`${ROUTES.NETWORKING}?action=connect&exhibitor=${exhibitorId}&source=homepage`);
    }
  };

  const getCategoryLabel = (category: string) => {
    const key = `categories.${category}`;
    const value = t(key);
    return value !== key ? value : category;
  };

  const getCategoryColor = (category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors = {
      'institutional': 'success' as const,
      'port-industry': 'error' as const,
      'port-operations': 'info' as const,
      'academic': 'warning' as const,
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 h-96 border border-neutral-200 dark:border-neutral-800">
                  <div className="h-28 w-28 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-5" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-3" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded mb-6 w-2/3 mx-auto" />
                  <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 lg:py-24 bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">
            {t('home.featured_exhibitors_badge', 'Exposants Officiels')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {t('home.featured_exhibitors_title', 'Exposants à la Une')}
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('home.featured_exhibitors_desc', 'Les entreprises innovantes du BTP au Maroc et en Afrique')}
          </p>
        </motion.div>
      </div>

      {/* Bande défilante des logos exposants */}
      <div className="mb-12">
        <LogoShowcaseSection type="exhibitors" />
      </div>

      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        {featuredExhibitors.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <p className="text-base">{t('home.no_exhibitors_yet', 'Les exposants seront bientôt disponibles.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredExhibitors.map((exhibitor, index) => (
              <motion.div
                key={exhibitor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <Card hover className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-500/0 via-accent-500 to-accent-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col h-full p-7">
                    {exhibitor.verified && (
                      <Badge variant="success" size="sm" dot className="absolute top-4 right-4">
                        {t('home.verified')}
                      </Badge>
                    )}

                    {/* Logo */}
                    <div className="flex justify-center mb-5">
                      <div className="h-28 w-28 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center p-4 transition-transform duration-500 hover:scale-105">
                        <LogoWithFallback
                          src={exhibitor.logo}
                          alt={exhibitor.companyName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Nom et secteur */}
                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-neutral-900 dark:text-white text-lg mb-1.5 leading-tight">
                        {exhibitor.companyName}
                      </h3>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wider">
                        {translateSector(exhibitor.sector, t)}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="flex justify-center mb-4">
                      <Badge variant={getCategoryColor(exhibitor.category)} size="sm">
                        {getCategoryLabel(exhibitor.category)}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-5 flex-grow text-center leading-relaxed">
                      {exhibitor.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-5 mb-5 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{viewsMap[exhibitor.id] ?? exhibitor.miniSite?.views ?? 0} {t('home.views', 'vues')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        <span>{exhibitor.products.length || (exhibitor.miniSite?.sections?.filter(s => s.type === 'products').length ?? 0)} {t('home.products', 'produits')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link to={`/minisite/${exhibitor.id}`} className="block">
                        <Button variant="secondary" size="sm" className="w-full">
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          {t('home.see_profile', 'Profil')}
                        </Button>
                      </Link>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAppointmentClick(exhibitor.id)}
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
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
                          aria-label={t('ui.contact_directly')}
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

        <div className="text-center">
          <Link to={ROUTES.EXHIBITORS}>
            <Button variant="secondary" size="lg" className="group">
              {t('home.discover_all_exhibitors', 'Découvrez tous les exposants')}
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
