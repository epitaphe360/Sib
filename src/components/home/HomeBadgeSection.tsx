import React from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { HeroBadgeForms } from './HeroBadgeForms';
import { useTranslation } from '../../hooks/useTranslation';
import { DM } from '../../design/designMasterTokens';

interface HomeBadgeSectionProps {
  className?: string;
}

/**
 * Billetterie SIB 2026 — cartes premium, formulaires sur pages dédiées.
 */
export const HomeBadgeSection: React.FC<HomeBadgeSectionProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <section
      id="badges"
      className={`scroll-mt-28 py-20 lg:py-28 relative overflow-hidden ${className}`.trim()}
      style={{ backgroundColor: '#ECECE8' }}
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${DM.orange}22, transparent 55%)`,
        }}
      />
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-5"
            style={{ backgroundColor: `${DM.navy}12`, color: DM.navy }}
          >
            <Ticket className="h-3.5 w-3.5" style={{ color: DM.orange }} />
            {t('home.badges.kicker')}
          </div>
          <h2
            className="text-3xl lg:text-4xl font-black tracking-tight mb-4"
            style={{ color: DM.navy }}
          >
            {t('home.badges.title')}
          </h2>
          <p className="text-[#001A3D]/65 leading-relaxed text-base">
            {t('home.badges.desc')}
          </p>
        </motion.div>

        <HeroBadgeForms />
      </div>
    </section>
  );
};

export default HomeBadgeSection;
