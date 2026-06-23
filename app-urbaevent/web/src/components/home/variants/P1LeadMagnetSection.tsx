import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { DM } from '../../../design/designMasterTokens';
import { P1LeadMagnetForm } from './P1LeadMagnetForm';

const BULLET_KEYS = ['b1', 'b2', 'b3', 'b4'] as const;

/** P1 — Section lead magnet (guide SIB 2026) */
export const P1LeadMagnetSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${DM.navy} 0%, ${DM.navyDeep} 100%)` }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F39200]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-6"
              style={{ backgroundColor: `${DM.orange}22`, color: DM.orange }}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t('home.p1_lead.kicker')}
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              {t('home.p1_lead.title')}
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">{t('home.p1_lead.desc')}</p>
            <ul className="space-y-3">
              {BULLET_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-3 text-white/90 text-sm">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: DM.orange }}
                  />
                  {t(`home.p1_lead.${key}`)}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="dm-glass-light rounded-[32px] p-8 lg:p-10 border border-white/20"
          >
            <P1LeadMagnetForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default P1LeadMagnetSection;
