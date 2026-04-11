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

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  const getCategoryLabel = useCallback((category: string) => {
    const labels = {
      'institutional': t('pages.exhibitors.category_institutional'),
      'port-industry': t('pages.exhibitors.category_port_industry'),
      'port-operations': t('pages.exhibitors.category_operations'),
      'academic': t('pages.exhibitors.category_academic')
    };
    return labels[category as keyof typeof labels] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'port-industry': 'error',
      'port-operations': 'info',
      'academic': 'warning'
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
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('nav.exhibitors')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.discover_all_exhibitors_subtitle')}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
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

            {/* Boutons d'action */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {displayCount < filteredExhibitors.length && (
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  {t('common.load_more')}
                </Button>
              )}
              <Link to={ROUTES.EXHIBITORS}>
                <Button
                  variant="default"
                  size="lg"
                  className="min-w-[200px] group"
                >
                  {t('common.view_all')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t('home.no_partners_available')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
