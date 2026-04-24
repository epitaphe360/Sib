import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { IMAGES, img } from '../../lib/images';

/**
 * SIB 2026 — HeroSection raffinée
 *
 * Design:
 * - Bandeau ministère minimal (blanc, sobre)
 * - Hero pleine largeur avec photo 4K construction en fond
 * - Overlay gradient sombre pour lisibilité
 * - Countdown raffiné, cartes homogènes
 * - Animations Framer Motion en cascade
 */
export const HeroSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    const salonDate = new Date('2026-11-25T09:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = salonDate.getTime() - now.getTime();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days:    Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  const unit = (v: number, singular: string, plural: string) => (v <= 1 ? t(singular) : t(plural));

  return (
    <>
      {/* ================================================================
          BANDEAU MINISTÈRE — minimal, blanc, typographie soignée
      ================================================================= */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 pt-20 xl:pt-24 pb-8">
        <div className="max-w-container mx-auto px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-5 font-medium">
            Sous l'égide du
          </p>
          <img
            src="/logo-ministere.png"
            alt="Royaume du Maroc — Ministère de l'Aménagement du Territoire National, de l'Urbanisme, de l'Habitat et de la Politique de la Ville"
            className="h-24 md:h-28 w-auto object-contain mx-auto transition-transform duration-500 hover:scale-[1.03]"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = '/logo-ministere.svg';
            }}
          />
        </div>
      </div>

      {/* ================================================================
          HERO — photo 4K en fond, contenu sur overlay
      ================================================================= */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center text-white">
        {/* Photo 4K en fond absolu */}
        <div className="absolute inset-0 z-0">
          <img
            src={img(IMAGES.hero.construction, 2560, undefined, 82)}
            srcSet={`
              ${img(IMAGES.hero.construction, 960)} 960w,
              ${img(IMAGES.hero.construction, 1440)} 1440w,
              ${img(IMAGES.hero.construction, 1920)} 1920w,
              ${img(IMAGES.hero.construction, 2560)} 2560w
            `}
            sizes="100vw"
            alt="Architecture moderne"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          {/* Gradient overlay pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-900/80 to-primary-700/75" />
          {/* Gradient bas pour transition vers section suivante */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 to-transparent" />
        </div>

        {/* Accent subtil - point lumineux doré */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 -right-20 w-[32rem] h-[32rem] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.15) 0%, transparent 70%)' }}
        />

        {/* Contenu */}
        <div className="relative z-10 w-full max-w-container mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Colonne gauche — texte + countdown */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              {/* Kicker */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2.5 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-white/90">
                  SIB 2026 — 25-29 Novembre · El Jadida
                </span>
              </motion.div>

              {/* Titre */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white mb-6"
              >
                {t('hero.title')}
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mb-10"
              >
                {t('hero.subtitle')}
              </motion.p>

              {/* Countdown raffiné */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mb-10"
              >
                <div className="inline-flex items-center gap-2 mb-4 text-xs font-medium uppercase tracking-[0.15em] text-accent-500">
                  <span className="h-px w-8 bg-accent-500" />
                  {t('hero.countdown.title') || 'Compte à rebours'}
                </div>
                <div className="flex gap-3">
                  {[
                    { value: timeLeft.days,    label: unit(timeLeft.days,    'time.day',    'time.days') },
                    { value: timeLeft.hours,   label: unit(timeLeft.hours,   'time.hour',   'time.hours') },
                    { value: timeLeft.minutes, label: unit(timeLeft.minutes, 'time.minute', 'time.minutes') },
                    { value: timeLeft.seconds, label: unit(timeLeft.seconds, 'time.second', 'time.seconds') },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
                      className="flex flex-col items-center justify-center min-w-[72px] sm:min-w-[88px] px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15"
                    >
                      <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white leading-none">
                        {formatNumber(item.value)}
                      </span>
                      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to={ROUTES.REGISTER_EXHIBITOR}>
                  <Button variant="accent" size="lg" className="w-full sm:w-auto group">
                    {t('hero.cta.exhibitor')}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to={ROUTES.EXHIBITORS}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/25 text-white hover:bg-white/20 hover:border-white/40"
                  >
                    {t('hero.cta.discover')}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Colonne droite — carte résumé + photo flottante */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative">
                {/* Photo principale */}
                <SmartImage
                  source={IMAGES.business.networking}
                  aspect="4/5"
                  rounded="2xl"
                  priority
                  className="shadow-2xl"
                  overlay="bottom"
                >
                  <div className="text-white">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-500 mb-2">
                      Networking B2B
                    </p>
                    <p className="text-xl font-semibold leading-tight">
                      Rencontrez 5 000+ professionnels du BTP
                    </p>
                  </div>
                </SmartImage>

                {/* Carte flottante — événement */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  className="absolute -left-8 bottom-24 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3 max-w-[220px]"
                >
                  <div className="h-11 w-11 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Conférences
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                      120 événements sur 5 jours
                    </p>
                  </div>
                </motion.div>

                {/* Carte flottante — lieu */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 1.05 }}
                  className="absolute -right-6 top-10 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3 max-w-[220px]"
                >
                  <div className="h-11 w-11 rounded-lg bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-accent-600 dark:text-accent-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Lieu
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                      Mohammed VI Exhibition Center
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Barre événement info — bas de hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-16 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: MapPin,   label: 'Lieu',       value: 'El Jadida, Maroc' },
              { icon: Calendar, label: 'Dates',      value: '25-29 Nov. 2026' },
              { icon: Users,    label: 'Visiteurs',  value: '40 000+ attendus' },
              { icon: Sparkles, label: 'Format',     value: 'Hybride · Premium' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
};
