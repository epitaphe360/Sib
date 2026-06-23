import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, Building2, Calendar, Globe2, MapPin, Ticket, Users } from 'lucide-react';
import { Futuristic3DScene } from './Futuristic3DScene';
import { ROUTES } from '../../../lib/routes';
import { DEFAULT_SALON_CONFIG, formatSalonDatesShort } from '../../../config/salonInfo';

/* =========================================================
 * Countdown
 * ========================================================= */
const SALON_DATE = new Date('2026-11-25T09:00:00');

function calcCountdown() {
  const diff = SALON_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(n: number) { return n.toString().padStart(2, '0'); }

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const [prev, setPrev] = useState(value);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setAnimate(true);
      const t = setTimeout(() => { setAnimate(false); setPrev(value); }, 350);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div className="countdown-unit flex flex-col items-center px-3 pb-3">
      <div
        className={`
          font-display text-3xl md:text-4xl font-black tabular-nums
          transition-all duration-300 text-white
          ${animate ? 'scale-110 text-[#00D4FF]' : ''}
        `}
      >
        {pad(value)}
      </div>
      <span className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-[#F39200]/70 mt-1">
        {label}
      </span>
    </div>
  );
}

function Countdown() {
  const [cd, setCd] = useState(calcCountdown());
  useEffect(() => {
    const id = setInterval(() => setCd(calcCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-panel inline-flex items-center gap-0 px-1 py-1">
      <CountdownUnit value={cd.days}    label="jours"     />
      <span className="text-[#F39200]/40 text-2xl font-light pb-3">:</span>
      <CountdownUnit value={cd.hours}   label="heures"    />
      <span className="text-[#F39200]/40 text-2xl font-light pb-3">:</span>
      <CountdownUnit value={cd.minutes} label="minutes"   />
      <span className="text-[#F39200]/40 text-2xl font-light pb-3">:</span>
      <CountdownUnit value={cd.seconds} label="secondes"  />
    </div>
  );
}

/* =========================================================
 * Floating info badges
 * ========================================================= */
function InfoBadge({ icon: Icon, label, value, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel-sm flex items-center gap-3 px-4 py-2.5"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#F39200]/12 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#F39200]" />
      </div>
      <div>
        <p className="text-[0.6rem] font-bold tracking-[0.12em] uppercase text-[#00D4FF]/60">{label}</p>
        <p className="text-white text-sm font-semibold leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Main hero section
 * ========================================================= */
export function FuturisticHeroSection() {
  const heroRef    = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const badgeRef   = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y     = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  /* GSAP text reveal on mount */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(badgeRef.current, {
        opacity: 0, y: -20, duration: 0.6, ease: 'power3.out', delay: 0.2,
      });

      /* Split title chars & stagger */
      const titleEl = titleRef.current;
      if (titleEl) {
        gsap.from(titleEl.querySelectorAll('.char'), {
          opacity: 0,
          y: 40,
          rotationX: -60,
          stagger: 0.04,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.45,
        });
      }

      gsap.from(subtitleRef.current, {
        opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', delay: 1.0,
      });
    });
    return () => ctx.revert();
  }, []);

  const titleChars = 'SIB 2026'.split('').map((ch, i) => (
    <span key={i} className={`char inline-block ${ch === ' ' ? 'w-4 md:w-8' : ''}`}>{ch}</span>
  ));

  const salonDates = formatSalonDatesShort ? formatSalonDatesShort() : '25–28 Nov 2026';

  return (
    <section
      ref={heroRef}
      className="futuristic-page relative min-h-screen overflow-hidden bg-[#000912] scan-lines"
    >
      {/* ── 3D Background ── */}
      <Futuristic3DScene />

      {/* ── Dark gradient vignette ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,9,18,0.8) 100%)',
        }}
      />
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,9,18,1) 0%, rgba(0,9,18,0.4) 30%, transparent 60%)',
        }}
      />

      {/* ── Floating grid lines ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none holo-grid-bg opacity-30" />

      {/* ── Main content ── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-32 text-center"
      >
        {/* Event badge */}
        <motion.div
          ref={badgeRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="section-label-futuristic mb-8"
        >
          40e édition · Salon International du Bâtiment
        </motion.div>

        {/* Main title */}
        <div
          ref={titleRef}
          className="holo-text font-display font-black text-[clamp(4rem,14vw,9rem)] leading-none tracking-[-0.02em] mb-0 select-none"
          aria-label="SIB 2026"
        >
          {titleChars}
        </div>

        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="mt-6 max-w-2xl"
        >
          <p className="text-[#8BB8D8] text-lg md:text-xl font-light leading-relaxed">
            L'événement de référence du secteur de la construction et du bâtiment.
            <br className="hidden md:block" />
            <span className="text-white/80 font-medium">Casablanca · Parc des Expositions OFEC</span>
          </p>
        </div>

        {/* Info badges row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          <InfoBadge icon={Calendar}  label="Date"      value={salonDates}          delay={1.2} />
          <InfoBadge icon={MapPin}    label="Lieu"       value="Casablanca, Maroc"    delay={1.3} />
          <InfoBadge icon={Building2} label="Édition"    value="40e anniversaire"     delay={1.4} />
          <InfoBadge icon={Globe2}    label="Pays"       value="40+ pays représentés" delay={1.5} />
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <p className="text-[#F39200]/70 text-xs font-bold tracking-[0.15em] uppercase mb-3">
            Compte à rebours
          </p>
          <Countdown />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.85, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
            <button className="btn-futuristic-primary flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Réserver mon badge
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to={ROUTES.EXHIBITORS}>
            <button className="btn-futuristic-outline flex items-center gap-2">
              <Users className="w-4 h-4" />
              Exposants & stands
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[#F39200]/50 text-[0.6rem] tracking-[0.15em] uppercase font-bold">
          Défiler
        </span>
        <div className="scroll-indicator" />
      </motion.div>

      {/* ── Corner decorations ── */}
      <div className="absolute top-6 left-6 z-[2] pointer-events-none opacity-30">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M2 2 L2 20 M2 2 L20 2" stroke="#F39200" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="absolute top-6 right-6 z-[2] pointer-events-none opacity-30">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M46 2 L46 20 M46 2 L28 2" stroke="#F39200" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 z-[2] pointer-events-none opacity-30">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M2 46 L2 28 M2 46 L20 46" stroke="#F39200" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="absolute bottom-6 right-6 z-[2] pointer-events-none opacity-30">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M46 46 L46 28 M46 46 L28 46" stroke="#F39200" strokeWidth="1.5"/>
        </svg>
      </div>
    </section>
  );
}
