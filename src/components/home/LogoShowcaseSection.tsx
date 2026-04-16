import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ArrowRight } from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';

/* ─── Smooth infinite scroll CSS ─── */
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
.logo-rail--left { animation: scroll-left var(--speed,35s) linear infinite; }
.logo-rail--right{ animation: scroll-right var(--speed,35s) linear infinite; }
.logo-band:hover .logo-rail { animation-play-state: paused; }

.logo-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  transition: transform 0.4s cubic-bezier(.4,0,.2,1), filter 0.4s ease, box-shadow 0.4s ease;
  filter: grayscale(15%) opacity(0.85);
  cursor: pointer;
  border-radius: 16px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px);
  margin: 6px 8px;
  border: 1px solid rgba(0,0,0,0.04);
}
.logo-item:hover {
  transform: scale(1.18);
  filter: grayscale(0%) opacity(1);
  z-index: 10;
  position: relative;
  box-shadow: 0 8px 32px rgba(59,130,246,0.18), 0 2px 8px rgba(0,0,0,0.08);
  background: #ffffff;
  border-color: rgba(59,130,246,0.2);
}
.logo-item img {
  height: 90px;
  max-width: 220px;
  width: auto;
  object-fit: contain;
  pointer-events: none;
}
@media (min-width:640px) {
  .logo-item     { padding: 16px 36px; margin: 8px 12px; }
  .logo-item img { height: 110px; max-width: 280px; }
}
@media (min-width:1024px) {
  .logo-item     { padding: 20px 48px; margin: 10px 16px; }
  .logo-item img { height: 130px; max-width: 340px; }
}
`;

interface LogoShowcaseSectionProps {
  type?: 'partners' | 'exhibitors' | 'both';
}

/* ─── Seamless logo rail ─── */
const LogoBand: React.FC<{
  logos: { to: string; src: string; alt: string }[];
  reverse?: boolean;
  speed?: number;
  fadeBg?: string;
}> = ({ logos, reverse = false, speed = 35, fadeBg = '#f8fafc' }) => {
  if (logos.length === 0) {return null;}

  // triple for seamless wrapping
  const items = [...logos, ...logos, ...logos];

  return (
    <div className="logo-band relative overflow-hidden">
      {/* edge fades */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 lg:w-36 z-20"
        style={{ background: `linear-gradient(to right, ${fadeBg}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 lg:w-36 z-20"
        style={{ background: `linear-gradient(to left, ${fadeBg}, transparent)` }}
      />

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
          if (exhibitors.length === 0) {fetchExhibitors();}
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
      <section className="py-10 bg-white">
        <div className="flex justify-center gap-12 opacity-20 animate-pulse py-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-28 h-12 bg-slate-200 rounded" />
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

  const partnerSpeed   = Math.max(25, partners.length * 3.5);
  const exhibitorSpeed = Math.max(28, exhibitorsWithLogos.length * 3.5);

  return (
    <>
      <style>{scrollCSS}</style>

      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        {/* decorative top/bottom borders */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />

        {/* ── Header ── */}
        {type === 'both' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center pt-14 pb-4 px-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 mb-3">
              {t('home.trusted_by')}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              {t('home.logo_showcase_title')}
            </h2>
          </motion.div>
        )}

        {/* ── Partners ── */}
        {showPartners && (
          <div className={`${type !== 'both' ? 'py-10' : 'pt-10 pb-4'}`}>
            {type === 'both' && (
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-500/70 text-center mb-4">
                {t('nav.partners')}
              </p>
            )}
            <LogoBand logos={partnerLogos} speed={partnerSpeed} fadeBg="#f8fafc" />
          </div>
        )}

        {/* ── Exhibitors ── */}
        {showExhibitors && (
          <div className={`${type !== 'both' ? 'py-10' : 'pt-6 pb-10'}`}>
            {type === 'both' && (
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-500/70 text-center mb-4">
                {t('nav.exhibitors')}
              </p>
            )}
            <LogoBand logos={exhibitorLogos} speed={exhibitorSpeed} reverse fadeBg="#f8fafc" />
          </div>
        )}

        {/* ── CTA ── */}
        {type === 'both' && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-4 pb-10 pt-2 px-4"
          >
            <Link to={ROUTES.PARTNERS}>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all text-sm">
                {t('home.discover_all')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={ROUTES.EXHIBITORS}>
              <Button variant="outline" className="flex items-center gap-2 border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-5 py-2.5 rounded-lg font-medium transition-all text-sm">
                {t('home.discover_all_exhibitors')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </section>
    </>
  );
};
