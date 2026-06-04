import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, ArrowRight, Ticket, Store } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

export const HomeVisitorExhibitSection: React.FC = () => {
  const { t } = useTranslation();

  const cards = [
    {
      icon: Users,
      titleKey: 'home.visit_card.title',
      descKey: 'home.visit_card.desc',
      bulletsKey: 'home.visit_card.bullets',
      ctaKey: 'home.visit_card.cta',
      href: '#badges',
      iconBg: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      CtaIcon: Ticket,
    },
    {
      icon: Building2,
      titleKey: 'home.exhibit_card.title',
      descKey: 'home.exhibit_card.desc',
      bulletsKey: 'home.exhibit_card.bullets',
      ctaKey: 'home.exhibit_card.cta',
      href: ROUTES.EXHIBITOR_SUBSCRIPTION,
      iconBg: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400',
      CtaIcon: Store,
    },
  ] as const;

  return (
    <section className="home-light py-20 lg:py-24 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="home-section-kicker mb-4 flex justify-center">{t('home.audience.kicker')}</div>
          <h2 className="home-section-title text-3xl lg:text-4xl tracking-tight">
            {t('home.audience.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const CtaIcon = card.CtaIcon;
            const bullets = t(card.bulletsKey).split('|');

            return (
              <motion.div
                key={card.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="home-card-lift flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 lg:p-10"
              >
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 ${card.iconBg}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                  {t(card.titleKey)}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 flex-grow">
                  {t(card.descKey)}
                </p>
                <ul className="space-y-2 mb-8">
                  {bullets.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-600 shrink-0" />
                      {item.trim()}
                    </li>
                  ))}
                </ul>
                {card.href.startsWith('#') ? (
                  <a href={card.href}>
                    <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                      <CtaIcon className="h-4 w-4 mr-1" />
                      {t(card.ctaKey)}
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                ) : (
                  <Link to={card.href}>
                    <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                      <CtaIcon className="h-4 w-4 mr-1" />
                      {t(card.ctaKey)}
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeVisitorExhibitSection;
