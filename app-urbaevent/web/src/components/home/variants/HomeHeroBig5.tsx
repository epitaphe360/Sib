import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Ticket, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { IMAGES, img, srcSet } from '../../../lib/images';
import { DEFAULT_SALON_CONFIG, formatSalonDatesShort } from '../../../config/salonInfo';
import { HomeEventBar } from '../HomeEventBar';
import { HeroPhotoOverlay } from '../HeroPhotoOverlay';
import { SALON_STATS } from '../../../config/salonInfo';

/** Hero BIG5 — typographie massive, chiffres intégrés */
export const HomeHeroBig5: React.FC = () => {
  const { t } = useTranslation();
  const stats = [
    { v: SALON_STATS.exhibitors, l: t('stats.exhibitors') },
    { v: SALON_STATS.visitors, l: t('stats.visitors') },
    { v: SALON_STATS.countries, l: t('stats.countries') },
  ];

  return (
    <>
      <HomeEventBar />
      <section className="home-dark relative min-h-[70vh] flex items-end text-white overflow-hidden">
        <div className="absolute inset-0 home-hero-media overflow-hidden">
        <img
          src={img(IMAGES.hero.architecture, 2560, undefined, 90)}
          srcSet={srcSet(IMAGES.hero.architecture)}
          alt="SIB 2026"
          className="absolute inset-0 w-full h-full object-cover home-hero-photo"
          sizes="100vw"
        />
        </div>
        <HeroPhotoOverlay />
        <div className="relative z-10 w-full max-w-container mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary-300 mb-6">{formatSalonDatesShort()} · El Jadida</p>
            <h1 className="text-white text-5xl sm:text-6xl lg:text-8xl font-bold leading-[0.95] tracking-tight max-w-5xl mb-6">
              {t('home.big5.headline')}
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 max-w-2xl mb-10 font-medium">{t('hero.subtitle')}</p>
            <div className="flex flex-wrap gap-8 mb-12 border-t border-white/20 pt-8">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="text-4xl lg:text-5xl font-bold tabular-nums !text-white">{s.v}</div>
                  <div className="text-xs uppercase tracking-widest text-primary-200 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={`${ROUTES.HOME_P2}#badges`}>
                <Button variant="accent" size="lg" className="group">
                  <Ticket className="h-5 w-5" /> {t('hero.cta.ticket')}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION}>
                <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50">
                  <Building2 className="h-5 w-5" /> {t('hero.cta.exhibitor')}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/60 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {DEFAULT_SALON_CONFIG.location.venue}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomeHeroBig5;
