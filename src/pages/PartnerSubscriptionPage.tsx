import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import {
  Check, X, Crown, Zap, Star, Award, ChevronDown, ArrowDown,
  Users,
  MapPin, CalendarDays, Clock, CreditCard,
  MessageCircle, Ticket, Mail,
  Phone, Handshake, Eye,
  Video, Mic, Radio, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../lib/routes';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform, animate as animateValue } from 'framer-motion';
import { MoroccanPattern } from '../components/ui/MoroccanDecor';

// Types
interface SubscriptionFeature {
  name: string;
  included: boolean;
}

interface PartnerTierData {
  id: string;
  name: string;
  price: number;
  currency: string;
  icon: React.ReactNode;
  description: string;
  level: string;
  features: SubscriptionFeature[];
  benefits: string[];
  cta: string;
  color: string;
}

const partnerTiers: PartnerTierData[] = [
  {
    id: 'partner-silver',
    name: 'Sponsor Silver',
    price: 200000,
    currency: 'MAD',
    icon: <Award className="w-8 h-8" />,
    description: 'Visibilité & communication',
    level: 'silver',
    features: [
      { name: 'Logo sur tous les supports de communication', included: true },
      { name: 'Logo sur le plan officiel', included: true },
      { name: 'Bannière sur le site web (1)', included: true },
      { name: 'Livraison de 200 invitations personnalisées', included: true },
      { name: 'Diffusion publicités réseaux sociaux', included: true },
      { name: 'Diffusion publicités sur écrans du salon', included: true },
      { name: 'Salle de conférence (1h00)', included: true },
      { name: 'Insertion catalogue officiel', included: true },
      { name: 'Livraison reportage photos/vidéos post-salon', included: true },
      { name: 'Habillage façade salon', included: false },
      { name: 'Impression logo sur rubans des badges', included: false },
    ],
    benefits: [
      'Logo sur le plan officiel du salon',
      '200 invitations personnalisées',
      '1 bannière sur le site web',
      'Publicité sur les écrans géants',
      'Salle de conférence 1h00',
      'Reportage photos/vidéos post-salon',
      'Citation dans le rapport final',
    ],
    cta: 'Devenir Sponsor Silver',
    color: 'bg-indigo-50',
  },
  {
    id: 'partner-gold',
    name: 'Sponsor Gold',
    price: 350000,
    currency: 'MAD',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité renforcée',
    level: 'gold',
    features: [
      { name: 'Logo sur tous les supports de communication', included: true },
      { name: 'Logo sur le plan officiel', included: true },
      { name: 'Bannières sur le site web (2)', included: true },
      { name: 'Livraison de 500 invitations personnalisées', included: true },
      { name: 'Diffusion publicités réseaux sociaux', included: true },
      { name: 'Diffusion publicités sur écrans du salon', included: true },
      { name: 'Jingles et opening vidéos SIB TV', included: true },
      { name: 'Salle de conférence (1h30)', included: true },
      { name: 'Insertion catalogue 3ème de couverture', included: true },
      { name: 'Présentation détaillée + mot du DG', included: true },
      { name: 'Livraison reportage photos/vidéos post-salon', included: true },
    ],
    benefits: [
      'Logo premier plan sur tous les supports',
      '500 invitations personnalisées',
      '2 bannières sur le site web',
      'Jingles et opening vidéos SIB TV',
      'Salle de conférence 1h30',
      'Page dans le catalogue officiel (3ème couverture)',
      'Présentation détaillée + mot du DG',
      'Reportage complet post-salon',
    ],
    cta: 'Devenir Sponsor Gold',
    color: 'bg-amber-50',
  },
  {
    id: 'partner-officiel',
    name: 'Partenaire Officiel',
    price: 500000,
    currency: 'MAD',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité maximale — Sponsor stratégique',
    level: 'official_sponsor',
    features: [
      { name: 'Logo sur tous les supports de communication', included: true },
      { name: 'Logo sur le plan officiel', included: true },
      { name: 'Publicité plan de poche (4ème de couverture)', included: true },
      { name: 'Bannières sur le site web (4)', included: true },
      { name: 'Livraison de 1 000 invitations personnalisées', included: true },
      { name: 'Diffusion publicités réseaux sociaux (posts sponsorisés)', included: true },
      { name: 'Plusieurs passages par jour sur écrans géants', included: true },
      { name: 'Jingles et opening vidéos SIB TV', included: true },
      { name: 'Salle de conférence (2h00)', included: true },
      { name: 'Impression logo sur rubans des badges visiteurs', included: true },
      { name: 'Publicité sur totems d\'orientation', included: true },
      { name: 'Habillage façade sortie Hall A / entrée Hall B', included: true },
      { name: 'Catalogue 4ème de couverture + présentation + mot DG + signet', included: true },
      { name: 'Citation lors de la conférence de presse', included: true },
      { name: 'Reportage complet photos/vidéos + pressbook + rapport final', included: true },
    ],
    benefits: [
      'Visibilité maximale sur tous les canaux',
      '1 000 invitations personnalisées',
      '4 bannières sur le site web',
      'Posts sponsorisés sur les réseaux sociaux',
      'Logo sur rubans des badges visiteurs',
      'Habillage façade du salon',
      'Salle de conférence 2h00',
      'Catalogue 4ème de couverture + signet',
      'Citation lors de la conférence de presse',
      'Rapport final + pressbook + Best-Of',
    ],
    cta: 'Devenir Partenaire Officiel',
    color: 'bg-rose-50',
  },
];

const TIER_STYLES: Record<string, { gradient: string; cta: string; ctaText: string; ring: string }> = {
  'partner-silver':   { gradient: 'from-slate-500 to-indigo-600',  cta: 'from-slate-500 to-indigo-600',  ctaText: 'text-white',     ring: 'ring-slate-200'   },
  'partner-gold':     { gradient: 'from-amber-400 to-amber-500',   cta: 'from-amber-400 to-amber-500',   ctaText: 'text-amber-950', ring: 'ring-amber-300 shadow-amber-100' },
  'partner-officiel': { gradient: 'from-rose-500 to-rose-600',     cta: 'from-rose-500 to-rose-600',     ctaText: 'text-white',     ring: 'ring-rose-200'    },
};

function AnimatedCounter({ to, suffix = '' }: Readonly<{ to: number; suffix?: string }>) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animateValue(motionVal, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate(v) {
        setDisplay(to >= 10000 ? Math.floor(v).toLocaleString('fr-FR') : Math.floor(v).toString());
      },
    });
    return controls.stop;
  }, [inView, to, motionVal]);

  return <span ref={nodeRef}>{display}{suffix}</span>;
}

