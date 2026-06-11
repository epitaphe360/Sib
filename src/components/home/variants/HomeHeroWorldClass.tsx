import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { IMAGES, img, srcSet } from '../../../lib/images';
import {
  DEFAULT_SALON_CONFIG,
  formatSalonDatesShort,
  SALON_STATS,
} from '../../../config/salonInfo';
import { HomeEventBar } from '../HomeEventBar';

const SALON_DATE = new Date('2026-11-25T09:00:00');

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function calcCountdown() {
  const diff = SALON_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

/** P7 — Hero éditorial plein écran (référence BIG5 / salons premium) */
export const HomeHeroWorldClass: React.FC = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(calcCountdown);

  useEffect(() => {
    const tick = () => setTimeLeft(calcCountdown());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = [
    { v: timeLeft.days, l: t('time.day') },
    { v: timeLeft.hours, l: t('time.hour') },
    { v: timeLeft.minutes, l: t('time.minute') },
    { v: timeLeft.seconds, l: t('time.second') },
  ];

  const stats = [
    { v: SALON_STATS.exhibitors, l: t('stats.exhibitors') },
    { v: SALON_STATS.visitors, l: t('stats.visitors') },
    { v: SALON_STATS.countries, l: t('stats.countries') },
  ];

  return (
    <>
      <HomeEventBar />

      <section className="home-dark home-p7-hero relative min-h-[min(92vh,920px)] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={img(IMAGES.hero.construction, 2560, undefined, 90)}
            srcSet={srcSet(IMAGES.hero.construction)}
            sizes="100vw"
            alt=""
            className="home-p7-ken-burns home-hero-photo absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07182C] via-[#07182C]/75 to-[#07182C]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07182C]/85 via-[#07182C]/35 to-transparent" />
        </div>

        <div className="home-p7-hero-accent absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-transparent via-[#5E8FBE] to-transparent opacity-80" />

        <div className="relative z-10 w-full max-w-container mx-auto px-6 lg:px-8 pb-14 lg:pb-20 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#BAD2E8] mb-5">
                {formatSalonDatesShort()} · {DEFAULT_SALON_CONFIG.location.city}, {DEFAULT_SALON_CONFIG.location.country}
              </p>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">
                {t('hero.edition')}
              </p>

              <h1 className="text-white text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[0.95] tracking-tight mb-6">
                {t('hero.title')}
              </h1>

              <p className="text-xl sm:text-2xl font-medium !text-white/95 mb-2 tracking-tight">
                {t('hero.tagline')}
              </p>
              <p className="text-base sm:text-lg !text-white/75 max-w-xl leading-relaxed mb-10">
                {t('home.world7.subtitle')}
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#badges">
                  <Button variant="accent" size="lg" className="min-w-[200px] group shadow-lg">
                    <Ticket className="h-5 w-5 mr-1" />
                    {t('hero.cta.ticket')}
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </a>
                <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION}>
                  <Button
                    size="lg"
                    className="min-w-[200px] !bg-white !text-primary-900 hover:!bg-neutral-100 border-0 shadow-lg"
                  >
                    <Building2 className="h-5 w-5 mr-1" />
                    {t('hero.cta.exhibitor')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <div className="rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md p-6 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#BAD2E8] mb-5">
                  {t('hero.countdown.title')}
                </p>
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {countdown.map(({ v, l }) => (
                    <div key={l} className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold tabular-nums !text-white leading-none">
                        {pad(v)}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-white/50 mt-2">{l}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/15 pt-6 grid grid-cols-3 gap-4">
                  {stats.map(({ v, l }) => (
                    <div key={l}>
                      <div className="text-2xl font-bold !text-white tabular-nums">{v}</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/55 mt-1 leading-tight">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs !text-white/50 text-right hidden lg:block">
                {DEFAULT_SALON_CONFIG.location.venue}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeHeroWorldClass;
