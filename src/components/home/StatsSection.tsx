import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useInView } from 'framer-motion';

const GOLD = '#D4AF37';

interface StatItem {
  raw: number;
  display: string;
  suffix?: string;
  label: string;
  sublabel: string;
}

const STATS: StatItem[] = [
  { raw: 300, display: '300', suffix: '+', label: 'Exposants', sublabel: 'entreprises participantes' },
  { raw: 40,  display: '40',  suffix: '',  label: 'Pays',      sublabel: 'représentés dans le monde' },
  { raw: 6000,display: '6 000', suffix: '+', label: 'Professionnels', sublabel: 'visiteurs attendus' },
  { raw: 40,  display: '40',  suffix: '+', label: 'Conférences', sublabel: 'high level & ateliers' },
];

/* Compteur animé */
const Counter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('fr-FR'));
  const inView = useInView(ref, { once: true, margin: '-60px' });

  React.useEffect(() => {
    if (inView) {
      animate(count, target, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    }
  }, [inView, count, target]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Bande latérale dorée gauche */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}, transparent)` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-bold tracking-[0.25em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            SIB en Chiffres
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 uppercase tracking-wide">
            Une plateforme de référence
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: GOLD }} />
            <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>
        </motion.div>

        {/* Grille des stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-white px-6 py-10 sm:py-14 flex flex-col items-center text-center hover:bg-gray-50 transition-colors duration-300"
            >
              {/* Nombre */}
              <div
                className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-none mb-3 transition-colors duration-300 group-hover:text-[#B8960C]"
                style={{ color: '#1B365D' }}
              >
                <Counter target={stat.raw} suffix={stat.suffix} />
              </div>

              {/* Trait doré animé */}
              <div className="relative h-0.5 w-12 mb-3 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.3 }}
                  className="absolute inset-0 origin-left rounded-full"
                  style={{ background: GOLD }}
                />
              </div>

              {/* Label principal */}
              <p className="font-heading font-bold text-lg sm:text-xl text-gray-900 uppercase tracking-wide mb-1">
                {stat.label}
              </p>

              {/* Sous-label */}
              <p className="text-xs sm:text-sm text-gray-400 leading-snug">
                {stat.sublabel}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bandeau ligne événement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #0A1929 0%, #1B365D 100%)',
          }}
        >
          {[
            { icon: '📅', text: '25 – 29 Novembre 2026' },
            { icon: '📍', text: 'Parc d'Expo Mohammed VI · El Jadida' },
            { icon: '🏆', text: '40ème Édition' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white">
              <span className="text-base">{item.icon}</span>
              <span className="text-sm font-semibold tracking-wide">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
