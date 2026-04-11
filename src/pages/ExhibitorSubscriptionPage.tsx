import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Check, X, Crown, Zap, Star, Award, 
  Globe, Users, GraduationCap, Landmark,
  Ship, Cog, ArrowRight,
  MapPin, CalendarDays, Clock, CreditCard,
  MessageCircle, Ticket, Mail,
  Phone, Building2, Target, Download
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
    { number: '6 000+', label: 'Visiteurs qualifiés' },
    { number: '300+', label: 'Exposants' },
    { number: '30', label: 'Conférences et panels' },
    { number: '3', label: 'Jours de rencontres B2B' }
  ];

  // Pourquoi participer - WordPress
  const whyParticipate = [
    'Gagnez en visibilité internationale auprès de plus de 6 000 visiteurs qualifiés.',
    'Présentez vos solutions aux décideurs, investisseurs, autorités portuaires, industriels et opérateurs logistiques.',
    'Participez à un salon de réseautage ciblé avec des espaces B2B dédiés.',
    'Affichez votre engagement en innovation, durabilité et connectivité maritime.',
    'Valorisez votre image de marque dans un événement à portée médiatique mondiale.'
  ];


  // 4 espaces thématiques - WordPress
  const spaces = [
    {
      icon: Landmark,
      title: 'Institutionnel',
      subtitle: 'Soutenir la croissance des ports et faciliter les partenariats',
      description: 'Fédérer les institutions et organismes clés qui définissent le cadre réglementaire et stratégique des ports. Renforcer la diplomatie économique. Soutenir la croissance portuaire en mettant en lumière les grandes stratégies mondiales.',
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: Cog,
      title: 'Industrie portuaire',
      subtitle: 'L\'excellence opérationnelle au service de la compétitivité des ports',
      description: 'Construction et modernisation des infrastructures portuaires. Maintenance, manutention et dragage. Transformation digitale et automatisation. Solutions durables. Sécurité et cybersécurité portuaire.',
      color: 'from-indigo-500 to-indigo-700'
    },
    {
      icon: Ship,
      title: 'Exploitation & Gestion des ports',
      subtitle: 'Échange d\'expertise et coopération',
      description: 'Rencontres entre les ports du monde pour renforcer leur coopération et développer de nouveaux corridors maritimes. Espaces B2B et de networking ciblés conçus pour stimuler les échanges d\'expertise.',
      color: 'from-green-500 to-green-700'
    },
    {
      icon: GraduationCap,
      title: 'Académique et Formation',
      subtitle: 'Former les talents du secteur portuaire',
      description: 'Former les talents et répondre aux besoins évolutifs du secteur portuaire. Créer des passerelles entre institutions académiques et acteurs portuaires. Valoriser les formations spécialisées et les nouveaux métiers émergents.',
      color: 'from-purple-500 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 : HERO WORDPRESS - PARTICIPEZ AU SIB 2026
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-SIB-primary via-blue-800 to-indigo-900 text-white overflow-hidden">
        <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-SIB-gold rounded-full" />
          <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white rotate-45 transform" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-SIB-gold" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <Building2 className="w-4 h-4 text-SIB-gold" />
                <span className="text-sm font-semibold text-SIB-gold uppercase tracking-wider">
                  Devenez exposant au SIB 2026
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Participez au{' '}
                <span className="text-SIB-gold">SIB</span>{' '}
                2026
              </h1>

              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                En exposant au Salon International du B�timent et de leur Écosystème, vous vous positionnez 
                au cœur de l'innovation, de la coopération stratégique et du développement des 
                infrastructures portuaires mondiales. Que vous soyez institution, entreprise, port, 
                équipementier, startup ou organisme de formation, prenez votre place parmi les acteurs 
                qui façonnent l'avenir maritime à l'échelle internationale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={ROUTES.CONTACT}>
                  <Button
                    size="lg"
                    className="bg-SIB-gold text-SIB-primary hover:bg-yellow-400 font-bold text-lg px-8"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Nous contacter
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    document.getElementById('exhibitor-tiers')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-white text-white hover:bg-white/10 font-semibold"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Voir les offres
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all"
                >
                  <div className="text-3xl md:text-4xl font-bold text-SIB-gold mb-2">{stat.number}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 : POURQUOI PARTICIPER AU SIB 2026 ? (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.03] text-SIB-primary" scale={1.5} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-SIB-primary p-2 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-SIB-primary font-semibold">Pourquoi participer ?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi participer au <span className="text-SIB-primary">SIB 2026</span> ?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Un rendez-vous stratégique pour tisser des partenariats et explorer les opportunités économiques du secteur portuaire mondial et de son écosystème.
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
                    <div className="bg-SIB-primary/10 p-2 rounded-lg flex-shrink-0">
                      <Check className="h-5 w-5 text-SIB-primary" />
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
                  <div className="bg-SIB-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Un salon d'envergure mondiale
                  </h3>
                  <p className="text-gray-600">
                    Le plus grand salon portuaire d'Afrique et du monde arabe
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
                      <div className="text-2xl font-bold text-SIB-primary mb-1">{stat.number}</div>
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
                  <p className="font-semibold text-gray-900">1-3 Avril 2026</p>
                  <p className="text-sm text-gray-500">Parc d'Exposition Mohammed VI – Casablanca</p>
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
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-SIB-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
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
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-SIB-gold rounded-full" />
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
              <div className="bg-SIB-primary p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-SIB-primary font-semibold">Un positionnement pensé pour tous les acteurs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Rejoignez nos espaces thématiques d'<span className="text-SIB-primary">exposition</span>
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
                      <p className="text-sm text-SIB-primary font-medium mb-3">{space.subtitle}</p>
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
      <section className="py-12 bg-gradient-to-r from-SIB-primary to-indigo-600">
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
              <Button size="lg" className="bg-white text-SIB-primary hover:bg-blue-50 font-bold">
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
                    <span className="text-4xl font-bold text-SIB-primary">Sur devis</span>
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
            className="mt-12 text-center bg-gradient-to-r from-SIB-primary to-indigo-600 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">
              Besoin d'un forfait sur mesure pour votre équipe ?
            </h3>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-SIB-primary hover:bg-blue-50 font-bold">
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
        <MoroccanPattern className="opacity-[0.03] text-SIB-primary" scale={1.5} />

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
                <div className="bg-SIB-primary p-2 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className="text-SIB-primary font-semibold">Organisez votre participation !</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Infos <span className="text-SIB-primary">pratiques</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Lieu</h3>
                    <p className="text-gray-600">Parc d'Exposition Mohammed VI – Casablanca, Maroc</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Dates</h3>
                    <p className="text-gray-600">1-3 Avril 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Horaires</h3>
                    <p className="text-gray-600">9h30 à 18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Ticket className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Entrée</h3>
                    <p className="text-gray-600">Sur badge nominatif</p>
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
                  <div className="bg-SIB-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Contact Organisation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    LINECO EVENTS
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 text-SIB-primary flex-shrink-0" />
                    <p className="text-sm text-gray-700">19, rue Badr Assayab – 1er étage n°2, Casablanca – Maroc</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Mail className="h-5 w-5 text-SIB-primary flex-shrink-0" />
                    <a href="mailto:contact@sib2026.ma" className="text-sm text-SIB-primary hover:underline font-medium">
                      contact@sib2026.ma
                    </a>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Phone className="h-5 w-5 text-SIB-primary flex-shrink-0" />
                    <a href="tel:+212668385228" className="text-sm text-SIB-primary hover:underline font-medium">
                      +212 6 68 38 52 28
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={ROUTES.CONTACT}>
                    <Button className="w-full bg-SIB-primary text-white hover:bg-blue-700">
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
                Contactez notre équipe via le formulaire du site ou par e-mail : contact@sib2026.ma
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
