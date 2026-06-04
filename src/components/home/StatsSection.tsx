import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { SALON_STATS } from '../../config/salonInfo';

const stats = [
  { value: SALON_STATS.exhibitors, labelKey: 'stats.exhibitors' },
  { value: SALON_STATS.visitors, labelKey: 'stats.visitors' },
  { value: SALON_STATS.countries, labelKey: 'stats.countries' },
  { value: SALON_STATS.conferences, labelKey: 'stats.conferences' },
];

/**
 * Bandeau chiffres clés — style BIG5 / CONSTRUMAT (grands nombres, fond sombre).
 */
export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="home-dark bg-[#001A3D] text-white border-y border-[#002654]">
      <div className="max-w-container mx-auto px-6 lg:px-8 py-12 lg:py-14">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center home-section-kicker mb-10 flex justify-center"
        >
          {t('home.stats_strip')}
        </motion.p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center lg:border-r lg:border-white/10 last:border-r-0 px-2"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight home-stats-value tabular-nums mb-2">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-white/80 font-semibold uppercase tracking-[0.12em]">
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
