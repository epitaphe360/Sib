import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Check, X, Crown, Zap, Star, Award, 
  Globe, Users, GraduationCap, Landmark,
  Hammer, Cog, ArrowRight,
  MapPin, CalendarDays, Clock, CreditCard,
  MessageCircle, Ticket, Mail,
  Phone, Building2, Target, Download, Sparkles, Shield
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
  level: string;
  features: SubscriptionFeature[];
  benefits: string[];
  cta: string;
  color: string;
}

const exhibitorTiers: SubscriptionTier[] = [
  {
    id: 'exhibitor-9m',
    name: 'Exposant 9m² (Base)',
    price: 0,
    currency: 'Sur devis',
    icon: <Star className="w-8 h-8" />,
    description: 'Profil & présence de base',
    level: '9m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Logo sur le site', included: true },
      { name: 'Présentation courte', included: true },
      { name: 'Mini-site personnalisé', included: false },
      { name: 'Gestion des rendez-vous', included: false },
      { name: 'Store produits', included: false },
      { name: 'Tableau de bord exposant', included: true },
      { name: 'Formulaire de contact', included: true },
    ],
    benefits: [
      'Profil d\'exposant modifiable',
      'Présence sur le site',
      'Logo et description',
      'Formulaire de contact basique',
      'Accès tableau de bord',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-blue-50',
  },
  {
    id: 'exhibitor-18m',
    name: 'Exposant 18m² (Standard)',
    price: 0,
    currency: 'Sur devis',
    icon: <Star className="w-8 h-8" />,
    description: 'Mini-site + 15 rendez-vous',
    level: '18m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Logo sur le site', included: true },
      { name: 'Mini-site personnalisé', included: true },
      { name: 'Gestion des rendez-vous (15)', included: true },
      { name: 'Store produits & filtrage', included: true },
      { name: 'URL personnalisée', included: true },
      { name: 'Tableau de bord complet', included: true },
      { name: 'Support standard', included: true },
    ],
    benefits: [
      'Mini-site dédié avec URL personnalisée',
      '15 créneaux de rendez-vous disponibles',
      'Présentation complète de produits/services',
      'Système de filtrage des visiteurs',
      'Messagerie intégrée',
      'Accès aux analytics basiques',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-green-50',
  },
  {
    id: 'exhibitor-36m',
    name: 'Exposant 36m² (Premium)',
    price: 0,
    currency: 'Sur devis',
    icon: <Award className="w-8 h-8" />,
    description: 'Mise en avant + 30 rendez-vous',
    level: '36m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Mini-site personnalisé', included: true },
      { name: 'Mise en avant "À la Une"', included: true },
      { name: 'Gestion des rendez-vous (30)', included: true },
      { name: 'Store produits avancé', included: true },
      { name: 'Accès API Supabase limité', included: true },
      { name: 'Outils de réseautage avancés', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Badge virtuel personnalisé', included: true },
    ],
    benefits: [
      'Mise en avant sur la page d\'accueil',
      '30 créneaux de rendez-vous',
      'Mini-site premium avec médias illimités',
      'Intégration API personnalisée',
      'Messagerie directe et chat',
      'Analytics détaillés',
      'Support technique prioritaire',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-amber-50',
  },
  {
    id: 'exhibitor-54m',
    name: 'Exposant 54m²+ (Elite)',
    price: 0,
    currency: 'Sur devis',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité maximale + créneaux illimités',
    level: '54m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Mini-site Premium', included: true },
      { name: 'Mise en avant permanente', included: true },
      { name: 'Rendez-vous illimités', included: true },
      { name: 'Store produits complet', included: true },
      { name: 'Accès API Supabase complet', included: true },
      { name: 'Outils de réseautage illimités', included: true },
      { name: 'Support VIP 24/7', included: true },
      { name: 'Personnalisation avancée', included: true },
    ],
    benefits: [
      'Mise en avant permanente et prioritaire',
      'Créneaux de rendez-vous illimités',
      'Mini-site avec scripts personnalisés',
      'Accès API complet pour intégrations',
      'Stockage médias illimité',
      'Chat et messagerie illimitée',
      'Support technique VIP dédié',
      'Priorité algorithmique',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-red-50',
  },
];

