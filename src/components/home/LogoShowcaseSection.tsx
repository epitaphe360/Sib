import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ArrowRight } from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';

const scrollCSS = `
@keyframes scroll-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes scroll-right {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
.logo-rail       { display: flex; width: max-content; align-items: center; }
.logo-rail--left { animation: scroll-left var(--speed,40s) linear infinite; }
.logo-rail--right{ animation: scroll-right var(--speed,40s) linear infinite; }
.logo-band:hover .logo-rail { animation-play-state: paused; }

.logo-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.4s ease, box-shadow 0.4s ease;
  filter: grayscale(100%) opacity(0.55);
  cursor: pointer;
  border-radius: 12px;
  margin: 4px 6px;
}
.logo-item:hover {
  transform: scale(1.08);
  filter: grayscale(0%) opacity(1);
  z-index: 10;
  position: relative;
}
.logo-item img {
  height: 44px;
  max-width: 150px;
  width: auto;
  object-fit: contain;
  pointer-events: none;
}
@media (min-width:640px) {
  .logo-item     { padding: 12px 32px; margin: 6px 8px; }
  .logo-item img { height: 52px; max-width: 180px; }
}
@media (min-width:1024px) {
  .logo-item     { padding: 14px 40px; margin: 8px 10px; }
  .logo-item img { height: 60px; max-width: 220px; }
}
`;

interface LogoShowcaseSectionProps {
  type?: 'partners' | 'exhibitors' | 'both';
}

const LogoBand: React.FC<{
  logos: { to: string; src: string; alt: string }[];
  reverse?: boolean;
  speed?: number;
}> = ({ logos, reverse = false, speed = 40 }) => {
  if (logos.length === 0) return null;
  const items = [...logos, ...logos, ...logos];

  return (
    <div className="logo-band relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 z-20 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 z-20 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent" />

      <div
        className={`logo-rail ${reverse ? 'logo-rail--right' : 'logo-rail--left'}`}
        style={{ '--speed': `${speed}s` } as React.CSSProperties}
      >
        {items.map((logo, i) => (
          <Link key={i} to={logo.to} className="logo-item" title={logo.alt}>
            <img
              src={logo.src}
              alt={logo.alt}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export const LogoShowcaseSection: React.FC<LogoShowcaseSectionProps> = ({ type = 'both' }) => {
  const { t } = useTranslation();
  const { exhibitors, fetchExhibitors } = useExhibitorStore();
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (type === 'partners' || type === 'both') {
          const partnersData = await SupabaseService.getPartners();
          setPartners(partnersData.filter(p => p.logo && p.logo.trim() !== ''));
        }
        if (type === 'exhibitors' || type === 'both') {
          if (exhibitors.length === 0) fetchExhibitors();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [exhibitors.length, fetchExhibitors, type]);

  const exhibitorsWithLogos = exhibitors.filter(e => e.logo && e.logo.trim() !== '');

  if (isLoading) {
    return (
      <section className="py-10 bg-white dark:bg-neutral-950">
        <div className="flex justify-center gap-12 opacity-20 animate-pulse py-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-28 h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
          ))}
        </div>
      </section>
    );
  }

  const showPartners   = (type === 'partners'  || type === 'both') && partners.length > 0;
  const showExhibitors = (type === 'exhibitors' || type === 'both') && exhibitorsWithLogos.length > 0;

  const partnerLogos = partners.map(p => ({
    to: `${ROUTES.PARTNERS}/${p.id}`,
    src: p.logo,
    alt: p.name || 'Partner',
  }));

  const exhibitorLogos = exhibitorsWithLogos.map(e => ({
    to: `${ROUTES.EXHIBITORS}/${e.id}`,
    src: e.logo || '',
    alt: e.companyName || 'Exhibitor',
  }));

  const partnerSpeed   = Math.max(30, partners.length * 4);
  const exhibitorSpeed = Math.max(32, exhibitorsWithLogos.length * 4);

  return (
    <>
      <style>{scrollCSS}</style>

      <section className="relative bg-white dark:bg-neutral-950 overflow-hidden">
        {type === 'both' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center pt-16 pb-6 px-4 max-w-2xl mx-auto"
          >
            <div className="sib-kicker mb-4 justify-center">
              {t('home.trusted_by')}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('home.logo_showcase_title')}
            </h2>
          </motion.div>
        )}

        {showPartners && (
          <div className={`${type !== 'both' ? 'py-6' : 'pt-8 pb-4'}`}>
            {type === 'both' && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 text-center mb-4">
                {t('nav.partners')}
              </p>
            )}
            <LogoBand logos={partnerLogos} speed={partnerSpeed} />
          </div>
        )}

        {showExhibitors && (
          <div className={`${type !== 'both' ? 'py-6' : 'pt-4 pb-10'}`}>
            {type === 'both' && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 text-center mb-4">
                {t('nav.exhibitors')}
              </p>
            )}
            <LogoBand logos={exhibitorLogos} speed={exhibitorSpeed} reverse />
          </div>
        )}

        {type === 'both' && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-3 pb-16 pt-4 px-4"
          >
            <Link to={ROUTES.PARTNERS}>
              <Button variant="primary" size="md" className="group">
                {t('home.discover_all')}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to={ROUTES.EXHIBITORS}>
              <Button variant="secondary" size="md" className="group">
                {t('home.discover_all_exhibitors')}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        )}
      </section>
    </>
  );
};
