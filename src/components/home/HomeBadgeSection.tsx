import React from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { HeroBadgeForms } from './HeroBadgeForms';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Inscription badge — section dédiée (hors hero), comme billetterie BATIMAT / BIG5.
 */
export const HomeBadgeSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      id="badges"
      className="home-light scroll-mt-28 py-20 lg:py-24 bg-white dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-800"
    >
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Ticket className="h-3.5 w-3.5" />
            {t('home.badges.kicker')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            {t('home.badges.title')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('home.badges.desc')}
          </p>
        </motion.div>

        <HeroBadgeForms inTicketSection />
      </div>
    </section>
  );
};

export default HomeBadgeSection;