export default function ExhibitorSubscriptionPage() {
  const navigate = useNavigate();
  // t used for future translations
  const { t: _t } = useTranslation();

  const handleSubscribe = (tierId: string) => {
    const tier = exhibitorTiers.find(t => t.id === tierId);
    navigate(ROUTES.REGISTER_EXHIBITOR, {
      state: {
        selectedTier: tierId,
        tierName: tier?.name || '',
        tierLevel: tier?.level || '',
        tierPrice: tier?.price || 0
      }
    });
  };

  // Stats WordPress
  const wpStats = [
    { number: '200 000+', label: 'Visiteurs professionnels' },
    { number: '600+', label: 'Exposants' },
    { number: '20', label: 'Conférences' },
    { number: '5', label: 'Jours de salon' }
  ];

  // Pourquoi participer - WordPress
  const whyParticipate = [
    'Gagnez en visibilité internationale auprès de plus de 200 000 visiteurs professionnels.',
    'Présentez vos solutions aux décideurs, investisseurs, autorités BTP, industriels et opérateurs logistiques.',
    'Participez à un salon de réseautage ciblé avec des espaces B2B dédiés.',
    'Affichez votre engagement en innovation, durabilité et connectivité construction.',
    'Valorisez votre image de marque dans un événement à portée médiatique internationale.'
  ];


  // 4 espaces thématiques - WordPress
  const spaces = [
    {
      icon: Landmark,
      title: 'Institutionnel',
      subtitle: 'Soutenir la croissance des bâtiments et faciliter les partenariats',
      description: 'Fédérer les institutions et organismes clés qui définissent le cadre réglementaire et stratégique des bâtiments. Renforcer la diplomatie économique. Soutenir la croissance bâtiment en mettant en lumière les grandes stratégies mondiales.',
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: Cog,
      title: 'Industrie bâtiment',
      subtitle: 'L\'excellence opérationnelle au service de la compétitivité des bâtiments',
      description: 'Construction et modernisation des infrastructures BTP. Maintenance préventive et gestion des chantiers. Transformation digitale et automatisation. Solutions durables. Sécurité et cybersecurité bâtiment.',
      color: 'from-indigo-500 to-indigo-700'
    },
    {
      icon: Hammer,
      title: 'Exploitation & Gestion des bâtiments',
      subtitle: 'Échange d\'expertise et coopération',
      description: 'Rencontres entre les acteurs du bâtiment pour renforcer leur coopération et développer de nouveaux partenariats. Espaces B2B et de networking ciblés conçus pour stimuler les échanges d\'expertise.',
      color: 'from-green-500 to-green-700'
    },
    {
      icon: GraduationCap,
      title: 'Académique et Formation',
      subtitle: 'Former les talents du secteur du bâtiment',
      description: 'Former les talents et répondre aux besoins évolutifs du secteur du bâtiment. Créer des passerelles entre institutions académiques et acteurs BTP. Valoriser les formations spécialisées et les nouveaux métiers émergents.',
      color: 'from-purple-500 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 : HERO IMMERSIF EXPOSANT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center text-white overflow-hidden">
        {/* Background image salon */}
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Salon exposition" 
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
                  Devenez exposant au SIB 2026
                </span>
              </motion.div>

              {/* Titre principal */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1]">
                <span className="block">Exposez au</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sib-gold via-yellow-300 to-amber-400">
                  SIB 2026
                </span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100/90 mb-4 leading-relaxed max-w-lg">
                Du 25 au 29 Novembre 2026 — Parc d'Exposition Mohammed VI, El Jadida
              </p>
              <p className="text-base text-blue-200/70 mb-10 leading-relaxed max-w-lg">
                Positionnez-vous au cœur de l'innovation et de la coopération stratégique du secteur 
                du bâtiment. Rejoignez plus de 600 exposants et 200 000 visiteurs professionnels.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={ROUTES.CONTACT}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-sib-gold to-amber-400 text-blue-950 hover:from-yellow-400 hover:to-amber-300 font-bold text-lg px-10 py-4 shadow-2xl shadow-sib-gold/25 transition-all hover:scale-105"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Réserver votre stand
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    document.getElementById('exhibitor-tiers')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold backdrop-blur-sm px-8 py-4 transition-all"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Voir les offres
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10 text-blue-200/70 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Réservation ouverte</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Tarifs sur devis</span>
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
          SECTION 2 : POURQUOI PARTICIPER AU SIB 2026 ? (WordPress)
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
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-sib-primary font-semibold">Pourquoi participer ?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi participer au <span className="text-sib-primary">SIB 2026</span> ?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Un rendez-vous stratégique pour tisser des partenariats et explorer les opportunités économiques du secteur du bâtiment mondial et de son écosystème.
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
                {whyParticipate.map((reason, index) => (
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
                    Un salon d'envergure mondiale
                  </h3>
                  <p className="text-gray-600">
                    Le plus grand salon bâtiment d'Afrique et du monde arabe
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

              {/* Floating Element */}
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
                  <p className="font-semibold text-gray-900">25-29 Novembre 2026</p>
                  <p className="text-sm text-gray-500">Parc d'Exposition Mohammed VI – El Jadida</p>
                </div>
              </motion.div>

              {/* Bouton Télécharger la présentation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-6"
              >
                <a
                  href="https://drive.google.com/file/d/1LwnQdRU8pCc40MzR2MaFu5-NekbR5Wl-/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-sib-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">TÉLÉCHARGER LA PRÉSENTATION</p>
                    <p className="text-xs opacity-90">Découvrez tous les détails de l'événement</p>
                  </div>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 : POURQUOI DEVENIR PARTENAIRE (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 : POSITIONNEMENT THÉMATIQUE (WordPress)
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
              <span className="text-sib-primary font-semibold">Un positionnement pensé pour tous les acteurs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Rejoignez nos espaces thématiques d'<span className="text-sib-primary">exposition</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {spaces.map((space, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-br ${space.color} p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <space.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{space.title}</h3>
                      <p className="text-sm text-sib-primary font-medium mb-3">{space.subtitle}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{space.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 : COMMENT RÉSERVER (WordPress)
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
              Comment réserver votre stand ou activer votre participation ?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Les demandes de réservation sont traitées individuellement par notre équipe commerciale. 
              Les tarifs sont établis en fonction des surfaces, aménagements et options souhaitées.
            </p>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-sib-primary hover:bg-blue-50 font-bold">
                <Mail className="mr-2 h-5 w-5" />
                Réserver votre espace
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 : FORFAITS EXPOSANTS (App existante)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="exhibitor-tiers" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-600 font-semibold">Forfaits Exposants</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choisissez le forfait qui correspond le mieux à vos besoins
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Maximisez votre expérience au SIB
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {exhibitorTiers.map((tier) => (
              <Card
                key={tier.id}
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
                    <span className="text-4xl font-bold text-sib-primary">Sur devis</span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 flex-grow">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Fonctionnalités</h4>
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
                  <h4 className="text-sm font-semibold text-gray-900 mt-6 mb-4 uppercase tracking-wider">Avantages</h4>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    {tier.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Forfait sur mesure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 text-center bg-gradient-to-r from-sib-primary to-indigo-600 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">
              Besoin d'un forfait sur mesure pour votre équipe ?
            </h3>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-sib-primary hover:bg-blue-50 font-bold">
                <Users className="mr-2 h-5 w-5" />
                Contactez-nous
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 : INFOS PRATIQUES (WordPress)
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
                <span className="text-sib-primary font-semibold">Organisez votre participation !</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Infos <span className="text-sib-primary">pratiques</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Lieu</h3>
                    <p className="text-gray-600">Parc d'Exposition Mohammed VI – El Jadida, Maroc</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Dates</h3>
                    <p className="text-gray-600">25-29 Novembre 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Horaires</h3>
                    <p className="text-gray-600">9h00 à 19h00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Ticket className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Entrée</h3>
                    <p className="text-gray-600">Gratuite — sur badge électronique</p>
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
                    Contact Organisation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    URBACOM
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 text-sib-primary flex-shrink-0" />
                    <p className="text-sm text-gray-700">63, Imm B, Rés LE YACHT, Bd de la Corniche 7ème étage N°185, Casablanca 20510</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Mail className="h-5 w-5 text-sib-primary flex-shrink-0" />
                    <a href="mailto:Sib2026@urbacom.net" className="text-sm text-sib-primary hover:underline font-medium">
                      Sib2026@urbacom.net
                    </a>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Phone className="h-5 w-5 text-sib-primary flex-shrink-0" />
                    <a href="tel:+212688500500" className="text-sm text-sib-primary hover:underline font-medium">
                      +212 6 88 50 05 00
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={ROUTES.CONTACT}>
                    <Button className="w-full bg-sib-primary text-white hover:bg-blue-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Nous contacter
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8 : COMMENT ÇA MARCHE (App existante)
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
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Choix de l'offre</h3>
                <p className="text-gray-600">
                  Sélectionnez l'offre qui correspond à vos besoins parmi nos différents niveaux.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Paiement sécurisé</h3>
                <p className="text-gray-600">
                  Paiement en ligne ou via un commercial. Validation par administrateur automatique.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Accès immédiat</h3>
                <p className="text-gray-600">
                  Accès instantané à votre tableau de bord et à tous les avantages de votre offre.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 9 : FAQ (App existante)
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Questions fréquentes</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Puis-je changer d'offre ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez faire évoluer votre offre à tout moment. Un administrateur validera les changements.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Quel est le délai d'activation ?</h3>
              <p className="text-gray-600">
                Une fois le paiement validé, votre accès est activé dans les 24 heures.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Y a-t-il une facturation récurrente ?</h3>
              <p className="text-gray-600">
                Non, sauf mention contraire. Les offres sont forfaitaires pour le salon 2026.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Comment contacter le support ?</h3>
              <p className="text-gray-600">
                Contactez notre équipe via le formulaire du site ou par e-mail : Sib2026@urbacom.net
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
