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
      color: 'bg-[#E7D192]/15 text-[#C9A84C]'
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
    <section className="py-28 bg-[#F8F9FA] relative overflow-hidden">
      {/* Fine ligne dorée en haut */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px]" style={{ background: 'rgba(231,209,146,0.4)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(231,209,146,0.04) 0%, transparent 65%)' }} />

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
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 rounded-sm" style={{ background: 'rgba(231,209,146,0.15)', border: '0.5px solid rgba(231,209,146,0.4)' }}>
                  <Building2 className="h-5 w-5" style={{ color: '#C9A84C' }} />
                </div>
                <span className="text-xs font-light tracking-[0.18em] uppercase" style={{ color: '#C9A84C' }}>{t('about.badge')}</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-light text-[#1A1A1A] mb-6" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                SIB 2026 — <span style={{ color: '#C9A84C' }}>{t('home.about_subtitle')}</span>
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
                <button className="luxury-btn group inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t('home.discover_exhibitors_btn')}
                </button>
              </Link>
              <Link to={ROUTES.PARTNERS}>
                <button className="inline-flex items-center gap-2 px-7 py-3 text-xs font-light tracking-[0.12em] uppercase rounded-sm transition-all duration-300 border text-[#1A1A1A] hover:border-[#E7D192] hover:text-[#C9A84C]" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                  <Users className="h-4 w-4" />
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
            <div className="relative z-10 rounded-sm p-8 text-white shadow-luxury"
              style={{ background: 'linear-gradient(135deg, #141414 0%, #0A0A0A 100%)', border: '0.5px solid rgba(231,209,146,0.2)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-sm" style={{ background: 'rgba(231,209,146,0.12)', border: '0.5px solid rgba(231,209,146,0.3)' }}>
                  <Building2 className="h-6 w-6" style={{ color: '#E7D192' }} />
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
                    className="text-center p-4 rounded-sm border"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(231,209,146,0.2)' }}
                  >
                    <div className="text-2xl font-light mb-1" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E7D192' }}>
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
          className="mt-20 text-center rounded-sm p-12 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #141414 100%)', border: '0.5px solid rgba(231,209,146,0.2)' }}
        >
          <div className="relative z-10">
          <h3 className="text-3xl font-light mb-4" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {t('about.cta_title')}
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            {t('about.cta_desc')}
          </p>
          <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
            <button className="luxury-btn group inline-flex items-center gap-2">
              {t('about.cta_button')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
