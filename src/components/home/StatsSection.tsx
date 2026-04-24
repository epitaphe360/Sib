import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, Mic2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * SIB 2026 — StatsSection
 * Ligne de 4 statistiques clés, fond clair, typographie dominante.
 */
const stats = [
  { icon: Building2, value: '300+',    labelKey: 'stats.exhibitors'  },
  { icon: Users,     value: '6 000+',  labelKey: 'stats.visitors'    },
  { icon: Globe,     value: '40',      labelKey: 'stats.countries'   },
  { icon: Mic2,      value: '40+',     labelKey: 'stats.conferences' },
];

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 lg:py-24 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="sib-kicker mb-4">En chiffres</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Le rendez-vous incontournable du BTP au Maroc
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative bg-white dark:bg-neutral-900 p-8 lg:p-10 transition-all duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none mb-2 tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {t(stat.labelKey) || stat.labelKey.split('.')[1]}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
