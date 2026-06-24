import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import LogoWithFallback from '../ui/LogoWithFallback';

/** Mise en avant du sponsor officiel (exposant) — LAP. */
export const SponsorSpotlight: React.FC = () => {
  const { t } = useTranslation();
  const [sponsor, setSponsor] = useState<{ id: string; companyName: string; logo?: string; description?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getExhibitors();
        const lap = data.find((e) =>
          (e.companyName || '').toLowerCase().includes('lap') ||
          (e.companyName || '').toLowerCase().includes('appareillage')
        );
        const featured = data.find((e) => e.featured);
        const pick = lap || featured || data[0];
        if (pick) {
          setSponsor({
            id: pick.id,
            companyName: pick.companyName,
            logo: pick.logo,
            description: pick.description,
          });
        }
      } catch (error) {
        console.error('Erreur chargement sponsor exposant:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-neutral-950">
        <div className="max-w-container mx-auto px-6 animate-pulse h-40 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
      </section>
    );
  }

  if (!sponsor) return null;

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
          <div className="sib-kicker mb-3 justify-center">{t('home.sponsor_kicker')}</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('home.sponsor_title')}
          </h2>
          <p className="text-sm text-neutral-500 mt-2">Sponsor officiel — fiche exposant</p>
        </motion.div>

        <Link
          to={`${ROUTES.EXHIBITORS}/${sponsor.id}`}
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
                alt={sponsor.companyName}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sponsor.companyName}</p>
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