/**
 * Composant Tilt3D — effet de perspective 3D au survol de la souris
 */
function Tilt3D({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  const scale   = useSpring(1, { stiffness: 300, damping: 30 });

  return (
    <div
      aria-hidden="true"
      style={{ perspective: 1000 }}
      className={className}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseEnter={() => scale.set(1.025)}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); scale.set(1); }}
    >
      <motion.div style={{ rotateX, rotateY, scale }} className="h-full">
        {children}
      </motion.div>
    </div>
  );
}

function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });
  return time;
}

export default function PartnerSubscriptionPage() {
  const navigate = useNavigate();
  // t used for future translations
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const countdown = useCountdown(new Date('2026-11-25T09:00:00'));

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubscribe = (tierId: string) => {
    const tier = partnerTiers.find(t => t.id === tierId);
    navigate(ROUTES.REGISTER_PARTNER, {
      state: {
        selectedTier: tierId,
        tierName: tier?.name || '',
        tierLevel: tier?.level || '',
        tierPrice: tier?.price || 0
      }
    });
  };

  // Stats
  const wpStats = [
    { to: 200000, suffix: '+', label: 'Visiteurs professionnels' },
    { to: 600, suffix: '+', label: 'Exposants' },
    { to: 20, suffix: '', label: 'Conférences' },
    { to: 5, suffix: '', label: 'Jours de salon' }
  ];

  // Pourquoi devenir sponsor - WordPress
  const whyPartner = [
    'Positionner votre marque comme leader ou acteur engagé du secteur du bâtiment.',
    'Bénéficier d\'une visibilité premium : branding, conférences, ateliers, supports print & digitaux.',
    'Accéder à des services VIP, rencontres de haut niveau et conférences exclusives.',
    'Créer des activations ciblées (sponsoring de zone, d\'événement, contenu co-marqué).'
  ];
  const whyPartnerMeta = [
    { Icon: TrendingUp, bg: 'bg-indigo-100', color: 'text-indigo-600', accent: 'border-indigo-200', numColor: 'text-indigo-50' },
    { Icon: Eye,        bg: 'bg-purple-100', color: 'text-purple-600', accent: 'border-purple-200', numColor: 'text-purple-50' },
    { Icon: Crown,      bg: 'bg-amber-100',  color: 'text-amber-600',  accent: 'border-amber-200',  numColor: 'text-amber-50'  },
    { Icon: Zap,        bg: 'bg-rose-100',   color: 'text-rose-600',   accent: 'border-rose-200',   numColor: 'text-rose-50'   },
  ];

  // Avantages médias
  const mediaAdvantages = [
    { icon: Video,      title: 'Capsules vidéo "Inside SIB"', description: 'Spot de marque filmé & monté par notre équipe, diffusé sur tous nos canaux.' },
    { icon: Mic,        title: 'Podcast SIB Talks',           description: 'Interview audio dans notre podcast officiel, archivé et repartagé.' },
    { icon: Radio,      title: 'Interview Live Studio',       description: 'Passage filmé en direct dans notre studio "Meet The Leaders".' },
    { icon: Eye,        title: 'Bannière Web rotative',       description: "Rotation prioritaire sur la page d'accueil et toutes les rubriques du site." },
    { icon: Mail,       title: 'Newsletters & E-mailings',    description: 'Bloc dédié dans chaque envoi auprès des 50 000 professionnels abonnés.' },
    { icon: TrendingUp, title: 'Section "Top Innovations"',  description: 'Vos solutions mises en avant dans notre sélection éditoriale SIB 2026.' },
  ];
  // Palette officielle SIB : Bleu #00AEEF · Vert #52B847 · Rouge #E63329
  const mediaMeta = [
    { bar: 'bg-[#00AEEF]', iconBg: 'bg-[#00AEEF]', statColor: 'text-[#00AEEF]', stat: '200K+', statLabel: 'vues garanties',     live: false },
    { bar: 'bg-[#00AEEF]', iconBg: 'bg-[#00AEEF]', statColor: 'text-[#00AEEF]', stat: '5',     statLabel: 'épisodes / salon',   live: false },
    { bar: 'bg-[#E63329]', iconBg: 'bg-[#E63329]', statColor: 'text-[#E63329]', stat: null,    statLabel: null,                 live: true  },
    { bar: 'bg-[#00AEEF]', iconBg: 'bg-[#00AEEF]', statColor: 'text-[#00AEEF]', stat: '500K',  statLabel: 'impressions / mois', live: false },
    { bar: 'bg-[#52B847]', iconBg: 'bg-[#52B847]', statColor: 'text-[#52B847]', stat: '50K',   statLabel: 'abonnés actifs',     live: false },
    { bar: 'bg-[#52B847]', iconBg: 'bg-[#52B847]', statColor: 'text-[#52B847]', stat: 'TOP',   statLabel: 'innovations SIB',    live: false },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ---------------------------------------------------------------
          SECTION 1 : HERO - DEVENEZ PARTENAIRE
          --------------------------------------------------------------- */}
      <section className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white overflow-hidden">
        <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-300 rounded-full" />
          <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white rotate-45 transform" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-yellow-300" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
        </div>

        {/* Floating glow orbs */}
        <motion.div
          animate={{ y: [0, -25, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-[8%] w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-[8%] w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* Badge 3D rotatif décoratif */}
        <div className="absolute top-12 right-[12%] hidden lg:block z-10" style={{ perspective: 700 }}>
          <motion.div
            animate={{ rotateY: [-25, 25, -25], rotateX: [-8, 8, -8], y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 rounded-2xl shadow-2xl shadow-amber-500/60 flex flex-col items-center justify-center gap-1 border-2 border-yellow-200/50"
            style={{ rotate: 12 }}
          >
            <Crown className="w-9 h-9 text-white drop-shadow-lg" />
            <span className="text-[8px] font-black text-white/90 tracking-widest uppercase">SIB 2026</span>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <Handshake className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">
                  {t('partner.hero_badge')}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('partner.hero_title_1')}{' '}
                <span className="text-yellow-300">{t('partner.hero_title_2')}</span>{' '}
                {t('partner.hero_title_3')}
              </h1>

              <p className="text-lg md:text-xl text-indigo-100 mb-6 leading-relaxed">
                Associez votre marque à l'événement de référence du bâtiment au Maroc —{' '}
                <span className="font-bold text-white">200 000 visiteurs, 600+ exposants</span>
                {', '}5 jours d'opportunités exclusives à El Jadida.
              </p>

              {/* Countdown */}
              <div className="mb-8">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">{t('partner.hero_countdown_label')}</p>
                <div className="flex gap-3">
                  {[
                    { val: countdown.days,    label: t('partner.countdown_days') },
                    { val: countdown.hours,   label: t('partner.countdown_hours') },
                    { val: countdown.minutes, label: t('partner.countdown_minutes') },
                    { val: countdown.seconds, label: t('partner.countdown_seconds') },
                  ].map(({ val, label }) => (
                    <div key={label} className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 min-w-[56px]">
                      <span className="text-2xl font-black text-yellow-300 tabular-nums leading-none">
                        {String(val).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-indigo-300 uppercase tracking-widest mt-0.5">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    document.getElementById('partner-tiers')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-indigo-300 text-indigo-900 hover:bg-indigo-400 font-bold text-lg px-8"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  {t('partner.hero_btn_offers')}
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {wpStats.map((stat, index) => (
                <Tilt3D key={stat.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all h-full"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                      <AnimatedCounter to={stat.to} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-indigo-200">{stat.label}</div>
                  </motion.div>
                </Tilt3D>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors z-10"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">{t('partner.hero_discover')}</span>
          <ArrowDown className="w-4 h-4" />
        </motion.button>

        {/* Wave divider */}
        <div className="absolute bottom-0 inset-x-0 leading-none z-10">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-14">
            <path d="M0,56 C240,0 480,40 720,20 C960,0 1200,40 1440,10 L1440,56 Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          BANDEAU SOCIAL PROOF — PARTENAIRES PRÉCÉDENTS
          --------------------------------------------------------------- */}
      <div className="bg-white border-b border-gray-100 py-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
              {t('partner.social_proof_label')}
            </p>
            <div className="w-px h-6 bg-gray-200 hidden sm:block flex-shrink-0" />
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {[
                { name: 'LafargeHolcim', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                { name: 'Ciments du Maroc', color: 'bg-gray-50 text-gray-600 border-gray-200' },
                { name: 'Knauf', color: 'bg-orange-50 text-orange-700 border-orange-100' },
                { name: 'Leroy Merlin', color: 'bg-green-50 text-green-700 border-green-100' },
                { name: 'Saint-Gobain', color: 'bg-red-50 text-red-700 border-red-100' },
                { name: 'Somfy', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                { name: 'Schneider Electric', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
              ].map(({ name, color }) => (
                <span key={name} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${color}`}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          SECTION 2 : POURQUOI DEVENIR PARTENAIRE (WordPress)
          --------------------------------------------------------------- */}
      <section className="pt-8 pb-16 md:pb-24 bg-slate-50 relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.03] text-amber-600" scale={1.5} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-10 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">{t('partner.why_partner_badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('partner.why_partner_title')} <span className="text-indigo-600">SIB</span> ?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl">
              {t('partner.why_partner_subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyPartner.map((reason, index) => {
              const meta = whyPartnerMeta[index];
              const WhyIcon = meta.Icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex gap-4 items-start bg-white p-6 rounded-xl border ${meta.accent} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden`}
                >
                  <span className={`absolute right-3 bottom-0 text-8xl font-black ${meta.numColor} select-none pointer-events-none leading-none`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className={`${meta.bg} p-2 rounded-lg flex-shrink-0 relative z-10`}>
                    <WhyIcon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <p className="text-gray-700 leading-relaxed relative z-10">{reason}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          SECTION 3 : AVANTAGES MÉDIAS
          --------------------------------------------------------------- */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(0,174,239,0.06),_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_rgba(82,184,71,0.06),_transparent_60%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-[#00AEEF]/10 text-[#0089CC] border border-[#00AEEF]/30 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              <Video className="h-3.5 w-3.5" />
              {t('partner.media_badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('partner.media_title')} <span style={{ color: '#00AEEF' }}>{t('partner.media_title_accent')}</span> {t('partner.media_title_end')}
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              {t('partner.media_subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mediaAdvantages.map((advantage, index) => {
              const meta = mediaMeta[index];
              return (
                <Tilt3D key={advantage.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                      {/* Bande couleur SIB en haut */}
                      <div className={`h-1.5 w-full ${meta.bar}`} />

                      <div className="p-6 flex flex-col flex-grow">
                        {/* Icon + stat */}
                        <div className="flex items-start justify-between mb-5">
                          <div className={`${meta.iconBg} p-3 rounded-xl`}>
                            <advantage.icon className="h-6 w-6 text-white" />
                          </div>

                          {meta.live ? (
                            <div className="flex items-center gap-1.5 border-2 border-[#E63329]/30 px-2.5 py-1 rounded-full">
                              <motion.div
                                animate={{ opacity: [1, 0.2, 1] }}
                                transition={{ duration: 0.9, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-[#E63329]"
                              />
                              <span className="text-[11px] font-black text-[#E63329] tracking-widest">LIVE</span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className={`text-2xl font-black ${meta.statColor} leading-none tabular-nums`}>{meta.stat}</span>
                              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{meta.statLabel}</p>
                            </div>
                          )}
                        </div>

                        {/* Titre + description */}
                        <div className="mt-auto">
                          <h3 className="font-bold text-gray-900 text-sm mb-1.5 leading-snug">{advantage.title}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">{advantage.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Tilt3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          SECTION 4 : BESOIN D'INFORMATIONS
          --------------------------------------------------------------- */}
      <section className="py-12 bg-gradient-to-r from-indigo-500 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('partner.cta_info_title')}
            </h2>
            <p className="text-indigo-100 mb-6">
              {t('partner.cta_info_subtitle')}
            </p>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 font-bold">
                <Mail className="mr-2 h-5 w-5" />
                {t('partner.cta_info_btn')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          SECTION 5 : FORFAITS PARTENAIRES (App existante)
          --------------------------------------------------------------- */}
      <section id="partner-tiers" className="py-16 md:py-24 bg-gradient-to-b from-indigo-600 to-indigo-700 relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.04] text-indigo-400" scale={1.5} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <CreditCard className="h-3.5 w-3.5" />
              {t('partner.pricing_badge')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t('partner.pricing_title')}
            </h2>
            <p className="text-lg text-indigo-300 max-w-2xl mx-auto">
              {t('partner.pricing_subtitle')}
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-stretch max-w-6xl mx-auto"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {partnerTiers.map((tier) => (
              <motion.div
                key={tier.id}
                className="w-full h-full"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
                }}
              >
              <Tilt3D className="h-full">
              <Card
                className={`relative overflow-hidden h-full w-full flex flex-col bg-white ${
                  tier.id === 'partner-gold'
                    ? `ring-2 ${TIER_STYLES[tier.id].ring} shadow-2xl scale-[1.02]`
                    : `ring-1 ring-gray-200 shadow-lg`
                }`}
              >
                {/* Header — bande couleur compacte */}
                <div className={`bg-gradient-to-r ${TIER_STYLES[tier.id].gradient} px-5 pt-5 pb-4 relative overflow-hidden`}>
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
                  <div className="relative flex items-start justify-between">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      {tier.icon}
                    </div>
                    {tier.id === 'partner-gold' && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                        className="text-[10px] bg-white/25 text-white font-bold px-2.5 py-1 rounded-full border border-white/40 tracking-wide"
                      >
                        ? {t('partner.pricing_popular')}
                      </motion.span>
                    )}
                  </div>
                  <div className="mt-3 relative">
                    <h3 className="text-base font-bold text-white leading-tight">{tier.name}</h3>
                    <p className="text-xs text-white/65 mt-0.5">{tier.description}</p>
                  </div>
                </div>

                {/* Prix — bloc blanc */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">{tier.price.toLocaleString()}</span>
                    <div className="mb-0.5">
                      <span className="block text-sm font-bold text-gray-400">{tier.currency}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Forfait salon 2026 — paiement unique</p>
                </div>

                {/* Features */}
                <div className="px-5 pt-4 flex-grow">
                  <p className="text-[10px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest">{t('partner.pricing_included')}</p>
                  <ul className="space-y-1.5">
                    {tier.features.slice(0, 4).map((feature) => (
                      <li key={feature.name} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs leading-relaxed ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {tier.features.length > 4 && (
                    <>
                      <AnimatePresence initial={false}>
                        {expandedTier === tier.id && (
                          <motion.ul
                            key="extra-features"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden space-y-1.5 mt-1.5"
                          >
                            {tier.features.slice(4).map((feature) => (
                              <li key={feature.name} className="flex items-start gap-2">
                                {feature.included ? (
                                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={`text-xs leading-relaxed ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {feature.name}
                                </span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setExpandedTier(expandedTier === tier.id ? null : tier.id)}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <motion.span
                          animate={{ rotate: expandedTier === tier.id ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-flex"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </motion.span>
                        {expandedTier === tier.id ? t('partner.pricing_collapse') : `+ ${tier.features.length - 4} de plus`}
                      </button>
                    </>
                  )}

                  {/* Benefits */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{t('partner.pricing_key_benefits')}</p>
                    <ul className="space-y-1.5">
                      {tier.benefits.slice(0, 3).map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2">
                          <Star className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-5 pt-4">
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    className={`w-full bg-gradient-to-r ${TIER_STYLES[tier.id].cta} ${TIER_STYLES[tier.id].ctaText} font-bold hover:opacity-90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </Card>
              </Tilt3D>
              </motion.div>
            ))}
          </motion.div>

          {/* Forfait sur mesure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 text-center bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-56 h-56 bg-white/5 rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-400/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
            <div className="relative">
              <div className="bg-white/15 p-4 rounded-full w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                <Handshake className="h-8 w-8 text-yellow-300" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                {t('partner.custom_offer_title')}
              </h3>
              <p className="text-indigo-200 mb-7 max-w-lg mx-auto">
                {t('partner.custom_offer_subtitle')}
              </p>
              <Link to={ROUTES.CONTACT}>
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-yellow-50 font-bold shadow-lg">
                  <Users className="mr-2 h-5 w-5" />
                  {t('partner.custom_offer_btn')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6 : INFOS PRATIQUES */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.03] text-indigo-600" scale={1.5} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">{t('exhibitor.organize_participation_label')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {t('exhibitor.practical_info_title')}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('common.location')}</h3>
                    <p className="text-gray-600">{t('exhibitor.venue_address')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('common.dates')}</h3>
                    <p className="text-gray-600">{t('exhibitor.event_dates')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('common.hours')}</h3>
                    <p className="text-gray-600">{t('exhibitor.event_hours')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Ticket className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t('common.entry')}</h3>
                    <p className="text-gray-600">{t('exhibitor.entry_free_badge')}</p>
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
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 p-8">
                <div className="text-center mb-6">
                  <div className="bg-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('exhibitor.contact_organization_title')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    URBACOM
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700">63, Imm B, Rés LE YACHT, Bd de la Corniche 7ème étage N°185, Casablanca 20510</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Mail className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <a href="mailto:Sib2026@urbacom.net" className="text-sm text-amber-600 hover:underline font-medium">
                      Sib2026@urbacom.net
                    </a>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Phone className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <a href="tel:+212688500500" className="text-sm text-amber-600 hover:underline font-medium">
                      +212 6 88 50 05 00
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={ROUTES.CONTACT}>
                    <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('exhibitor.cta_contact_us')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 7 : COMMENT ÇA MARCHE */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300" />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('exhibitor.how_it_works_title')}</h2>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300" />
            </div>
            {/* Ligne de progression animée (desktop) */}
            <div className="relative">
              <div className="hidden md:block absolute top-8 left-[calc(100%/6+32px)] right-[calc(100%/6+32px)] h-1 bg-amber-100 rounded-full">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full origin-left"
                />
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileInView={{ scale: [0.7, 1.15, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-amber-200 shadow-md"
                >
                  <Star className="w-9 h-9 text-white" />
                </motion.div>
                <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full mb-2">{t('partner.step1_badge')}</span>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('exhibitor.step_1_title')}</h3>
                <p className="text-gray-600">
                  {t('exhibitor.step_1_description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center"
              >
                <motion.div
                  whileInView={{ scale: [0.7, 1.15, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-amber-200 shadow-md"
                >
                  <CreditCard className="w-9 h-9 text-white" />
                </motion.div>
                <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full mb-2">{t('partner.step2_badge')}</span>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('exhibitor.step_2_title')}</h3>
                <p className="text-gray-600">
                  {t('exhibitor.step_2_description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-center"
              >
                <motion.div
                  whileInView={{ scale: [0.7, 1.15, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-amber-200 shadow-md"
                >
                  <Zap className="w-9 h-9 text-white" />
                </motion.div>
                <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full mb-2">{t('partner.step3_badge')}</span>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('exhibitor.step_3_title')}</h3>
                <p className="text-gray-600">
                  {t('exhibitor.step_3_description')}
                </p>
              </motion.div>
            </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 : FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">{t('partner.faq_badge')}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('partner.faq_title')}</h2>
          </motion.div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              { q: t('partner.faq_q1'), a: t('partner.faq_a1') },
              { q: t('partner.faq_q2'), a: t('partner.faq_a2') },
              { q: t('partner.faq_q3'), a: t('partner.faq_a3') },
              { q: t('partner.faq_q4'), a: t('partner.faq_a4') },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex-shrink-0 ml-4"
                    >
                      <ChevronDown className="h-5 w-5 text-indigo-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 px-6 pb-6 border-t border-gray-100 pt-4">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          STICKY CTA BAR (apparaît après scroll)
          --------------------------------------------------------------- */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl"
          >
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 text-sm">{t('partner.sticky_title')}</p>
                <p className="text-xs text-gray-500">{t('partner.sticky_subtitle')}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => document.getElementById('partner-tiers')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold px-6 flex-1 sm:flex-none"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('partner.sticky_btn')}
                </Button>
                <button
                  onClick={() => setShowStickyBar(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fermer"
                >
                  ?
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

