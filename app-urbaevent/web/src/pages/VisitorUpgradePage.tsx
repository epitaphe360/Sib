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
      role: 'Directeur Logistique, Bâtiment de Casablanca',
      content: t('upgrade.testimonial1.content'),
      avatar: '👤'
    },
    {
      name: 'Fatima El Amrani',
      role: 'CEO, Building Solutions',
      content: t('upgrade.testimonial2.content'),
      avatar: '👤'
    },
    {
      name: 'Jean-Pierre Dubois',
      role: 'Consultant BTP',
      content: t('upgrade.testimonial3.content'),
      avatar: '👤'
    }
  ];

  const handleUpgrade = () => {
    navigate(ROUTES.VISITOR_PAYMENT);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-primary-900 text-white py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
        </div>
        <div className="relative max-w-container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Crown className="h-6 w-6 text-accent-500" />
            </div>
            <div className="sib-kicker mb-4 justify-center !text-accent-500">Pass VIP</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight leading-[1.05]">
              {t('upgrade.hero.title')}
            </h1>
            <p className="text-base lg:text-lg text-white/75 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('upgrade.hero.subtitle')}
            </p>
            {isFree && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-500 text-primary-900 font-semibold shadow-md">
                <Gift className="h-4 w-4" />
                {t('upgrade.hero.launchOffer')}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="max-w-container mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* FREE Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 h-full relative">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  {t('upgrade.freeCard.title')}
                </h3>
                <div className="text-4xl font-bold text-neutral-900 dark:text-white tabular-nums">0€</div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{t('upgrade.freeCard.subtitle')}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-start text-sm">
                    <feature.icon
                      className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${
                        feature.included ? 'text-success-500' : 'text-danger-400'
                      }`}
                    />
                    <span className={feature.included ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              {isFree && (
                <div className="text-center">
                  <div className="inline-block bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    {t('upgrade.freeCard.currentPass')}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* VIP Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border-2 border-accent-500 p-8 h-full shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-accent-500 text-primary-900 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md">
                  {t('upgrade.vipCard.recommended')}
                </div>
              </div>
              <div className="text-center mb-6 mt-2">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center justify-center tracking-tight">
                  <Crown className="h-5 w-5 mr-2 text-accent-500" />
                  {t('upgrade.vipCard.title')}
                </h3>
                <div className="flex items-baseline justify-center gap-3">
                  <div className="text-xl font-semibold text-neutral-400 line-through tabular-nums">950€</div>
                  <div className="text-4xl lg:text-5xl font-bold text-accent-600 dark:text-accent-500 tabular-nums">300€</div>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2 font-medium">
                  {t('upgrade.vipCard.subtitle')}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {vipFeatures.map((feature) => (
                  <li key={feature.text} className="flex items-start text-sm">
                    <feature.icon
                      className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${
                        feature.highlight ? 'text-accent-500' : 'text-success-500'
                      }`}
                    />
                    <span className={`text-neutral-800 dark:text-neutral-200 ${feature.highlight ? 'font-semibold' : ''}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleUpgrade} variant="accent" size="lg" className="w-full">
                <Sparkles className="mr-1 h-4 w-4" />
                {t('upgrade.vipCard.cta')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="sib-kicker mb-3 justify-center">Avantages</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('upgrade.benefits.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { Icon: Calendar, title: t('upgrade.benefits.b2bTitle'), desc: t('upgrade.benefits.b2bDesc'), delay: 0.4 },
              { Icon: Users, title: t('upgrade.benefits.networkTitle'), desc: t('upgrade.benefits.networkDesc'), delay: 0.5 },
              { Icon: Shield, title: t('upgrade.benefits.badgeTitle'), desc: t('upgrade.benefits.badgeDesc'), delay: 0.6 },
            ].map(({ Icon, title, desc, delay }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="sib-kicker mb-3 justify-center">Témoignages</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('upgrade.testimonials.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 * index }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full"
              >
                <div className="text-3xl mb-3">{testimonial.avatar}</div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-5 italic leading-relaxed">
                  « {testimonial.content} »
                </p>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">{testimonial.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROI CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative overflow-hidden rounded-2xl p-10 lg:p-14 bg-gradient-to-br from-primary-900 to-primary-700 border border-primary-800 text-white text-center"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="h-14 w-14 mx-auto mb-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Zap className="h-6 w-6 text-accent-500" />
            </div>
            <div className="sib-kicker mb-3 justify-center !text-accent-500">ROI</div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">{t('upgrade.roi.title')}</h2>
            <p
              className="text-white/80 mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t('upgrade.roi.description') }}
            />
            <Button onClick={handleUpgrade} variant="accent" size="lg">
              <Crown className="mr-1 h-4 w-4" />
              {t('upgrade.roi.cta')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="sib-kicker mb-3 justify-center">FAQ</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('upgrade.faq.title')}
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { q: t('upgrade.faq.q1'), a: t('upgrade.faq.a1') },
              { q: t('upgrade.faq.q2'), a: t('upgrade.faq.a2') },
              { q: t('upgrade.faq.q3'), a: t('upgrade.faq.a3') },
            ].map((row) => (
              <div
                key={row.q}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 tracking-tight">{row.q}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{row.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



