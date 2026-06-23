import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Globe2, Users, Award } from 'lucide-react';

/* =========================================================
 * Animated counter
 * ========================================================= */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / 50;
    const id = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(Math.round(start));
      if (start >= value) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  );
}

/* =========================================================
 * Stat card
 * ========================================================= */
interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/* Palette logo SIB : orange · bleu clair · bleu moyen · navy */
const STATS: StatItem[] = [
  { value: 40,    suffix: '+',  label: 'Éditions',        sublabel: 'années de tradition',      icon: Award,     color: '#F39200' },
  { value: 300,   suffix: '+',  label: 'Exposants',       sublabel: 'marques & entreprises',    icon: Building2, color: '#5E8FBE' },
  { value: 50000, suffix: '+',  label: 'Visiteurs',       sublabel: 'professionnels / édition', icon: Users,     color: '#2E5984' },
  { value: 40,    suffix: '',   label: 'Pays',            sublabel: 'représentés',              icon: Globe2,    color: '#2E5984' },
];

function StatCard({ item, index }: { item: StatItem; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="stat-card-futuristic glass-panel p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: item.color }} />
        </div>
        <div
          className="w-2 h-2 rounded-full glow-dot"
          style={{ background: item.color }}
        />
      </div>
      <div>
        <div
          className="font-display text-4xl font-black leading-none"
          style={{ color: item.color }}
        >
          <AnimatedCounter value={item.value} suffix={item.suffix} />
        </div>
        <p className="text-white font-bold text-base mt-1">{item.label}</p>
        <p className="text-[#8BB8D8]/70 text-xs mt-0.5">{item.sublabel}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Exported section
 * ========================================================= */
export function FuturisticStatsSection() {
  return (
    <section className="futuristic-page relative bg-[#000912] py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #2E5984, transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="section-label-futuristic mb-4">Le Salon en chiffres</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white">
            40 ans d'excellence{' '}
            <span className="holo-text">architectural</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((item, i) => (
            <StatCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
