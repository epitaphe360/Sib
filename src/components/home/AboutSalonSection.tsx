/**
 * Section "À propos du salon" sur la HomePage
 * Design SIB Bâtiment — navy/gold, pas maritime
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award,
  Globe,
  Users,
  TrendingUp,
  CalendarDays,
  MapPin,
  ArrowRight,
  Building2,
  HardHat,
  Landmark
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern } from '../ui/MoroccanDecor';

export const AboutSalonSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Award,
      title: t('about.excellence'),
      description: t('about.excellence_desc'),
      color: 'bg-sib-gold/20 text-sib-gold'
    },
    {
      icon: Globe,
      title: t('about.international'),
      description: t('about.international_desc'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Users,
      title: t('about.networking'),
      description: t('about.networking_desc'),
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      icon: TrendingUp,
      title: t('about.innovation'),
      description: t('about.innovation_desc'),
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const stats = [
    { number: '600+', label: t('about.exhibitors_stat') },
    { number: '50', label: t('about.countries_stat') },
    { number: '200 000+', label: t('about.visitors_stat') },
    { number: '5', label: t('about.days_stat') }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sib-gold/5 rounded-full -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-blue-600 font-semibold">{t('about.badge')}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                SIB 2026 — <span className="text-sib-gold">{t('home.about_subtitle')}</span>
              </h2>
              <p className="text-lg text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: t('about.desc1') }} />
              <p className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: t('about.desc2') }} />
              <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: t('about.desc3') }} />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={`feature-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.EXHIBITORS}>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  <Building2 className="h-5 w-5" />
                  {t('home.discover_exhibitors_btn')}
                </button>
              </Link>
              <Link to={ROUTES.PARTNERS}>
                <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  <Users className="h-5 w-5" />
                  {t('home.see_partners_btn')}
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative z-10 bg-blue-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-sib-gold p-3 rounded-xl">
                  <Building2 className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {t('about.card_title')}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {t('about.card_desc')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={`stat-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-4 bg-white/10 rounded-xl border border-white/20"
                  >
                    <div className="text-2xl font-bold text-sib-gold mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/70">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('about.dates', '25-29 Nov.')}</p>
                  <p className="text-xs text-gray-500">2026</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('about.location_city', 'El Jadida')}</p>
                  <p className="text-xs text-gray-500">{t('about.location_country', 'Maroc 🇲🇦')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden"
        >
          {/* Motif Zellige */}
          <MoroccanPattern className="opacity-[0.08] text-white" scale={1.2} />
          <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4">
            {t('about.cta_title')}
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            {t('about.cta_desc')}
          </p>
          <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-blue-900 rounded-xl font-semibold hover:bg-yellow-300 transition-colors">
              {t('about.cta_button')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
