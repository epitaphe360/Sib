import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock, ArrowRight, Calendar, MapPin, Users, Building2,
  Globe, Leaf, Home, TrendingUp, Hammer, ChevronRight,
  Star, Shield, Wifi, Award,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../lib/routes';

/* ─────────────────────────────────────────────────────────────
   DONNÉES SALONS
───────────────────────────────────────────────────────────── */
interface Salon {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  dates: string;
  location: string;
  visitors: string;
  color: string;
  bgColor: string;
  gradient: string;
  icon: React.ReactNode;
  route: string;
  edition: string;
  isActive: boolean;
  features: string[];
}

const SALONS: Salon[] = [
  {
    id: 'sib',
    code: 'SIB',
    name: 'Salon International du Bâtiment',
    tagline: 'Construction & Architecture',
    description:
      'Le rendez-vous incontournable des professionnels de la construction, de l\'architecture et de l\'habitat durable au Maroc.',
    dates: '25 – 29 Nov 2026',
    location: 'El Jadida, Maroc',
    visitors: '6 000+',
    color: '#4598D1',
    bgColor: '#EBF5FB',
    gradient: 'linear-gradient(135deg,#4598D1,#2E7DB8)',
    icon: <Building2 className="w-7 h-7" />,
    route: ROUTES.HOME,
    edition: '4ème édition',
    isActive: true,
    features: ['Catalogue exposants', 'Plan interactif', 'Conférences', 'Networking B2B'],
  },
  {
    id: 'sir',
    code: 'SIR',
    name: 'Salon International de l\'Immobilier',
    tagline: 'Résidentiel & Commercial',
    description:
      'La plateforme de référence dédiée à l\'immobilier résidentiel, commercial et aux investissements fonciers.',
    dates: 'Juin 2026',
    location: 'Casablanca, Maroc',
    visitors: '8 000+',
    color: '#EB9A44',
    bgColor: '#FDF3E7',
    gradient: 'linear-gradient(135deg,#EB9A44,#C97B2A)',
    icon: <Home className="w-7 h-7" />,
    route: ROUTES.SALON_SIR,
    edition: '2ème édition',
    isActive: false,
    features: ['Catalogue projets', 'Simulation prêt', 'Visite virtuelle 3D', 'Rencontres promoteurs'],
  },
  {
    id: 'sip',
    code: 'SIP',
    name: 'Salon International de la Promotion',
    tagline: 'Promotion & Développement Urbain',
    description:
      'L\'espace dédié aux promoteurs immobiliers, aux lotisseurs et aux acteurs du développement urbain.',
    dates: 'Mars 2027',
    location: 'Rabat, Maroc',
    visitors: '5 000+',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    gradient: 'linear-gradient(135deg,#9C27B0,#7B1FA2)',
    icon: <TrendingUp className="w-7 h-7" />,
    route: ROUTES.SALON_SIP,
    edition: '1ère édition',
    isActive: false,
    features: ['Appels d\'offres', 'Matching investisseurs', 'Foncier & Lotissements', 'Smart City'],
  },
  {
    id: 'btp',
    code: 'BTP',
    name: 'Salon International du BTP',
    tagline: 'Travaux Publics & Infrastructures',
    description:
      'Le carrefour des acteurs du bâtiment et des travaux publics : équipements, matériaux, ingénierie et infrastructures.',
    dates: 'Septembre 2026',
    location: 'Tanger, Maroc',
    visitors: '7 000+',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    gradient: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
    icon: <Hammer className="w-7 h-7" />,
    route: ROUTES.SALON_BTP,
    edition: '3ème édition',
    isActive: false,
    features: ['Matériaux & Équipements', 'Génie civil', 'Sous-traitance', 'Normes & Certifications'],
  },
  {
    id: 'sie',
    code: 'SIE',
    name: 'Salon International de l\'Environnement',
    tagline: 'Green Tech & Développement Durable',
    description:
      'Le forum des solutions vertes, des énergies renouvelables et du développement durable en milieu urbain.',
    dates: 'Octobre 2027',
    location: 'Marrakech, Maroc',
    visitors: '4 000+',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    gradient: 'linear-gradient(135deg,#388E3C,#1B5E20)',
    icon: <Leaf className="w-7 h-7" />,
    route: ROUTES.SALON_SIE,
    edition: '1ère édition',
    isActive: false,
    features: ['Énergies renouvelables', 'Bâtiment passif', 'Mobilité verte', 'Label HQE'],
  },
];

const PLATFORM_STATS = [
  { label: 'Salons', value: '5', icon: Globe },
  { label: 'Exposants', value: '500+', icon: Building2 },
  { label: 'Visiteurs/an', value: '25 000+', icon: Users },
  { label: 'Pays', value: '40+', icon: MapPin },
];

