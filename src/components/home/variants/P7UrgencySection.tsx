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
export const P7UrgencySection: React.FC = () => {
  const { t } = useTranslation();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const eventDate = new Date('2026-11-25').getTime();
    const updateDays = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;
      const days = Math.ceil(distance / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, days));
    };
    updateDays();
    const interval = setInterval(updateDays, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const urgencyMetrics: UrgencyMetric[] = [
    {
      label: 'Jours restants',
      value: daysLeft,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400',
    },
    {
      label: 'Places disponibles',
      value: '45%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400',
    },
    {
      label: 'Exposants confirmés',
      value: '600+',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400',
    },
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
            <span className="text-sm font-semibold">DERNIÈRE CHANCE</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
            Ne manquez pas l'événement majeur du bâtiment
          </h2>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Les places se font rares. Inscrivez-vous maintenant pour garantir votre accès au SIB 2026 et à toutes les opportunités de networking et d'innovation.
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
                Pourquoi s'inscrire maintenant ?
              </h3>
              <ul className="space-y-4">
                {[
                  'Accès prioritaire aux meilleures zones du salon',
                  'Tarif préférentiel avant augmentation',
                  'Invitation au dîner du bâtiment (places limitées)',
                  'Matchmaking B2B personnalisé',
                  'Accès à l\'espace innovation et startups',
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <Zap className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right: CTA */}
            <div className="space-y-4">
              <Link to={ROUTES.VISITOR_SUBSCRIPTION} className="block">
                <Button variant="primary" size="lg" className="w-full group">
                  <Zap className="h-5 w-5 mr-2" />
                  S'inscrire maintenant (Visiteur)
                </Button>
              </Link>
              <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION} className="block">
                <Button variant="secondary" size="lg" className="w-full">
                  Devenir exposant
                </Button>
              </Link>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center pt-4">
                ⏰ Offre valable jusqu'au 31 octobre 2026
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default P7UrgencySection;
