import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import { DM } from '../../../design/designMasterTokens';
import { MasterBentoGrid, MasterGlassCard } from './MasterGlassCard';
import { MasterScrollReveal } from './MasterScrollReveal';
import type { MasterHeroVariant } from '../../../config/masterHomeConfig';

const STAT_KEYS = [
  { valueKey: 'mockup.stats.exhibitors_value', labelKey: 'mockup.stats.exhibitors_label' },
  { valueKey: 'mockup.stats.visitors_value', labelKey: 'mockup.stats.visitors_label' },
  { valueKey: 'mockup.stats.countries_value', labelKey: 'mockup.stats.countries_label' },
  { valueKey: 'mockup.stats.history_value', labelKey: 'mockup.stats.history_label' },
] as const;

interface MasterStatsBentoProps {
  variant: MasterHeroVariant;
}

export const MasterStatsBento: React.FC<MasterStatsBentoProps> = ({ variant }) => {
  const { t } = useTranslation();
  const dark = variant === 'glass' || variant === 'split';

  return (
    <section
      className="relative py-16 lg:py-20"
      style={{ backgroundColor: dark ? DM.navy : '#ECECE8' }}
    >
      <div className="dm-container">
        <MasterBentoGrid cols={4}>
          {STAT_KEYS.map(({ valueKey, labelKey }, i) => (
            <MasterScrollReveal key={valueKey} delay={i * 0.08}>
              <MasterGlassCard light={!dark} className="p-8 text-center">
                <motion.p
                  className="dm-display text-4xl lg:text-5xl font-black mb-2"
                  style={{ color: dark ? DM.orange : DM.navy }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...DM.spring, delay: i * 0.06 }}
                >
                  {t(valueKey)}
                </motion.p>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,26,61,0.6)' }}
                >
                  {t(labelKey)}
                </p>
              </MasterGlassCard>
            </MasterScrollReveal>
          ))}
        </MasterBentoGrid>
      </div>
    </section>
  );
};
