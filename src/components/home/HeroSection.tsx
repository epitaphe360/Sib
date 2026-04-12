import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';

const GOLD = '#D4AF37';
const DARK_BG = '#020913';

export const HeroSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    const salonDate = new Date('2026-11-25T09:00:00');

    const calculateTimeLeft = () => {
      const diff = salonDate.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => n.toString().padStart(2, '0');

  const countdown = [
    { value: timeLeft.days, label: 'Jours' },
    { value: timeLeft.hours, label: 'Heures' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <>
      {/* ── Bandeau Ministère ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-400">
            Sous l'égide du
          </p>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <img
            src="/logo-ministere.png"
            alt="Ministère de l'Équipement et de l'Eau — Maroc"
            className="h-14 md:h-18 w-auto object-contain"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo-ministere.svg'; }}
          />
        </div>
      </div>

      {/* ── Hero Cinématique ──────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${DARK_BG} 0%, #04111f 45%, #071828 70%, #0A1929 100%)` }}
      >
        {/* Blueprint grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '70px 70px',
          }}
        />

        {/* Radial glow — titre */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.13) 0%, transparent 65%)',
          }}
        />

        {/* Coins décoratifs */}
        {[
          { top: '2rem', left: '2rem' },
          { top: '2rem', right: '2rem', flipX: true },
          { bottom: '5rem', left: '2rem', flipY: true },
          { bottom: '5rem', right: '2rem', flip: true },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute hidden lg:block opacity-15"
            style={{
              top: pos.top,
              left: pos.left,
              bottom: pos.bottom,
              right: pos.right,
              transform: pos.flip ? 'scale(-1)' : pos.flipX ? 'scaleX(-1)' : pos.flipY ? 'scaleY(-1)' : undefined,
            }}
          >
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <path d="M0 36 L36 0 L72 36 L36 72 Z" stroke={GOLD} strokeWidth="1.2" fill="none" />
              <path d="M18 36 L36 18 L54 36 L36 54 Z" stroke={GOLD} strokeWidth="0.6" fill="none" />
              <circle cx="36" cy="36" r="3" fill={GOLD} fillOpacity="0.5" />
            </svg>
          </div>
        ))}

        {/* Texte vertical latéral */}
        <div
          className="hidden xl:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 select-none"
          style={{ opacity: 0.25 }}
        >
          <div className="w-px h-20" style={{ background: `linear-gradient(to bottom, transparent, ${GOLD})` }} />
          <span
            className="text-white text-xs tracking-[0.3em] uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Salon International du Bâtiment
          </span>
          <div className="w-px h-20" style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
        </div>
        <div
          className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 select-none"
          style={{ opacity: 0.25 }}
        >
          <div className="w-px h-20" style={{ background: `linear-gradient(to bottom, transparent, ${GOLD})` }} />
          <span
            className="text-white text-xs tracking-[0.3em] uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            El Jadida · Maroc · 2026
          </span>
          <div className="w-px h-20" style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
        </div>

        {/* ── Contenu central ──────────────────────────────────────────── */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center py-20">

          {/* Badge 40ème Édition */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 flex justify-center"
          >
            <div
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full"
              style={{
                border: `1px solid ${GOLD}55`,
                background: 'rgba(212,175,55,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span style={{ color: GOLD }}>✦</span>
              <span
                className="text-sm font-bold tracking-[0.22em] uppercase"
                style={{ color: GOLD }}
              >
                20ème Édition · 40 Ans d'Histoire
              </span>
              <span style={{ color: GOLD }}>✦</span>
            </div>
          </motion.div>

          {/* Titre principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <h1
              className="font-heading font-bold text-white leading-none uppercase tracking-wide"
              style={{ fontSize: 'clamp(2.2rem, 7.5vw, 5.5rem)' }}
            >
              Salon International
            </h1>
            <h1
              className="font-heading font-bold leading-none uppercase tracking-wide"
              style={{
                fontSize: 'clamp(2.2rem, 7.5vw, 5.5rem)',
                color: GOLD,
              }}
            >
              du Bâtiment
            </h1>
            <p
              className="text-sm sm:text-base mt-4 tracking-widest uppercase text-white"
              style={{ opacity: 0.5, letterSpacing: '0.18em' }}
            >
              Mise en œuvre maîtrisée · Matériaux & Bâtiments valorisés
            </p>
          </motion.div>

          {/* Séparateur doré */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex items-center justify-center gap-3 my-8"
          >
            <div className="h-px w-28" style={{ background: `linear-gradient(to right, transparent, ${GOLD}80)` }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: GOLD }} />
            <div className="h-px w-28" style={{ background: `linear-gradient(to left, transparent, ${GOLD}80)` }} />
          </motion.div>

          {/* Date & Lieu */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
              25 — 29 Novembre 2026
            </div>

            <div className="hidden sm:block w-1 h-1 rounded-full bg-white opacity-25" />

            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
              Parc d'Expo Mohammed VI · El Jadida, Maroc
            </div>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mb-14"
          >
            <p
              className="text-xs tracking-[0.22em] uppercase mb-5 text-white"
              style={{ opacity: 0.45 }}
            >
              Ouverture dans
            </p>

            <div className="flex items-center justify-center gap-3 sm:gap-5">
              {countdown.map((item, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div
                      className="flex items-center justify-center w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-xl sm:rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${GOLD}30`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: `0 0 24px ${GOLD}12, inset 0 1px 0 rgba(255,255,255,0.06)`,
                      }}
                    >
                      <span
                        className="font-heading font-bold text-2xl sm:text-4xl tabular-nums"
                        style={{ color: GOLD, letterSpacing: '0.04em' }}
                      >
                        {fmt(item.value)}
                      </span>
                    </div>
                    <span
                      className="text-[10px] sm:text-xs mt-2 tracking-widest uppercase text-white"
                      style={{ opacity: 0.45 }}
                    >
                      {item.label}
                    </span>
                  </div>
                  {i < countdown.length - 1 && (
                    <span
                      className="text-xl sm:text-2xl font-bold -mt-5 text-white"
                      style={{ opacity: 0.25 }}
                    >
                      :
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Boutons CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to={ROUTES.REGISTER_EXHIBITOR}>
              <HeroButton variant="gold">
                Devenir Exposant
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </HeroButton>
            </Link>
            <Link to={ROUTES.REGISTER_VISITOR}>
              <HeroButton variant="outline-white">
                Visiter le Salon
              </HeroButton>
            </Link>
            <Link to={ROUTES.EXHIBITORS}>
              <HeroButton variant="outline-gold">
                Découvrir
              </HeroButton>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ opacity: 0.35 }}
        >
          <span className="text-white text-[10px] tracking-[0.22em] uppercase">Défiler</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

/* ── Composant bouton héro ─────────────────────────────────────────────── */
type HeroBtnVariant = 'gold' | 'outline-white' | 'outline-gold';

const HeroButton: React.FC<{
  variant: HeroBtnVariant;
  children: React.ReactNode;
}> = ({ variant, children }) => {
  const [hovered, setHovered] = React.useState(false);

  const styles: Record<HeroBtnVariant, React.CSSProperties> = {
    gold: {
      background: hovered
        ? 'linear-gradient(135deg, #e8c84a, #C9A020)'
        : 'linear-gradient(135deg, #D4AF37, #B8960C)',
      color: DARK_BG,
      border: 'none',
      boxShadow: hovered ? '0 8px 28px rgba(212,175,55,0.45)' : '0 4px 18px rgba(212,175,55,0.3)',
      transform: hovered ? 'translateY(-2px)' : 'none',
    },
    'outline-white': {
      background: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
      color: 'white',
      border: `1px solid ${hovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)'}`,
      backdropFilter: 'blur(8px)',
      transform: hovered ? 'translateY(-2px)' : 'none',
    },
    'outline-gold': {
      background: hovered ? 'rgba(212,175,55,0.12)' : 'transparent',
      color: GOLD,
      border: `1px solid ${hovered ? `${GOLD}80` : `${GOLD}35`}`,
      backdropFilter: 'blur(8px)',
      transform: hovered ? 'translateY(-2px)' : 'none',
    },
  };

  return (
    <button
      className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-250"
      style={styles[variant]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
};
