import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Crown, Sparkles, Globe2 } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { SIB_PHOTOS_CDN } from '../../../config/sibMaRemoteUrls';
import { useSiteImage } from '../../../hooks/useSiteImage';
import { DM } from '../../../design/designMasterTokens';
import type { MasterHeroVariant } from '../../../config/masterHomeConfig';
import { MASTER_VARIANT_META } from '../../../config/masterHomeConfig';
import { SALON_START_DAY_NOTE } from '../../../config/salonInfo';
import { HomeEventBar } from '../HomeEventBar';
import { Sib2026HeroBadgeForm } from '../sib2026/Sib2026HeroBadgeForm';
import { MasterHero3DCanvas } from './MasterHero3DCanvas';

interface MasterHeroSectionProps {
  variant: MasterHeroVariant;
}

const VARIANT_BADGE: Partial<Record<MasterHeroVariant, React.ReactNode>> = {
  worldclass: <Crown className="h-4 w-4" />,
  world: <Globe2 className="h-4 w-4" />,
  glass: <Sparkles className="h-4 w-4" />,
};

export const MasterHeroSection: React.FC<MasterHeroSectionProps> = ({ variant }) => {
  const { t } = useTranslation();
  const meta = MASTER_VARIANT_META[variant];
  const { src: heroSrc } = useSiteImage('home_hero_hall');
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  const isManus = variant === 'manus';
  const kicker = isManus ? t('home.sib40.hero.kicker') : t('mockup.hero.kicker');
  const headline = isManus ? t('home.sib40.hero.headline') : t('mockup.hero.headline');
  const date = isManus ? t('home.sib40.hero.date') : t('mockup.hero.date');
  const location = isManus ? t('home.sib40.hero.location') : t('mockup.hero.location');
  const ctaStand = isManus ? t('home.sib40.hero.cta_stand') : t('mockup.hero.cta_stand');
  const ctaVisitor = isManus ? t('home.sib40.hero.cta_visitor') : t('mockup.hero.cta_visitor');

  const gradientClass =
    variant === 'split'
      ? 'dm-hero-gradient-split'
      : variant === 'glass'
        ? 'dm-hero-gradient-glass'
        : 'dm-hero-gradient';

  const layoutClass =
    variant === 'mega'
      ? 'items-end text-center lg:text-left'
      : variant === 'split'
        ? 'items-center'
        : variant === 'bento'
          ? 'items-center lg:items-end pb-32'
          : 'items-center';

  const titleBlock = (
    <>
      {variant === 'official' && (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...DM.spring, delay: 0.05 }}
          className="dm-display text-[64px] sm:text-[80px] lg:text-[110px] font-black leading-[0.9] mb-4 tracking-tight text-white"
        >
          SIB <span style={{ color: DM.orange }}>2026</span>
        </motion.p>
      )}
      {variant === 'manus' && (
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={DM.spring}
          className="dm-display text-5xl sm:text-6xl lg:text-7xl font-black mb-2 text-white"
        >
          {t('home.sib40.hero.title')}
        </motion.h1>
      )}
      {(variant === 'worldclass' || variant === 'world' || variant === 'optimized') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={DM.spring}
          className="inline-flex items-center gap-2 dm-glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-6"
        >
          {VARIANT_BADGE[variant]}
          {meta.label}
        </motion.div>
      )}
      {variant !== 'official' && variant !== 'manus' && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...DM.spring, delay: 0.08 }}
          className="dm-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] mb-4 text-white"
        >
          SIB <span style={{ color: DM.orange }}>2026</span>
        </motion.p>
      )}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...DM.spring, delay: 0.12 }}
        className="text-xs font-bold uppercase tracking-[0.24em] mb-4"
        style={{ color: DM.orange }}
      >
        {kicker}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...DM.spring, delay: 0.18 }}
        className="dm-display text-2xl sm:text-3xl lg:text-[34px] font-black uppercase leading-[1.1] mb-8 tracking-wide whitespace-pre-line text-white"
      >
        {headline}
      </motion.h2>
    </>
  );

  return (
    <>
      <HomeEventBar />
    <section
      ref={ref}
      className={`relative min-h-[620px] sm:min-h-[700px] lg:min-h-[820px] flex overflow-hidden ${layoutClass}`}
    >
      <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
        <img
          src={heroSrc}
          alt=""
          className="h-full w-full object-cover object-[center_35%]"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>
      <div className={`absolute inset-0 ${gradientClass}`} aria-hidden />
      {meta.show3D && <MasterHero3DCanvas />}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className={`relative z-10 w-full dm-container pb-20 lg:pb-28 pt-40 lg:pt-48 ${
          variant === 'bento' ? '' : 'lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:gap-12 lg:items-start'
        }`}
      >
        <div
          className={`max-w-[640px] ${
            variant === 'mega' ? 'mx-auto lg:mx-0' : ''
          } ${variant === 'glass' ? 'dm-glass rounded-[32px] p-8 lg:p-10' : ''}`}
        >
          {titleBlock}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...DM.spring, delay: 0.24 }}
            className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.08em] mb-10 text-white/90"
          >
            <span className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 shrink-0" style={{ color: DM.orange }} strokeWidth={2} />
              {date}
            </span>
            <span className="text-[10px] font-medium normal-case tracking-normal text-white/75 pl-6">
              {SALON_START_DAY_NOTE}
            </span>
            <span className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: DM.orange }} strokeWidth={2} />
              <span className="whitespace-pre-line">{location}</span>
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...DM.spring, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={DM.spring}>
              <Link
                to={ROUTES.EXHIBITOR_SUBSCRIPTION}
                className="inline-flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white rounded-full"
                style={{ backgroundColor: DM.orange }}
              >
                {ctaStand}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={DM.spring}>
              <Link
                to={ROUTES.REGISTER_VISITOR}
                className="inline-flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white rounded-full dm-glass border border-white/20"
              >
                {ctaVisitor}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {variant !== 'bento' && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...DM.spring, delay: 0.35 }}
            className="hidden lg:block w-full max-w-md lg:ml-auto"
          >
            <Sib2026HeroBadgeForm />
          </motion.div>
        )}

        {variant === 'bento' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...DM.spring, delay: 0.4 }}
            className="mt-10 lg:mt-0 grid grid-cols-2 gap-4 max-w-lg lg:ml-auto"
          >
            {[SIB_PHOTOS_CDN.stand, SIB_PHOTOS_CDN.parc, SIB_PHOTOS_CDN.conferences, SIB_PHOTOS_CDN.b2b].map(
              (src, i) => (
                <div key={i} className="dm-glass rounded-[24px] overflow-hidden aspect-[4/3] dm-card-hover">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ),
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
    </>
  );
};
