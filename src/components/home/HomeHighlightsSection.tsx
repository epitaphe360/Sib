import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Mic2,
  FlaskConical,
  Handshake,
  ArrowRight,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { DM } from '../../design/designMasterTokens';

const highlights = [
  { icon: Building2, titleKey: 'home.highlight.pavilions', descKey: 'home.highlight.pavilions_desc', to: ROUTES.PAVILIONS },
  { icon: Mic2, titleKey: 'home.highlight.conferences', descKey: 'home.highlight.conferences_desc', to: ROUTES.EVENTS },
  { icon: FlaskConical, titleKey: 'home.highlight.demo', descKey: 'home.highlight.demo_desc', to: ROUTES.PAVILIONS },
  { icon: Handshake, titleKey: 'home.highlight.b2b', descKey: 'home.highlight.b2b_desc', to: ROUTES.NETWORKING },
] as const;

export const HomeHighlightsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: `linear-gradient(165deg, ${DM.navyDeep} 0%, ${DM.navy} 100%)` }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 80% 0%, ${DM.orange}22, transparent 50%)`,
        }}
      />
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: DM.orange }}
          >
            {t('home.highlights.kicker')}
          </p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-4">
            {t('home.highlights.title')}
          </h2>
          <p className="text-white/70 leading-relaxed">{t('home.highlights.desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...DM.springSoft, delay: index * 0.08 }}
                whileHover={{ scale: DM.hoverScale }}
              >
                <Link
                  to={item.to}
                  className="group flex flex-col h-full p-8 rounded-[32px] dm-glass border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${DM.orange}22`, color: DM.orange }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-white text-lg font-black mb-2 tracking-tight">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-sm text-white/65 leading-relaxed flex-grow mb-5">
                    {t(item.descKey)}
                  </p>
                  <span
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider group-hover:gap-2 gap-1 transition-all"
                    style={{ color: DM.orange }}
                  >
                    {t('home.highlights.learn_more')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeHighlightsSection;