const ACCREDITATION_LEVELS = [
  {
    level: 1,
    title: 'Visiteur Standard',
    color: '#4598D1',
    bg: '#EBF5FB',
    icon: Users,
    perks: ['Catalogue exposants', 'Plan interactif', 'Programme conférences', 'E-Badge QR'],
  },
  {
    level: 2,
    title: 'Visiteur VIP',
    color: '#FFD700',
    bg: '#FFFDE7',
    icon: Star,
    perks: ['Tout le Niveau 1', 'Networking', 'Zones VIP', 'Conférences privées'],
  },
  {
    level: 3,
    title: 'Exposant',
    color: '#EB9A44',
    bg: '#FDF3E7',
    icon: Award,
    perks: ['Tout le Niveau 1', 'Dashboard stats', 'Lead Scanner', 'RDV B2B'],
  },
  {
    level: 4,
    title: 'Partenaire',
    color: '#4CAF50',
    bg: '#E8F5E9',
    icon: Shield,
    perks: ['Tout Niveau 3', 'Matching B2B prioritaire', 'Annuaire décideurs', 'Stats multi-salons'],
  },
];

/* ─────────────────────────────────────────────────────────────
   COMPOSANT
───────────────────────────────────────────────────────────── */
export default function SalonSelectionPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSalonClick = (salon: Salon) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, {
        state: { redirectTo: salon.route, salonCode: salon.code },
      });
      return;
    }
    navigate(salon.route);
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]">

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D2137] via-[#1B4F72] to-[#2E7DB8] text-white">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#4598D1]/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#EB9A44]/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Urbacom badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5">
              <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
              <span className="text-sm font-bold tracking-widest text-white/90 uppercase">Urbacom</span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/60 font-medium">Plateforme digitale officielle</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] mb-4 sm:mb-6">
              Urba<span className="text-[#4598D1]">Event</span>
            </h1>
            <p className="text-base sm:text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed px-2">
              La plateforme digitale des{' '}
              <span className="text-white font-semibold">5 grands salons professionnels</span>{' '}
              du bâtiment, de l'immobilier et de l'environnement au Maroc.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {PLATFORM_STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 text-center hover:bg-white/15 transition-colors duration-200"
              >
                <s.icon className="w-5 h-5 text-[#FFD700] mx-auto mb-2 opacity-90" />
                <div className="text-2xl sm:text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs sm:text-sm text-blue-300 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#F9F9FF" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          AUTH BANNER (non connecté)
      ════════════════════════════════════════ */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-[#4598D1]/25 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#4598D1]/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-[#4598D1]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#333333] text-sm sm:text-base">Accès restreint</p>
                <p className="text-[#647483] text-xs sm:text-sm truncate">
                  Créez votre compte gratuit pour accéder aux salons et obtenir votre E-Badge.
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
              <Link
                to={ROUTES.LOGIN}
                className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-full border-2 border-[#4598D1] text-[#4598D1] text-sm font-bold hover:bg-[#4598D1] hover:text-white transition-all duration-200"
              >
                Connexion
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-full bg-[#EB9A44] text-white text-sm font-bold hover:bg-[#D4883A] transition-all duration-200 shadow-md"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SALON CARDS
      ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#333333]">
            Choisissez votre Salon
          </h2>
          <p className="text-[#647483] mt-1.5 text-sm sm:text-base">
            {isAuthenticated
              ? 'Sélectionnez un salon pour accéder à son espace dédié.'
              : 'Connectez-vous pour débloquer l\'accès complet à chaque salon.'}
          </p>
        </div>

        {/* Grid: 1 col mobile → 2 cols tablet → 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SALONS.map((salon) => {
            const locked = !isAuthenticated;
            const isHovered = hoveredId === salon.id;

            return (
              <div
                key={salon.id}
                onClick={() => handleSalonClick(salon)}
                onMouseEnter={() => setHoveredId(salon.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100"
                style={{
                  boxShadow: isHovered
                    ? `0 20px 40px -12px ${salon.color}35, 0 8px 16px -8px rgba(0,0,0,0.08)`
                    : '0 2px 12px rgba(0,0,0,0.06)',
                  transform: isHovered && !locked ? 'translateY(-4px)' : 'translateY(0)',
                  borderColor: isHovered ? `${salon.color}40` : 'rgb(243,244,246)',
                }}
              >
                {/* Top gradient bar */}
                <div className="h-1.5 w-full" style={{ background: salon.gradient }} />

                {/* Active badge */}
                {salon.isActive && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#E8F5E9] border border-[#4CAF50]/30 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
                    <span className="text-[10px] font-black text-[#2E7D32] uppercase tracking-wide">Ouvert</span>
                  </div>
                )}

                {/* Lock overlay on hover (non-connected) */}
                {locked && (
                  <div className="absolute inset-0 z-10 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2 shadow-lg">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-[#333333] text-sm">Connexion requise</p>
                    <p className="text-[#647483] text-xs mt-0.5">Cliquer pour accéder</p>
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  {/* Icon + code */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                      style={{ background: salon.gradient, color: 'white' }}
                    >
                      {salon.icon}
                    </div>
                    <div className="text-right">
                      <span
                        className="block text-xs font-black px-2.5 py-1 rounded-full mb-1"
                        style={{ backgroundColor: salon.bgColor, color: salon.color }}
                      >
                        {salon.code}
                      </span>
                      <span className="block text-[10px] text-[#647483] font-medium">{salon.edition}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-base sm:text-lg font-black text-[#333333] leading-tight mb-0.5">
                    {salon.name}
                  </h3>
                  <p className="text-xs font-semibold mb-2" style={{ color: salon.color }}>
                    {salon.tagline}
                  </p>
                  <p className="text-[#647483] text-sm leading-relaxed mb-4 line-clamp-2">
                    {salon.description}
                  </p>

                  {/* Info pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs text-[#647483] bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {salon.dates}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#647483] bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {salon.location}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#647483] bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {salon.visitors}
                    </span>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-1 mb-5">
                    {salon.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#647483]">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: salon.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                    style={
                      locked
                        ? { backgroundColor: '#F1F5F9', color: '#94A3B8' }
                        : { background: salon.gradient, color: '#fff' }
                    }
                  >
                    {locked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Se connecter pour accéder
                      </>
                    ) : (
                      <>
                        Accéder au salon
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          NIVEAUX D'ACCRÉDITATION
      ════════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#4598D1] mb-3">
              Système d'accréditation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#333333]">
              Votre niveau d'accès UrbaEvent
            </h2>
            <p className="text-[#647483] mt-2 max-w-xl mx-auto text-sm sm:text-base">
              4 niveaux progressifs pour une expérience personnalisée à chaque salon.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACCREDITATION_LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className="rounded-2xl border p-5 hover:shadow-lg transition-shadow duration-200"
                style={{ borderColor: `${lvl.color}30`, backgroundColor: lvl.bg }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: lvl.color }}
                  >
                    <lvl.icon className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
                  >
                    Niv. {lvl.level}
                  </span>
                </div>
                <h3 className="font-black text-[#333333] text-sm mb-3">{lvl.title}</h3>
                <ul className="space-y-1.5">
                  {lvl.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-[#647483]">
                      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: lvl.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          À PROPOS URBACOM
      ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#EB9A44] mb-3">
              À propos
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#333333] mb-4 leading-snug">
              Urbacom, l'organisateur des grands salons professionnels du Maroc
            </h2>
            <p className="text-[#647483] leading-relaxed mb-6 text-sm sm:text-base">
              Depuis plus de 10 ans, Urbacom connecte les décideurs, les professionnels et les
              investisseurs des secteurs du bâtiment, de l'immobilier et de l'environnement.
              Avec 5 salons couvrant l'ensemble de l'écosystème urbain, UrbaEvent est la
              plateforme digitale officielle au service de ces rencontres.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { v: '10+', l: 'Ans d\'expérience' },
                { v: '200+', l: 'Partenaires' },
                { v: '85%', l: 'Exposants fidèles' },
                { v: '40+', l: 'Pays représentés' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:border-[#4598D1]/30 transition-colors"
                >
                  <div className="text-2xl font-black text-[#4598D1]">{s.v}</div>
                  <div className="text-[#647483] text-xs mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Wifi,
                color: '#4598D1',
                title: 'Temps réel',
                desc: 'Notifications et mises à jour en direct sur les activités de chaque salon.',
              },
              {
                icon: Shield,
                color: '#4CAF50',
                title: 'Sécurisé',
                desc: 'Accréditation par QR Code unique et système de badge digital certifié.',
              },
              {
                icon: Award,
                color: '#EB9A44',
                title: 'Multi-salons',
                desc: 'Un seul compte pour accéder aux 5 salons Urbacom avec un E-Badge universel.',
              },
              {
                icon: Users,
                color: '#9C27B0',
                title: 'Networking B2B',
                desc: 'Matching intelligent et prise de rendez-vous en quelques clics.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${f.color}15` }}
                >
                  <f.icon className="w-4.5 h-4.5" style={{ color: f.color }} />
                </div>
                <h4 className="font-bold text-[#333333] text-sm mb-1">{f.title}</h4>
                <p className="text-[#647483] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#4598D1] via-[#2E7DB8] to-[#1B4F72] py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Inscription gratuite</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black mb-4">
            Rejoignez l'écosystème UrbaEvent
          </h2>
          <p className="text-blue-200 mb-8 text-sm sm:text-base max-w-xl mx-auto">
            Créez votre compte gratuit et recevez instantanément votre{' '}
            <span className="text-white font-bold">QR Code universel #UVE</span> — votre badge
            d'entrée et carte de visite pour tous les salons Urbacom.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.REGISTER}
              className="px-7 py-4 rounded-full bg-[#EB9A44] text-white font-black text-sm sm:text-base hover:bg-[#D4883A] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Créer mon compte gratuit →
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="px-7 py-4 rounded-full border-2 border-white/60 text-white font-bold text-sm sm:text-base hover:bg-white/10 hover:border-white transition-all"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
