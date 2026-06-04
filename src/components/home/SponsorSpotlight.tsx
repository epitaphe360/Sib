import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import LogoWithFallback from '../ui/LogoWithFallback';

/**
 * Mise en avant du sponsor officiel unique (LAP).
 */
export const SponsorSpotlight: React.FC = () => {
  const { t } = useTranslation();
  const [sponsor, setSponsor] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getPartners();
        const lap = data.find(
          (p) =>
            (p.company_name || p.name || '').toLowerCase().includes('lap') ||
            p.partner_tier === 'official_sponsor' ||
            p.partner_type === 'official_sponsor'
        );
        const fallback = data.find((p) => p.partner_tier === 'official_sponsor') || data[0];
        setSponsor(lap || fallback || null);
      } catch (error) {
        console.error('Erreur chargement sponsor:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-neutral-950">
        <div className="max-w-container mx-auto px-6 animate-pulse h-40 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
      </section>
    );
  }

  if (!sponsor) return null;

  const sponsorName =
    sponsor.organization_name || sponsor.organizationName || sponsor.company_name || sponsor.name || 'LAP';
  const sponsorId = sponsor.id;

  return (
    <section className="relative py-16 lg:py-20 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="sib-kicker mb-3 justify-center">Sponsor Officiel</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('home.sponsor_title', 'Notre partenaire officiel')}
          </h2>
        </motion.div>

        <Link
          to={`${ROUTES.PARTNERS}/${sponsorId}`}
          className="block max-w-xl mx-auto group"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center p-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:shadow-lg hover:border-primary-300 transition-all duration-300"
          >
            <div className="h-32 w-48 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <LogoWithFallback
                src={sponsor.logo}
                alt={sponsorName}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sponsorName}</p>
            {sponsor.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 text-center line-clamp-2 max-w-md">
                {sponsor.description}
              </p>
            )}
          </motion.div>
        </Link>
      </div>
    </section>
  );
};

export default SponsorSpotlight;
