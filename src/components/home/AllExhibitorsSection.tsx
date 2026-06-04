import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import ExhibitorCard from '../exhibitor/ExhibitorCard';

export function AllExhibitorsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { filteredExhibitors, fetchExhibitors, isLoading } = useExhibitorStore();
  const [displayCount, setDisplayCount] = useState(8);

  useEffect(() => {
    fetchExhibitors();
  }, [fetchExhibitors]);

  const displayedExhibitors = filteredExhibitors.slice(0, displayCount);

  const handleLoadMore = () => setDisplayCount(prev => prev + 8);

  const getCategoryLabel = useCallback((category: string) => {
    const labels = {
      'institutional': t('pages.exhibitors.category_institutional'),
      'bâtiment-industry': t('pages.exhibitors.category_port_industry'),
      'bâtiment-operations': t('pages.exhibitors.category_operations'),
      'academic': t('pages.exhibitors.category_academic'),
    };
    return labels[category as keyof typeof labels] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'bâtiment-industry': 'error',
      'bâtiment-operations': 'info',
      'academic': 'warning',
    };
    return colors[category] || 'default';
  }, []);

  const handleViewDetails = useCallback((exhibitorId: string) => {
    navigate(`${ROUTES.EXHIBITORS}/${exhibitorId}`);
  }, [navigate]);

  const handleScheduleAppointment = useCallback((exhibitorId: string) => {
    navigate(`${ROUTES.EXHIBITORS}/${exhibitorId}#schedule`);
  }, [navigate]);

  return (
    <section className="relative py-20 lg:py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">
            {t('nav.exhibitors')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {t('home.all_exhibitors_title', 'Tous nos exposants')}
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('home.discover_all_exhibitors_subtitle')}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-100 dark:bg-neutral-800 h-72 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : displayedExhibitors.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {displayedExhibitors.map((exhibitor, index) => (
                <motion.div
                  key={exhibitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ExhibitorCard
                    exhibitor={exhibitor}
                    index={index}
                    onViewDetails={handleViewDetails}
                    onScheduleAppointment={handleScheduleAppointment}
                    getCategoryLabel={getCategoryLabel}
                    getCategoryColor={getCategoryColor}
                    t={t}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              {displayCount < filteredExhibitors.length && (
                <Button onClick={handleLoadMore} variant="secondary" size="lg">
                  {t('common.load_more')}
                </Button>
              )}
              <Link to={ROUTES.EXHIBITORS}>
                <Button variant="primary" size="lg" className="group">
                  {t('common.view_all')}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-base">
              {t('home.no_partners_available')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
