import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import {
  Crown,
  Check,
  X,
  Calendar,
  Users,
  MessageCircle,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';

export default function VisitorUpgradePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isFree = user?.type === 'visitor' && (user.visitor_level === 'free' || !user.visitor_level);

  const freeFeatures = [
    { icon: Check, text: t('upgrade.free.badge'), included: true },
    { icon: Check, text: t('upgrade.free.exhibition'), included: true },
    { icon: Check, text: t('upgrade.free.publicConferences'), included: true },
    { icon: X, text: t('upgrade.free.b2bMeetings'), included: false },
    { icon: X, text: t('upgrade.free.unlimitedNetworking'), included: false },
    { icon: X, text: t('upgrade.free.exclusiveEvents'), included: false },
    { icon: X, text: t('upgrade.free.workshops'), included: false },
    { icon: X, text: t('upgrade.free.gala'), included: false },
  ];

  const vipFeatures = [
    { icon: Crown, text: t('upgrade.vip.premiumBadge'), included: true, highlight: true },
    { icon: Check, text: t('upgrade.vip.fullAccess'), included: true },
    { icon: Check, text: t('upgrade.vip.b2bRequests'), included: true, highlight: true },
    { icon: Check, text: t('upgrade.vip.unlimitedNetworking'), included: true },
    { icon: Check, text: t('upgrade.vip.inauguration'), included: true },
    { icon: Check, text: t('upgrade.vip.workshops'), included: true },
    { icon: Check, text: t('upgrade.vip.exclusiveGala'), included: true },
    { icon: Check, text: t('upgrade.vip.networkingLunches'), included: true },
    { icon: Check, text: t('upgrade.vip.vipConferences'), included: true },
    { icon: Check, text: t('upgrade.vip.privateLounge'), included: true },
  ];

  const testimonials = [
    {
      name: 'Ahmed Benali',
      role: 'Directeur Logistique, Port de Casablanca',
      content: t('upgrade.testimonial1.content'),
      avatar: '👤'
    },
    {
      name: 'Fatima El Amrani',
      role: 'CEO, Maritime Solutions',
      content: t('upgrade.testimonial2.content'),
      avatar: '👤'
    },
    {
      name: 'Jean-Pierre Dubois',
      role: 'Consultant Maritime',
      content: t('upgrade.testimonial3.content'),
      avatar: '👤'
    }
  ];

  const handleUpgrade = () => {
    navigate(ROUTES.VISITOR_PAYMENT);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Crown className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              {t('upgrade.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {t('upgrade.hero.subtitle')}
            </p>
            {isFree && (
              <div className="inline-block bg-yellow-400 text-blue-900 px-6 py-3 rounded-full font-bold text-lg">
                <Gift className="inline-block mr-2 h-5 w-5" />
                {t('upgrade.hero.launchOffer')}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* FREE Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-full border-2 border-gray-200 relative">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('upgrade.freeCard.title')}</h3>
                <div className="text-4xl font-extrabold text-gray-500">0€</div>
                <p className="text-gray-600 mt-2">{t('upgrade.freeCard.subtitle')}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {freeFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-start">
                    <feature.icon
                      className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                        feature.included ? 'text-green-500' : 'text-red-400'
                      }`}
                    />
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              {isFree && (
                <div className="text-center">
                  <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-semibold">
                    {t('upgrade.freeCard.currentPass')}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* VIP Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 h-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white relative shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg">
                  {t('upgrade.vipCard.recommended')}
                </div>
              </div>
              <div className="text-center mb-6 mt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                  <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                  {t('upgrade.vipCard.title')}
                </h3>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-2xl font-bold text-gray-400 line-through">950€</div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-600">300€</div>
                </div>
                <p className="text-gray-700 mt-2 font-semibold">{t('upgrade.vipCard.subtitle')}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {vipFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-start">
                    <feature.icon
                      className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                        feature.highlight ? 'text-yellow-500' : 'text-green-500'
                      }`}
                    />
                    <span className={`text-gray-900 ${feature.highlight ? 'font-semibold' : ''}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleUpgrade}
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold text-lg py-6 shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('upgrade.vipCard.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('upgrade.benefits.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('upgrade.benefits.b2bTitle')}</h3>
              <p className="text-gray-600">
                {t('upgrade.benefits.b2bDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('upgrade.benefits.networkTitle')}</h3>
              <p className="text-gray-600">
                {t('upgrade.benefits.networkDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('upgrade.benefits.badgeTitle')}</h3>
              <p className="text-gray-600">
                {t('upgrade.benefits.badgeDesc')}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('upgrade.testimonials.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * index }}
              >
                <Card className="p-6 h-full bg-white shadow-lg">
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROI Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-12 text-center"
        >
          <Zap className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl font-bold mb-4">{t('upgrade.roi.title')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('upgrade.roi.description') }} />
          <Button
            onClick={handleUpgrade}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-6"
          >
            <Crown className="mr-2 h-5 w-5" />
            {t('upgrade.roi.cta')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* FAQ Quick */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{t('upgrade.faq.title')}</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('upgrade.faq.q1')}</h3>
              <p className="text-gray-600">{t('upgrade.faq.a1')}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('upgrade.faq.q2')}</h3>
              <p className="text-gray-600">{t('upgrade.faq.a2')}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('upgrade.faq.q3')}</h3>
              <p className="text-gray-600">{t('upgrade.faq.a3')}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


