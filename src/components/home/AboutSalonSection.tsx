/**
 * SIB 2026 — AboutSalonSection
 * Style epure, photo 4K, cartes features sobres, CTA raffine.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award,
  Globe,
  Users,
  TrendingUp,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { IMAGES } from '../../lib/images';

export const AboutSalonSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Award,      title: t('about.excellence'),     description: t('about.excellence_desc') },
    { icon: Globe,      title: t('about.international'),  description: t('about.international_desc') },
    { icon: Users,      title: t('about.networking'),     description: t('about.networking_desc') },
    { icon: TrendingUp, title: t('about.innovation'),     description: t('about.innovation_desc') },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Colonne gauche — texte */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="sib-kicker mb-4">{t('about.badge') || 'À propos'}</div>
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white leading-tight tracking-tight mb-6">
              {t('home.about_subtitle') || (
                <>
                  Le hub incontournable<br />
                  du BTP <span className="sib-text-gradient">en Afrique</span>
                </>
              )}
            </h2>

            <div className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10 text-[15px]">
              <p dangerouslySetInnerHTML={{ __html: t('about.desc1') }} />
              <p dangerouslySetInnerHTML={{ __html: t('about.desc2') }} />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center transition-all duration-300 group-hover:bg-primary-600 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={ROUTES.EXHIBITORS}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                  <Building2 className="mr-1 h-4 w-4" />
                  {t('home.discover_exhibitors_btn')}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={ROUTES.PARTNERS}>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Users className="mr-1 h-4 w-4" />
                  {t('home.see_partners_btn')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Colonne droite — visuel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            {/* Photo principale */}
            <SmartImage
              source={IMAGES.hero.architecture}
              aspect="4/5"
              rounded="2xl"
              className="shadow-xl"
              overlay="bottom"
            >
              <div className="text-white">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-500 mb-2">
                  El Jadida · Maroc
                </p>
                <p className="text-2xl font-semibold leading-tight max-w-xs">
                  Un cadre d'exception pour l'élite du bâtiment
                </p>
              </div>
            </SmartImage>

            {/* Carte flottante — dates */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -left-4 md:-left-8 top-8 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3 max-w-[220px]"
            >
              <div className="h-11 w-11 rounded-lg bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-accent-600 dark:text-accent-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Rendez-vous
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                  25-29 Nov. 2026
                </p>
              </div>
            </motion.div>

            {/* Carte flottante — lieu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              viewport={{ once: true }}
              className="absolute -right-4 md:-right-8 bottom-24 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3 max-w-[220px]"
            >
              <div className="h-11 w-11 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Centre
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                  Mohammed VI Exhibition
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 relative overflow-hidden rounded-2xl p-10 lg:p-14"
        >
          {/* Fond avec photo 4K */}
          <div className="absolute inset-0 -z-10">
            <SmartImage
              source={IMAGES.business.handshake}
              aspect="auto"
              rounded="2xl"
              className="h-full"
              imgClassName="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/90 to-primary-700/85" />
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto text-white">
            <div className="sib-kicker mb-4 !text-accent-500">Rejoignez-nous</div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">
              {t('about.cta_title')}
            </h3>
            <p className="text-white/80 mb-8 leading-relaxed">
              {t('about.cta_desc')}
            </p>
            <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
              <Button variant="accent" size="lg" className="group">
                {t('about.cta_button')}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
