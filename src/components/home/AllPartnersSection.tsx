import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Handshake, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import PartnerCard from '../partner/PartnerCard';
import { SupabaseService } from '../../services/supabaseService';
import type { PartnerTier } from '../../config/partnerTiers';

interface Partner {
  id: string;
  name: string;
  partner_tier: PartnerTier;
  category: string;
  description: string;
  logo: string;
  website?: string;
  country: string;
  sector: string;
  verified: boolean;
  featured: boolean;
  contributions?: string[];
  establishedYear?: number;
  employees?: string;
}

export function AllPartnersSection() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getPartners();
        const mappedPartners: Partner[] = data.map(p => ({
          id: p.id,
          name: p.name,
          partner_tier: p.partner_tier as PartnerTier,
          category: p.category,
          description: p.description,
          logo: p.logo || '',
          website: p.website,
          country: p.country,
          sector: p.sector || '',
          verified: p.verified,
          featured: p.featured,
          contributions: p.contributions,
          establishedYear: undefined,
          employees: undefined,
        }));
        setPartners(mappedPartners);
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error);
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPartners();
  }, []);

  const getCategoryLabel = (category: string): string => {
    return t(`partner_categories.${category}`) || category;
  };

  const getCategoryColor = (category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colorMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'official': 'info',
      'premium': 'warning',
      'media': 'success',
      'institutional': 'default',
      'technical': 'info',
    };
    return colorMap[category] || 'default';
  };

  const displayedPartners = partners.slice(0, displayCount);
  const handleLoadMore = () => setDisplayCount(prev => prev + 8);

  return (
    <section className="relative py-20 lg:py-24 bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">
            {t('nav.partners')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {t('home.all_partners_title', 'Tous nos partenaires')}
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('home.discover_all_partners_subtitle')}
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
        ) : displayedPartners.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {displayedPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <PartnerCard
                    partner={partner}
                    index={index}
                    onViewDetails={() => {}}
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
              {displayCount < partners.length && (
                <Button onClick={handleLoadMore} variant="secondary" size="lg">
                  {t('common.load_more')}
                </Button>
              )}
              <Link to={ROUTES.PARTNERS}>
                <Button variant="primary" size="lg" className="group">
                  {t('common.view_all')}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-white dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
              <Handshake className="h-8 w-8 text-neutral-400" />
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
