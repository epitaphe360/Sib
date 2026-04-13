import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Check, X, Crown, Zap, Star, Award, 
  Building2, Globe, Users, GraduationCap, Landmark,
  Hammer, Cog, BookOpen, Palette, ArrowRight,
  MapPin, CalendarDays, Clock, CreditCard,
  Lightbulb, MessageCircle, Ticket, Mail,
  Phone, Sparkles, Shield, Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../lib/routes';
import { motion } from 'framer-motion';
import { MoroccanPattern } from '../components/ui/MoroccanDecor';

// Types
interface SubscriptionFeature {
  name: string;
  included: boolean;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  icon: React.ReactNode;
  description: string;
  type: 'visitor' | 'partner' | 'exhibitor';
  level: string;
  features: SubscriptionFeature[];
  benefits: string[];
  cta: string;
  color: string;
}

function getSubscriptionTiers(t: (key: string) => string): SubscriptionTier[] {
  return [
  // VISITOR SUBSCRIPTIONS
  {
    id: 'visitor-free',
    name: t('sub.visitorFree.name'),
    price: 0,
    currency: 'EUR',
    icon: <Zap className="w-8 h-8" />,
    description: t('sub.visitorFree.desc'),
    type: 'visitor',
    level: 'free',
    features: [
      { name: t('sub.visitorFree.f1'), included: true },
      { name: t('sub.visitorFree.f2'), included: true },
      { name: t('sub.visitorFree.f3'), included: false },
      { name: t('sub.visitorFree.f4'), included: false },
      { name: t('sub.visitorFree.f5'), included: true },
      { name: t('sub.visitorFree.f6'), included: true },
    ],
    benefits: [
      t('sub.visitorFree.b1'),
      t('sub.visitorFree.b2'),
      t('sub.visitorFree.b3'),
      t('sub.visitorFree.b4'),
    ],
    cta: t('sub.visitorFree.cta'),
    color: 'bg-gray-50',
  },
  {
    id: 'visitor-vip',
    name: t('sub.visitorVip.name'),
    price: 700,
    currency: 'EUR',
    icon: <Crown className="w-8 h-8" />,
    description: t('sub.visitorVip.desc'),
    type: 'visitor',
    level: 'premium',
    features: [
      { name: t('sub.visitorVip.f1'), included: true },
      { name: t('sub.visitorVip.f2'), included: true },
      { name: t('sub.visitorVip.f3'), included: true },
      { name: t('sub.visitorVip.f4'), included: true },
      { name: t('sub.visitorVip.f5'), included: true },
      { name: t('sub.visitorVip.f6'), included: true },
      { name: t('sub.visitorVip.f7'), included: true },
      { name: t('sub.visitorVip.f8'), included: true },
    ],
    benefits: [
      t('sub.visitorVip.b1'),
      t('sub.visitorVip.b2'),
      t('sub.visitorVip.b3'),
      t('sub.visitorVip.b4'),
      t('sub.visitorVip.b5'),
      t('sub.visitorVip.b6'),
    ],
    cta: t('sub.visitorVip.cta'),
    color: 'bg-purple-50',
  },
  ];
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const subscriptionTiers = getSubscriptionTiers(t);

  const visitorTiers = subscriptionTiers.filter(tier => tier.type === 'visitor');

  const handleSubscribe = (tierId: string) => {
    if (tierId === 'visitor-free') {
      navigate(ROUTES.REGISTER_VISITOR);
    } else if (tierId === 'visitor-vip') {
      navigate(ROUTES.VISITOR_VIP_REGISTRATION);
    }
  };

  // Données des 5 pavillons WordPress
  const pavilions = [
    {
      icon: Landmark,
      title: t('sub.pav1.title'),
      description: t('sub.pav1.desc'),
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: Cog,
      title: t('sub.pav2.title'),
      description: t('sub.pav2.desc'),
      color: 'from-indigo-500 to-indigo-700'
    },
    {
      icon: Hammer,
      title: t('sub.pav3.title'),
      description: t('sub.pav3.desc'),
      color: 'from-green-500 to-green-700'
    },
    {
      icon: GraduationCap,
      title: t('sub.pav4.title'),
      description: t('sub.pav4.desc'),
      color: 'from-purple-500 to-purple-700'
    },
    {
      icon: Palette,
      title: t('sub.pav5.title'),
      description: t('sub.pav5.desc'),
      color: 'from-rose-500 to-rose-700'
    }
  ];

  // Stats WordPress
  const wpStats = [
    { number: '600+', label: t('sub.stat1.label') },
    { number: '200 000+', label: t('sub.stat2.label') },
    { number: '50', label: t('sub.stat3.label') },
    { number: '20', label: t('sub.stat4.label') }
  ];

  // Pourquoi visiter - bullet points WordPress
  const whyVisit = [
    t('sub.why1'),
    t('sub.why2'),
    t('sub.why3'),
    t('sub.why4'),
    t('sub.why5')
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 : HERO IMMERSIF
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center text-white overflow-hidden">
        {/* Background image salon */}
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Salon du bâtiment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/85 to-indigo-900/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-blue-900/30" />
        </div>
        
        {/* Pattern Zellige subtil */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }} />

        {/* Éléments décoratifs géométriques */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 border border-sib-gold/20 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] border border-white/10 rounded-full" />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-sib-gold/40 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-sib-gold/20 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-sib-gold/30"
              >
                <Sparkles className="w-4 h-4 text-sib-gold" />
                <span className="text-sm font-bold text-sib-gold uppercase tracking-widest">
                  20ème Édition — {t('sub.hero.badge')}
                </span>
              </motion.div>

              {/* Titre principal */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1]">
                <span className="block">Salon</span>
                <span className="block">International</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sib-gold via-yellow-300 to-amber-400">
                  du Bâtiment
                </span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100/90 mb-4 leading-relaxed max-w-lg">
                Du 25 au 29 Novembre 2026 à El Jadida – Maroc
              </p>
              <p className="text-base text-blue-200/70 mb-10 leading-relaxed max-w-lg">
                {t('sub.hero.desc')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => handleSubscribe('visitor-free')}
                  className="bg-gradient-to-r from-sib-gold to-amber-400 text-blue-950 hover:from-yellow-400 hover:to-amber-300 font-bold text-lg px-10 py-4 shadow-2xl shadow-sib-gold/25 transition-all hover:scale-105"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  {t('sub.hero.badgeBtn')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleSubscribe('visitor-vip')}
                  className="border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold backdrop-blur-sm px-8 py-4 transition-all"
                >
                  <Crown className="mr-2 h-5 w-5 text-sib-gold" />
                  {t('sub.hero.vipBtn')}
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10 text-blue-200/70 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Inscription ouverte</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Badge gratuit disponible</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards avec effet verre */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 gap-5"
            >
              {wpStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.12 }}
                  className="group bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-7 text-center hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-default"
                >
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-sib-gold to-amber-300 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-blue-100/80 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,40 C320,80 440,0 720,40 C1000,80 1120,0 1440,40 L1440,80 L0,80 Z" fill="white" fillOpacity="0.06"/>
            <path d="M0,50 C360,90 480,10 720,50 C960,90 1080,10 1440,50 L1440,80 L0,80 Z" fill="white" fillOpacity="0.08"/>
            <path d="M0,60 C400,80 560,40 720,60 C880,80 1040,40 1440,60 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 : POURQUOI VISITER SIB ? (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.03] text-sib-primary" scale={1.5} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-sib-primary p-2 rounded-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <span className="text-sib-primary font-semibold">{t('sub.whySection.label')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('sub.whySection.title1')} <span className="text-sib-primary">SIB</span> {t('sub.whySection.title2')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Une expérience immersive au cœur de l'écosystème bâtiment international
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Liste des raisons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-5">
                {whyVisit.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex gap-4 items-start bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="bg-sib-primary/10 p-2 rounded-lg flex-shrink-0">
                      <Check className="h-5 w-5 text-sib-primary" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{reason}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Card visuelle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-8">
                <div className="text-center mb-6">
                  <div className="bg-sib-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('sub.whySection.worldEvent')}
                  </h3>
                  <p className="text-gray-600">
                    {t('sub.whySection.worldEventDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {wpStats.map((stat, index) => (
                    <motion.div
                      key={`card-stat-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="text-center p-4 bg-white rounded-lg shadow-sm"
                    >
                      <div className="text-2xl font-bold text-sib-primary mb-1">{stat.number}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200 inline-flex items-center gap-3"
              >
                <div className="bg-amber-100 p-2 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t('sub.info.datesVal')}</p>
                  <p className="text-sm text-gray-500">{t('sub.info.venueAddr')}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 : LES 5 UNIVERS / PAVILLONS (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-sib-gold rounded-full" />
          <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-green-600 rotate-45 transform" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-sib-primary p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-sib-primary font-semibold">{t('sub.pavSection.label')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('sub.pavSection.title1')} <span className="text-sib-primary">{t('sub.pavSection.titleHighlight')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {pavilions.map((pavilion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center text-center p-6">
                  <div className={`bg-gradient-to-br ${pavilion.color} p-4 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <pavilion.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">
                    {pavilion.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {pavilion.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 : BESOIN D'INFORMATIONS ? (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gradient-to-r from-sib-primary to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('sub.needInfo')}
            </h2>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-sib-primary hover:bg-blue-50 font-bold">
                <Mail className="mr-2 h-5 w-5" />
                {t('sub.contactUs')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 : FORFAITS VISITEURS (App existante + WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-purple-600 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="text-purple-600 font-semibold">{t('sub.plans.label')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('sub.plans.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('sub.plans.subtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards - Visiteurs uniquement */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl gap-8 w-full">
            {visitorTiers.map((tier) => (
              <Card
                key={tier.id}
                data-testid={`subscription-card-${tier.id}`}
                className={`relative overflow-hidden h-full flex flex-col transition-transform hover:scale-105 ${tier.color}`}
              >
              {/* Header */}
              <div className="p-6 pb-8 border-b-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{tier.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-2">
                  {tier.currency === 'Sur devis' ? (
                    <span className="text-4xl font-bold text-sib-primary">{t('sub.plans.onQuote')}</span>
                  ) : tier.price === 0 ? (
                    <span className="text-4xl font-bold text-green-600">{t('sub.plans.free')}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">{tier.price.toLocaleString()}</span>
                      <span className="text-lg text-gray-600">{tier.currency}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-6 flex-grow">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">{t('sub.plans.features')}</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-800' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Benefits */}
                <h4 className="text-sm font-semibold text-gray-900 mt-6 mb-4 uppercase tracking-wider">{t('sub.plans.benefits')}</h4>
                <ul className="space-y-2 mb-6">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="text-sm text-gray-700 flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 border-t-2 border-gray-200">
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
                >
                  {tier.cta}
                </Button>
              </div>
            </Card>
            ))}
          </div>
        </div>

        {/* Forfait sur mesure (WordPress) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center bg-gradient-to-r from-sib-primary to-indigo-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            {t('sub.plans.customPlan')}
          </h3>
          <Link to={ROUTES.CONTACT}>
            <Button size="lg" className="bg-white text-sib-primary hover:bg-blue-50 font-bold">
              <Users className="mr-2 h-5 w-5" />
              {t('sub.plans.customPlanDesc')}
            </Button>
          </Link>
        </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 : ORGANISEZ VOTRE VISITE - INFOS PRATIQUES (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.03] text-sib-primary" scale={1.5} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-sib-primary p-2 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className="text-sib-primary font-semibold">{t('sub.info.label')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {t('sub.info.title1')} <span className="text-sib-primary">{t('sub.info.titleHighlight')}</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('sub.info.venue')}</h3>
                    <p className="text-gray-600">{t('sub.info.venueAddr')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('sub.info.dates')}</h3>
                    <p className="text-gray-600">{t('sub.info.datesVal')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('sub.info.hours')}</h3>
                    <p className="text-gray-600">{t('sub.info.hoursVal')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Ticket className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('sub.info.entry')}</h3>
                    <p className="text-gray-600">{t('sub.info.entryVal')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-8">
                <div className="text-center mb-6">
                  <div className="bg-sib-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('sub.info.contact')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('sub.info.contactOrg')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 text-sib-primary flex-shrink-0" />
                    <p className="text-sm text-gray-700">{t('sub.info.contactAddr')}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Mail className="h-5 w-5 text-sib-primary flex-shrink-0" />
                    <a href="mailto:contact@sibevent.com" className="text-sm text-sib-primary hover:underline font-medium">
                      contact@sibevent.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Phone className="h-5 w-5 text-sib-primary flex-shrink-0" />
                    <a href="tel:+212668385228" className="text-sm text-sib-primary hover:underline font-medium">
                      +212 6 68 38 52 28
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={ROUTES.CONTACT}>
                    <Button className="w-full bg-sib-primary text-white hover:bg-blue-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('sub.info.contactBtn')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 : COMMENT ÇA MARCHE (App existante)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('sub.how.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('sub.how.step1Title')}</h3>
              <p className="text-gray-600">
                {t('sub.how.step1Desc')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('sub.how.step2Title')}</h3>
              <p className="text-gray-600">
                {t('sub.how.step2Desc')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('sub.how.step3Title')}</h3>
              <p className="text-gray-600">
                {t('sub.how.step3Desc')}
              </p>
            </motion.div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8 : FAQ (App existante)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('sub.faq.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">{t('sub.faq.q1')}</h3>
              <p className="text-gray-600">
                {t('sub.faq.a1')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">{t('sub.faq.q2')}</h3>
              <p className="text-gray-600">
                {t('sub.faq.a2')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">{t('sub.faq.q3')}</h3>
              <p className="text-gray-600">
                {t('sub.faq.a3')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">{t('sub.faq.q4')}</h3>
              <p className="text-gray-600">
                {t('sub.faq.a4')}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}




