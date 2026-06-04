import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Ticket, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { IMAGES, img, srcSet } from '../../lib/images';
import {
  DEFAULT_SALON_CONFIG,
  formatSalonDatesShort,
  SALON_START_DAY_NOTE,
} from '../../config/salonInfo';
import { HomeEventBar } from './HomeEventBar';
import { MinistryEgidBar } from './MinistryEgidBar';
import { HeroPhotoOverlay } from './HeroPhotoOverlay';

export const HeroSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    const salonDate = new Date('2026-11-25T09:00:00');
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = salonDate.getTime() - now.getTime();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0 };
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <MinistryEgidBar />

      <HomeEventBar />

      {/* Hero type salon professionnel (BATIMAT / BIG5) */}
      <section className="home-dark relative min-h-[520px] lg:min-h-[580px] flex items-end overflow-hidden text-white">
        <div className="absolute inset-0 z-0 home-hero-media overflow-hidden">
          <img
            src={img(IMAGES.hero.architecture, 2560, undefined, 90)}
            srcSet={srcSet(IMAGES.hero.architecture)}
            sizes="100vw"
            alt="Salon International du Bâtiment"
            className="h-full w-full object-cover home-hero-photo"
            loading="eager"
          />
          <HeroPhotoOverlay />
        </div>

        <div className="relative z-10 w-full max-w-container mx-auto px-6 lg:px-8 py-14 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-primary-200 mb-4">
              {t('hero.edition')}
            </p>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.02] tracking-tight mb-5">
              {t('hero.title')}
            </h1>

            <p className="text-xl sm:text-2xl font-medium !text-white mb-2 tracking-tight">
              {t('hero.tagline')}
            </p>
            <p className="text-base sm:text-lg !text-white/90 leading-relaxed max-w-2xl mb-8">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 text-sm !text-white mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/25 border border-white/30 backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-primary-200 shrink-0" />
                {formatSalonDatesShort()} — {SALON_START_DAY_NOTE}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/25 border border-white/30 backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-primary-200 shrink-0" />
                {DEFAULT_SALON_CONFIG.location.venue}, {DEFAULT_SALON_CONFIG.location.city}
              </span>
            </div>

            {/* Compte à rebours simplifié */}
            <div className="flex flex-wrap items-end gap-6 mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest !text-white/70 mb-2">
                  {t('hero.countdown.title')}
                </p>
                <div className="flex gap-3">
                  {[
                    { value: timeLeft.days, label: t('time.days') },
                    { value: timeLeft.hours, label: t('time.hours') },
                    { value: timeLeft.minutes, label: t('time.minutes') },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="text-center min-w-[56px] px-2 py-2 border-b-2 border-primary-300 bg-black/20 rounded-t-md"
                    >
                      <span className="block text-3xl sm:text-4xl font-bold tabular-nums leading-none !text-white">
                        {String(item.value).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider !text-white/80 mt-1 block">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs principaux — style BIG5 / BATIMAT */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a href="#badges">
                <Button variant="accent" size="lg" className="w-full sm:w-auto min-w-[200px] group shadow-lg">
                  <Ticket className="h-5 w-5 mr-1" />
                  {t('hero.cta.ticket')}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px] group">
                  <Building2 className="h-5 w-5 mr-1" />
                  {t('hero.cta.exhibitor')}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={ROUTES.EXHIBITORS}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto !bg-white/15 !text-white border-2 !border-white hover:!bg-white/25 backdrop-blur-sm shadow-md"
                >
                  <Users className="h-5 w-5 mr-1" />
                  {t('hero.cta.discover')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
