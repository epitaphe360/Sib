import React from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  Calendar,
  Brain,
  Globe,
  ArrowRight,
  Zap,
  Target,
  Network
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern } from '../ui/MoroccanDecor';

export const NetworkingSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: 'home.feature_matching',
      descKey: 'home.feature_matching_desc',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: MessageCircle,
      titleKey: 'home.feature_chat',
      descKey: 'home.feature_chat_desc',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Calendar,
      titleKey: 'home.feature_appointments',
      descKey: 'home.feature_appointments_desc',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Globe,
      titleKey: 'home.feature_global',
      descKey: 'home.feature_global_desc',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const stats = [
    { number: '200,000+', labelKey: 'home.stats_professionals' },
    { number: '50', labelKey: 'home.stats_countries' },
    { number: '600+', labelKey: 'home.stats_exhibitors' },
    { number: '95%', labelKey: 'home.stats_satisfaction' }
  ];

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Fine ligne en haut */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px]" style={{ background: 'rgba(231,209,146,0.4)' }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(231,209,146,1) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 rounded-sm" style={{ background: 'rgba(231,209,146,0.12)', border: '0.5px solid rgba(231,209,146,0.35)' }}>
                  <Network className="h-5 w-5" style={{ color: '#C9A84C' }} />
                </div>
                <span className="text-xs font-light tracking-[0.18em] uppercase" style={{ color: '#C9A84C' }}>{t('home.networking_label')}</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-light text-[#1A1A1A] mb-6" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                {t('home.networking_title').split('bons').map((part, i) => (
                  i === 0 ? part : <span key={`part-${i}`} style={{ color: '#C9A84C' }}>bons{part}</span>
                ))}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('home.networking_desc')}
              </p>
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
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.NETWORKING}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Zap className="mr-2 h-5 w-5" />
                  {t('home.cta_networking')}
                </Button>
              </Link>
              <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Target className="mr-2 h-5 w-5" />
                  {t('home.cta_member')}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => {
                  toast.info(t('home.ai_assistant_toast'));
                }}
              >
                <Brain className="mr-2 h-5 w-5" />
                {t('home.ai_assistant')}
              </Button>
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
              <Card className="relative z-10 rounded-sm" style={{ border: '0.5px solid rgba(231,209,146,0.25)', background: '#FAFAFA' }}>
              <div className="text-center mb-6">
                <div className="p-4 rounded-sm w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(231,209,146,0.1)', border: '0.5px solid rgba(231,209,146,0.3)' }}>
                  <Users className="h-7 w-7" style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Réseau Professionnel BTP
                </h3>
                <p className="text-gray-600">
                  Rejoignez la plus grande communauté de professionnels du bâtiment
                </p>
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
                    className="text-center p-4 bg-white rounded-sm"
                    style={{ border: '0.5px solid rgba(231,209,146,0.2)' }}
                  >
                    <div className="text-2xl font-light mb-1" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#1A1A1A' }}>
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t(stat.labelKey)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Chat IA</p>
                  <p className="text-xs text-gray-500">Assistant 24/7</p>
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
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Matching IA</p>
                  <p className="text-xs text-gray-500">Recommandations</p>
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
          className="mt-16 text-center bg-blue-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Prêt à développer votre réseau professionnel ?
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Rejoignez dès maintenant la plateforme SIB et découvrez comment
            l'intelligence artificielle peut transformer votre approche du réseautage.
          </p>
          <Link to={ROUTES.NETWORKING}>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-blue-900 rounded-xl font-semibold hover:bg-yellow-300 transition-colors">
              Découvrir le Réseautage
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};