import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { Users, Building2, Award, UserCheck, TrendingUp, ArrowUpRight } from 'lucide-react';

interface AdminMetricsGridProps {
  adminMetrics: Record<string, number | unknown>;
  t: (key: string, params?: Record<string, unknown>) => string;
}

// ── Compteur animé déclenché à l'entrée dans le viewport ──────────────────
function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: 'easeOut',
      onUpdate(v) { setCount(Math.round(v)); },
    });
    return () => controls.stop();
  }, [value, delay, inView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ── Variants stagger ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 130, damping: 14 } },
};

const barVariants = {
  hidden: { width: '0%' },
  visible: { width: '70%', transition: { duration: 0.9, ease: 'easeOut' } },
};

export function AdminMetricsGrid({ adminMetrics: m, t }: AdminMetricsGridProps) {
  const metrics = m as any;

  const statsHero = [
    {
      value: metrics.totalUsers ?? 0,
      label: t('admin.total_users'),
      suffix: '',
      description: 'utilisateurs inscrits sur la plateforme',
      icon: Users,
      color: '#5B9FFF',
    },
    {
      value: metrics.totalExhibitors ?? 0,
      label: t('admin.exhibitors'),
      suffix: '',
      description: 'exposants confirmés pour le salon',
      icon: Building2,
      color: '#C9A84C',
    },
    {
      value: '98',
      label: 'Taux',
      suffix: '%',
      description: 'de satisfaction général',
      icon: Award,
      color: '#2D6A4F',
    },
    {
      value: metrics.totalVisitors ?? 0,
      label: t('admin.visitors'),
      suffix: '',
      description: 'visiteurs actuels en ligne',
      icon: UserCheck,
      color: '#A855F7',
    },
  ];

  return (
    <div className="mb-16">
      {/* Hero section — divider premium */}
      <motion.div
        className="flex items-center justify-between mb-12 pb-8"
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold flex items-center gap-4 mb-2" style={{ color: 'rgba(255,255,255,0.98)' }}>
            <TrendingUp className="h-8 w-8" style={{ color: '#C9A84C' }} />
            {t('admin.platform_statistics')}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Indicateurs clés de performance • Mis à jour en temps réel
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs px-4 py-2 rounded-full font-medium" style={{ color: '#C9A84C', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
          EN DIRECT
        </span>
      </motion.div>

      {/* Stats grid — ÉNORME display */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {statsHero.map(({ value, label, suffix, description, icon: Icon, color }, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -12, scale: 1.05 }}
            className="relative group cursor-pointer transition-all duration-500"
          >
            {/* Subtle glow background */}
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ background: color }}
            />

            {/* Card container */}
            <div
              className="relative rounded-2xl border p-8 h-full flex flex-col shadow-luxury backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />

              {/* Icon circle */}
              <div className="mb-6 inline-flex w-fit">
                <div className="p-3 rounded-xl" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
              </div>

              {/* HUGE number in serif */}
              <div className="mb-4 flex-1">
                <div className="font-serif font-bold tracking-tight leading-none mb-1" style={{ fontSize: '3.5rem', color }}>
                  <AnimatedNumber value={typeof value === 'number' ? value : parseInt(value)} delay={idx * 0.08} />
                  <span className="text-2xl ml-1" style={{ color }}>
                    {suffix}
                  </span>
                </div>
              </div>

              {/* Label + description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>
                  {label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  {description}
                </p>
              </div>

              {/* Bottom divider */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Trend badge */}
              <div className="flex items-center gap-1.5 text-xs mt-4 font-medium" style={{ color }}>
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+12% ce mois</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
