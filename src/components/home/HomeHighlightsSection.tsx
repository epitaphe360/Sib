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

const highlights = [
  { icon: Building2, titleKey: 'home.highlight.pavilions', descKey: 'home.highlight.pavilions_desc', to: ROUTES.PAVILIONS },
  { icon: Mic2, titleKey: 'home.highlight.conferences', descKey: 'home.highlight.conferences_desc', to: ROUTES.EVENTS },
  { icon: FlaskConical, titleKey: 'home.highlight.demo', descKey: 'home.highlight.demo_desc', to: ROUTES.PAVILIONS },
  { icon: Handshake, titleKey: 'home.highlight.b2b', descKey: 'home.highlight.b2b_desc', to: ROUTES.NETWORKING },
] as const;

export const HomeHighlightsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="home-dark py-20 lg:py-24 bg-[#001530] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(69,152,209,0.15),_transparent_55%)] pointer-events-none" />
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="home-section-kicker mb-4 flex justify-center">
            {t('home.highlights.kicker')}
          </div>
          <h2 className="text-white text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
            {t('home.highlights.title')}
          </h2>
          <p className="text-white/75 leading-relaxed">{t('home.highlights.desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={item.to}
                  className="home-card-lift group flex flex-col h-full p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Icon className="h-8 w-8 text-accent-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white text-lg font-bold mb-2 tracking-tight">{t(item.titleKey)}</h3>
                  <p className="text-sm text-white/70 leading-relaxed flex-grow mb-4">
                    {t(item.descKey)}
                  </p>
                  <span className="inline-flex items-center text-sm font-semibold text-accent-400 group-hover:text-white transition-colors">
                    {t('home.highlights.learn_more')}
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
