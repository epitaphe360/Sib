import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Mic2, Network, Ticket } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

/** Trois parcours — cartes éditoriales sur fond clair */
export const HomeWorldClassPillars: React.FC = () => {
  const { t } = useTranslation();

  const pillars = [
    {
      num: '01',
      icon: Ticket,
      title: t('home.world7.card_visit_title'),
      desc: t('home.world7.card_visit_desc'),
      href: '#badges',
      cta: t('hero.cta.ticket'),
      external: true,
    },
    {
      num: '02',
      icon: Building2,
      title: t('home.world7.card_exhibit_title'),
      desc: t('home.world7.card_exhibit_desc'),
      href: ROUTES.EXHIBITOR_SUBSCRIPTION,
      cta: t('hero.cta.exhibitor'),
    },
    {
      num: '03',
      icon: Network,
      title: t('home.world7.card_network_title'),
      desc: t('home.world7.card_network_desc'),
      href: ROUTES.NETWORKING,
      cta: t('home.world7.explore'),
    },
  ];

  return (
    <section id="world7-journey" className="scroll-mt-28 relative bg-neutral-50 dark:bg-neutral-950 py-20 lg:py-28">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="sib-kicker mb-4">{t('home.world7.bento_kicker')}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
              {t('home.world7.bento_title')}
            </h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md leading-relaxed lg:text-right">
            {t('home.world7.bento_desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const inner = (
              <motion.article
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="group relative flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-400"
              >
                <span className="text-[4rem] font-bold leading-none text-primary-100 dark:text-primary-900/80 absolute top-6 right-8 select-none pointer-events-none">
                  {p.num}
                </span>
                <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 pr-12">{p.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed flex-1 mb-8">{p.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider group-hover:gap-3 transition-all">
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </motion.article>
            );

            if (p.external) {
              return (
                <a key={p.num} href={p.href} className="block h-full">
                  {inner}
                </a>
              );
            }
            return (
              <Link key={p.num} to={p.href} className="block h-full">
                {inner}
              </Link>
            );
          })}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary-900 text-white px-8 py-6 lg:px-10 lg:py-8"
        >
          <div className="flex items-center gap-4">
            <Mic2 className="h-8 w-8 text-[#BAD2E8] shrink-0" />
            <div>
              <p className="font-bold text-lg">{t('home.world7.card_conf_title')}</p>
              <p className="text-sm text-white/70">{t('home.world7.card_conf_desc')}</p>
            </div>
          </div>
          <Link
            to={ROUTES.EVENTS}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#BAD2E8] hover:text-white transition-colors"
          >
            {t('home.world7.explore')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeWorldClassPillars;
