import React from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Calendar,
  Brain,
  Globe,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { IMAGES } from '../../lib/images';

/**
 * SIB 2026 — NetworkingSection
 * Section raffinee mettant en avant l'IA networking et les rencontres B2B.
 */
export const NetworkingSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Brain,         titleKey: 'home.feature_matching',     descKey: 'home.feature_matching_desc' },
    { icon: MessageCircle, titleKey: 'home.feature_chat',         descKey: 'home.feature_chat_desc' },
    { icon: Calendar,      titleKey: 'home.feature_appointments', descKey: 'home.feature_appointments_desc' },
    { icon: Globe,         titleKey: 'home.feature_global',       descKey: 'home.feature_global_desc' },
  ];

  const stats = [
    { number: '6 000+', labelKey: 'home.stats_professionals' },
    { number: '40',     labelKey: 'home.stats_countries' },
    { number: '300+',   labelKey: 'home.stats_exhibitors' },
    { number: '95%',    labelKey: 'home.stats_satisfaction' },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Visuel (gauche sur desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative order-2 lg:order-1"
          >
            <SmartImage
              source={IMAGES.business.meeting}
              aspect="5/6"
              rounded="2xl"
              className="shadow-xl"
              overlay="bottom"
            >
              <div className="text-white">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-500 mb-2">
                  Matching IA Avancé
                </p>
                <p className="text-2xl font-semibold leading-tight max-w-xs">
                  Rencontrez les bonnes personnes
                </p>
              </div>
            </SmartImage>

            {/* Carte stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -right-4 md:-right-10 top-10 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-5 grid grid-cols-2 gap-4 max-w-[260px]"
            >
              {stats.slice(0, 4).map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <div className="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums leading-none mb-1">
                    {stat.number}
                  </div>
                  <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    {t(stat.labelKey)}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Carte flottante chat */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              viewport={{ once: true }}
              className="absolute -left-4 md:-left-8 bottom-20 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3 max-w-[220px]"
            >
              <div className="h-11 w-11 rounded-lg bg-success-50 dark:bg-success-500/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-success-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Chat IA
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                  Assistant disponible 24/7
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Texte (droite sur desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-100px' }}
            className="order-1 lg:order-2"
          >
            <div className="sib-kicker mb-4">{t('home.networking_label') || 'Networking IA'}</div>
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.05] mb-6">
              Connectez-vous aux{' '}
              <span className="sib-text-gradient">bons professionnels</span>
            </h2>
            <p className="text-[15px] lg:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10 max-w-xl">
              {t('home.networking_desc')}
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.titleKey}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center transition-all duration-300 group-hover:bg-primary-600 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 tracking-tight">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {t(feature.descKey)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Link to={ROUTES.NETWORKING}>
                <Button variant="primary" size="lg" className="group">
                  <Zap className="mr-1 h-4 w-4" />
                  {t('home.cta_networking')}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
                <Button variant="secondary" size="lg">
                  <Target className="mr-1 h-4 w-4" />
                  {t('home.cta_member')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => toast.info(t('home.ai_assistant_toast'))}
              >
                <Brain className="mr-1 h-4 w-4" />
                {t('home.ai_assistant')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
