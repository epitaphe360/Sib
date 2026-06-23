import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { Link } from 'react-router-dom';

interface UrgencyMetric {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

/**
 * P7 — Urgency Section
 * Section créant un sentiment d'urgence et de FOMO (Fear Of Missing Out)
 */
/** Calcule le % de stands déjà réservés — monte de 38% à 92% sur 365j avant l'événement */
function computeSeatsReserved(eventDate: Date): string {
  const now = new Date();
  const totalMs = 365 * 24 * 60 * 60 * 1000;
  const elapsed = eventDate.getTime() - totalMs - now.getTime();
  const progress = Math.min(1, Math.max(0, -elapsed / totalMs));
  const pct = Math.round(38 + progress * 54);
  return `${pct}%`;
}

export const P7UrgencySection: React.FC = () => {
  const { t } = useTranslation();
  const EVENT_DATE = new Date('2026-11-25');
  const [daysLeft, setDaysLeft] = useState(0);
  const [seatsReserved, setSeatsReserved] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const distance = EVENT_DATE.getTime() - now;
      setDaysLeft(Math.max(0, Math.ceil(distance / (1000 * 60 * 60 * 24))));
      setSeatsReserved(computeSeatsReserved(EVENT_DATE));
    };
    update();
    const interval = setInterval(update, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const urgencyMetrics: UrgencyMetric[] = [
    {
      label: t('home.p7_urgency.metric_days'),
      value: daysLeft,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400',
    },
    {
      label: t('home.p7_urgency.metric_seats'),
      value: seatsReserved,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400',
    },
    {
      label: t('home.p7_urgency.metric_exhibitors'),
      value: '+600',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400',
    },
  ];

  const benefitKeys = [
    'home.p7_urgency.benefit_1',
    'home.p7_urgency.benefit_2',
    'home.p7_urgency.benefit_3',
    'home.p7_urgency.benefit_4',
    'home.p7_urgency.benefit_5',
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-danger-50/50 dark:from-danger-500/5 to-transparent overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-danger-200/20 dark:from-danger-500/10 to-transparent"
        />
      </div>

      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-danger-100 dark:bg-danger-500/20 text-danger-700 dark:text-danger-300 mb-6">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">{t('home.p7_urgency.badge')}</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
            {t('home.p7_urgency.title')}
          </h2>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            {t('home.p7_urgency.desc')}
          </p>
        </motion.div>

        {/* Urgency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {urgencyMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-6 ${metric.color} border border-current/10`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold uppercase tracking-wider opacity-75">
                  {metric.label}
                </span>
                {metric.icon}
              </div>
              <p className="text-4xl font-bold">{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-8 lg:p-12 shadow-xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Benefits */}
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                {t('home.p7_urgency.why_title')}
              </h3>
              <ul className="space-y-4">
                {benefitKeys.map((benefitKey, index) => (
                  <motion.li
                    key={benefitKey}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <Zap className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-300">{t(benefitKey)}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right: CTA */}
            <div className="space-y-4">
              <Link to={ROUTES.VISITOR_SUBSCRIPTION} className="block">
                <Button variant="primary" size="lg" className="w-full group">
                  <Zap className="h-5 w-5 mr-2" />
                  {t('home.p7_urgency.cta_visitor')}
                </Button>
              </Link>
              <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION} className="block">
                <Button variant="secondary" size="lg" className="w-full">
                  {t('home.p7_urgency.cta_exhibitor')}
                </Button>
              </Link>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center pt-4">
                {t('home.p7_urgency.deadline')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default P7UrgencySection;
