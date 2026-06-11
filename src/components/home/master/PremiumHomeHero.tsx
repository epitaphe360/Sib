import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Crown, Globe2, Sparkles, Ticket } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { IMAGES, img, srcSet } from '../../../lib/images';
import {
  DEFAULT_SALON_CONFIG,
  formatSalonDatesShort,
} from '../../../config/salonInfo';
import { DM } from '../../../design/designMasterTokens';
import type { MasterHeroVariant } from '../../../config/masterHomeConfig';
import { MASTER_VARIANT_META } from '../../../config/masterHomeConfig';
import { SALON_START_DAY_NOTE } from '../../../config/salonInfo';
import { HomeEventBar } from '../HomeEventBar';
import { Sib2026HeroBadgeForm } from '../sib2026/Sib2026HeroBadgeForm';
import { MasterHero3DCanvas } from './MasterHero3DCanvas';

const SALON_DATE = new Date('2026-11-25T09:00:00');

const VARIANT_BADGE: Partial<Record<MasterHeroVariant, React.ReactNode>> = {
  worldclass: <Crown className="h-4 w-4" />,
  world: <Globe2 className="h-4 w-4" />,
  optimized: <Sparkles className="h-4 w-4" />,
};

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

interface PremiumHomeHeroProps {
  variant?: Extract<MasterHeroVariant, 'optimized' | 'worldclass' | 'world'>;
}

/** Hero cinématique premium — countdown, stats, 3D, parallax scroll */
export const PremiumHomeHero: React.FC<PremiumHomeHeroProps> = ({ variant = 'optimized' }) => {
  const { t } = useTranslation();
  const meta = MASTER_VARIANT_META[variant];
  const ref = useRef<HTMLElement>(null);
  const [timeLeft, setTimeLeft] = useState(calcCountdown);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.25]);

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

  return (
    <>
      <HomeEventBar />

      <section
        ref={ref}
        className="home-dark home-p7-hero relative min-h-[min(92vh,920px)] flex items-end overflow-hidden"
      >
        <motion.div className="absolute inset-0 z-0" style={{ scale: bgScale }}>
          <img
            src={img(IMAGES.hero.construction, 2560, undefined, 90)}
            srcSet={srcSet(IMAGES.hero.construction)}
            sizes="100vw"
            alt=""
            className="home-p7-ken-burns home-hero-photo absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07182C] via-[#07182C]/78 to-[#07182C]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07182C]/88 via-[#07182C]/40 to-transparent" />
        </motion.div>

        <div className="home-p7-hero-accent absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-transparent via-[#F39200] to-transparent opacity-90" />

        {meta.show3D && <MasterHero3DCanvas />}

        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 w-full max-w-container mx-auto px-6 lg:px-8 pb-14 lg:pb-20 pt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...DM.spring, duration: 0.85 }}
              className="lg:col-span-7"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={DM.spring}
                className="inline-flex items-center gap-2 dm-glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-6"
              >
                {VARIANT_BADGE[variant]}
                {meta.label}
              </motion.div>

              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#BAD2E8] mb-2">
                {formatSalonDatesShort()} · {DEFAULT_SALON_CONFIG.location.city},{' '}
                {DEFAULT_SALON_CONFIG.location.country}
              </p>
              <p className="text-[10px] text-white/60 mb-5">{SALON_START_DAY_NOTE}</p>

              <p className="dm-display text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black leading-[0.95] tracking-tight text-white mb-4">
                SIB <span style={{ color: DM.orange }}>2026</span>
              </p>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">
                {t('hero.edition')}
              </p>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase leading-[1.12] tracking-wide text-white mb-4 whitespace-pre-line">
                {t('hero.title')}
              </h1>

              <p className="text-base sm:text-lg text-white/75 max-w-xl leading-relaxed mb-10">
                {t('home.world7.subtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="#badges"
                  whileHover={{ scale: DM.hoverScale }}
                  whileTap={{ scale: 0.98 }}
                  transition={DM.spring}
                  className="inline-flex items-center gap-2 min-w-[200px] justify-center px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-[#001A3D] shadow-lg"
                  style={{ backgroundColor: DM.orange }}
                >
                  <Ticket className="h-5 w-5" />
                  {t('networking.signup_button')}
                  <ArrowRight className="h-4 w-4" />
                </motion.a>
                <motion.div whileHover={{ scale: DM.hoverScale }} whileTap={{ scale: 0.98 }} transition={DM.spring}>
                  <Link
                    to={ROUTES.EXHIBITOR_SUBSCRIPTION}
                    className="inline-flex items-center gap-2 min-w-[200px] justify-center px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white dm-glass border border-white/20 shadow-lg"
                  >
                    <Building2 className="h-5 w-5" />
                    {t('hero.cta.exhibitor')}
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...DM.spring, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="space-y-4">
                <div className="dm-glass rounded-[32px] p-6 lg:p-8 border border-white/15">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#BAD2E8] mb-5">
                    {t('hero.countdown.title')}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {countdown.map(({ v, l }) => (
                      <div key={l} className="text-center">
                        <div className="text-3xl sm:text-4xl font-black tabular-nums text-white leading-none">
                          {pad(v)}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/50 mt-2">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Sib2026HeroBadgeForm />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default PremiumHomeHero;
