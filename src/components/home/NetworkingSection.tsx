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
    { number: '6,000+', labelKey: 'home.stats_professionals' },
    { number: '40', labelKey: 'home.stats_countries' },
    { number: '300+', labelKey: 'home.stats_exhibitors' },
    { number: '95%', labelKey: 'home.stats_satisfaction' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      {/* Moroccan Geometric Background */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-SIB-gold rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border-4 border-red-600 rotate-45 transform" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-green-600" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
        <div className="absolute bottom-10 right-1/3 w-36 h-36 border-4 border-SIB-gold rotate-12 transform" />
      </div>
      {/* Background Pattern */}
      <MoroccanPattern className="opacity-[0.03] text-SIB-primary" scale={1.5} />

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
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-SIB-primary p-2 rounded-lg">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <span className="text-SIB-primary font-semibold">{t('home.networking_label')}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {t('home.networking_title').split('bons').map((part, i) => (
                  i === 0 ? part : <span key={`part-${i}`} className="text-SIB-primary">bons{part}</span>
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
            <Card className="relative z-10 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center mb-6">
                <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Réseau BTP International
                </h3>
                <p className="text-gray-600">
                  Rejoignez une grande communauté de professionnels du bâtiment
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
                    className="text-center p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="text-2xl font-bold text-blue-600 mb-1">
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
          className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Prêt à développer votre réseau professionnel ?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Rejoignez dès maintenant la plateforme SIB et découvrez comment 
            l'intelligence artificielle peut transformer votre approche du réseautage.
          </p>
          <Link to={ROUTES.NETWORKING}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Découvrir le Réseautage
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
