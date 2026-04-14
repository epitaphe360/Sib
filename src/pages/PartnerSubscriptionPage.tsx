import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Check, X, Crown, Zap, Star, Award, 
  Users,
  MapPin, CalendarDays, Clock, CreditCard,
  MessageCircle, Ticket, Mail,
  Phone, Handshake, Eye,
  Video, Mic, Radio, TrendingUp
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
    name: 'Sponsor Officiel',
    price: 500000,
    currency: 'MAD',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité maximale — Partenaire stratégique',
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
    cta: 'Devenir Sponsor Officiel',
    color: 'bg-rose-50',
  },
];

export default function PartnerSubscriptionPage() {
  const navigate = useNavigate();
  // t used for future translations
  const { t: _t } = useTranslation();

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
    { number: '200 000+', label: 'Visiteurs professionnels' },
    { number: '600+', label: 'Exposants' },
    { number: '20', label: 'Conférences' },
    { number: '5', label: 'Jours de salon' }
  ];

  // Pourquoi devenir partenaire - WordPress
  const whyPartner = [
    'Positionner votre marque comme leader ou acteur engagé du secteur du bâtiment.',
    'Bénéficier d\'une visibilité premium : branding, conférences, ateliers, supports print & digitaux.',
    'Accéder à des services VIP, rencontres de haut niveau et conférences exclusives.',
    'Créer des activations ciblées (sponsoring de zone, d\'événement, contenu co-marqué).'
  ];

  // Avantages médias
  const mediaAdvantages = [
    { icon: Video, title: 'Capsules vidéo "Inside SIB"', description: 'Visibilité vidéo marquée à votre image' },
    { icon: Mic, title: 'Podcast SIB Talks', description: 'Interview audio dans notre podcast officiel' },
    { icon: Radio, title: 'Interview Live Studio', description: 'Passage dans "Meet The Leaders"' },
    { icon: Eye, title: 'Bannière Web rotative', description: 'Présence visuelle sur tout le site' },
    { icon: Mail, title: 'Newsletters & E-mailings', description: 'Présence dans toutes les communications' },
    { icon: TrendingUp, title: 'Section "Top Innovations"', description: 'Mise en avant de vos solutions' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 : HERO - DEVENEZ PARTENAIRE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white overflow-hidden">
        <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-300 rounded-full" />
          <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white rotate-45 transform" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-yellow-300" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
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
                  Devenez partenaire SIB 2026
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Devenez{' '}
                <span className="text-yellow-300">Partenaire</span>{' '}
                du SIB 2026
              </h1>

              <p className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed">
                Associez votre marque à un événement de référence du secteur du bâtiment mondial. 
                Bénéficiez d'une visibilité premium, de services VIP et d'opportunités de networking 
                exclusives auprès des décideurs internationaux.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    document.getElementById('partner-tiers')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-indigo-300 text-indigo-900 hover:bg-indigo-400 font-bold text-lg px-8"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Voir les offres
                </Button>
                <Link to={ROUTES.CONTACT}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 font-semibold"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Nous contacter
                  </Button>
                </Link>
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
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{stat.number}</div>
                  <div className="text-sm text-indigo-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 : POURQUOI DEVENIR PARTENAIRE (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <MoroccanPattern className="opacity-[0.03] text-amber-600" scale={1.5} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <span className="text-indigo-600 font-semibold">Partenariat stratégique</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi devenir partenaire de <span className="text-indigo-600">SIB</span> ?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Associez votre marque à un événement de référence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyPartner.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-4 items-start bg-white p-6 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                  <Check className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-gray-700 leading-relaxed">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 : AVANTAGES MÉDIAS (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-indigo-600 font-semibold">Visibilité maximale</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une couverture <span className="text-indigo-600">médiatique</span> complète
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Profitez d'une présence sur tous les canaux de communication du SIB
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaAdvantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 border border-indigo-100 text-center">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-2xl w-16 h-16 mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <advantage.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{advantage.title}</h3>
                  <p className="text-sm text-gray-600">{advantage.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 : BESOIN D'INFORMATIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Besoin d'informations complémentaires ?
            </h2>
            <p className="text-indigo-100 mb-6">
              Notre équipe est à votre disposition pour vous accompagner dans votre projet de partenariat.
            </p>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 font-bold">
                <Mail className="mr-2 h-5 w-5" />
                Contactez-nous
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 : FORFAITS PARTENAIRES (App existante)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="partner-tiers" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
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
              <div className="bg-amber-600 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span className="text-indigo-600 font-semibold">Forfaits Partenaires</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choisissez le forfait qui correspond le mieux à vos besoins
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Maximisez votre expérience au SIB
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center max-w-7xl mx-auto">
            {partnerTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative overflow-hidden h-full w-full max-w-[400px] flex flex-col transition-transform hover:scale-[1.02] ${tier.color}`}
              >
                {/* Header */}
                <div className="p-5 pb-5 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{tier.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">{tier.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{tier.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-600">{tier.currency}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-5 flex-grow">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Fonctionnalités</h4>
                  <ul className="space-y-2">
                    {tier.features.slice(0, 4).map((feature) => (
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

                  {tier.features.length > 4 && (
                    <p className="text-xs text-gray-500 mt-2">+ {tier.features.length - 4} fonctionnalités supplémentaires</p>
                  )}

                  {/* Benefits */}
                  <h4 className="text-xs font-semibold text-gray-900 mt-5 mb-3 uppercase tracking-wider">Avantages</h4>
                  <ul className="space-y-2 mb-4">
                    {tier.benefits.slice(0, 2).map((benefit) => (
                      <li key={benefit} className="text-sm text-gray-700 flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {tier.benefits.length > 2 && (
                    <p className="text-xs text-gray-500">+ {tier.benefits.length - 2} avantages supplémentaires</p>
                  )}
                </div>

                {/* CTA */}
                <div className="p-5 border-t border-gray-200">
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold hover:shadow-lg transition-all"
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
            className="mt-12 text-center bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">
              Besoin d'un forfait sur mesure pour votre équipe ?
            </h3>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 font-bold">
                <Users className="mr-2 h-5 w-5" />
                Contactez-nous
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 : INFOS PRATIQUES (WordPress)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
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
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className="text-indigo-600 font-semibold">Organisez votre participation !</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Infos <span className="text-indigo-600">pratiques</span>
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
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-indigo-600" />
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
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 p-8">
                <div className="text-center mb-6">
                  <div className="bg-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
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
                    <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700">19, rue Badr Assayab – 1er étage n°2, Casablanca – Maroc</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Mail className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <a href="mailto:contact@sibevent.com" className="text-sm text-amber-600 hover:underline font-medium">
                      contact@sibevent.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <Phone className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <a href="tel:+212668385228" className="text-sm text-amber-600 hover:underline font-medium">
                      +212 6 68 38 52 28
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={ROUTES.CONTACT}>
                    <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
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
              <div className="bg-amber-600 p-2 rounded-lg">
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
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-amber-600">1</span>
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
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-amber-600">2</span>
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
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-amber-600">3</span>
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
                Contactez notre équipe via le formulaire du site ou par e-mail : contact@sibevent.com
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
