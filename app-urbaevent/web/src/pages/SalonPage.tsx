import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, Building2, Home,
  TrendingUp, Hammer, Leaf, Lock, ArrowRight,
  MessageCircle, Star, Award, Shield,
} from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { useAuthStore } from '../store/authStore';
import { AccreditationGate } from '../components/common/AccreditationGate';

/* ─────────────────────────────────────────────────────────────
   DATA PAR SALON
───────────────────────────────────────────────────────────── */
const SALON_DATA = {
  sir: {
    code: 'SIR',
    name: 'Salon International de l\'Immobilier',
    tagline: 'Résidentiel · Commercial · Investissement',
    description:
      'Le SIR est la plateforme de référence au Maroc pour l\'immobilier résidentiel, commercial et les investissements fonciers. Promoteurs, investisseurs, agences et acheteurs se retrouvent pour conclure des affaires et découvrir les tendances du marché.',
    color: '#EB9A44',
    bgColor: '#FDF3E7',
    gradient: 'linear-gradient(135deg,#EB9A44,#C97B2A)',
    dates: 'Juin 2026',
    location: 'Casablanca, Maroc',
    venue: 'Office des Changes Exhibition Center',
    visitors: '8 000+',
    exhibitors: '180+',
    edition: '2ème édition',
    icon: <Home className="w-8 h-8" />,
    features: [
      { title: 'Catalogue Projets', desc: 'Parcourez l\'ensemble des projets immobiliers exposés' },
      { title: 'Simulation de Prêt', desc: 'Calculez votre financement en temps réel' },
      { title: 'Visite Virtuelle 3D', desc: 'Visitez les logements depuis votre mobile' },
      { title: 'Rendez-vous Promoteurs', desc: 'Prenez RDV directement avec les promoteurs' },
    ],
    highlights: [
      'Plus de 180 promoteurs et agences immobilières',
      'Zone financement & banques partenaires',
      'Espaces logements sociaux et moyen standing',
      'Village startup PropTech & FinTech',
    ],
    program: [
      { day: 'J1', title: 'Inauguration & Conférences d\'ouverture', type: 'opening' },
      { day: 'J2', title: 'Forum Financement & PropTech', type: 'forum' },
      { day: 'J3', title: 'Table ronde : Urbanisme durable', type: 'debate' },
      { day: 'J4', title: 'Networking & Speed dating BtoB', type: 'networking' },
    ],
  },
  sip: {
    code: 'SIP',
    name: 'Salon International de la Promotion',
    tagline: 'Promotion · Urbanisme · Smart City',
    description:
      'Le SIP réunit les promoteurs immobiliers, lotisseurs et acteurs du développement urbain autour des grandes problématiques de la ville de demain, du foncier et de la Smart City.',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    gradient: 'linear-gradient(135deg,#9C27B0,#7B1FA2)',
    dates: 'Mars 2027',
    location: 'Rabat, Maroc',
    venue: 'Centre International de Conférences de Rabat',
    visitors: '5 000+',
    exhibitors: '120+',
    edition: '1ère édition',
    icon: <TrendingUp className="w-8 h-8" />,
    features: [
      { title: 'Appels d\'Offres', desc: 'Accédez aux marchés publics et privés en cours' },
      { title: 'Matching Investisseurs', desc: 'Rencontrez les fonds d\'investissement ciblés' },
      { title: 'Foncier & Lotissements', desc: 'Découvrez les opportunités foncières nationales' },
      { title: 'Smart City Lab', desc: 'Espace dédié aux innovations urbaines' },
    ],
    highlights: [
      'Inauguration officielle par le Ministère de l\'Habitat',
      'Forum national sur la politique du logement',
      'Hackathon Smart City 48h',
      'Remise des Prix de l\'Innovation Urbaine',
    ],
    program: [
      { day: 'J1', title: 'Forum National Politique du Logement', type: 'forum' },
      { day: 'J2', title: 'Hackathon Smart City', type: 'workshop' },
      { day: 'J3', title: 'Conférences Aménagement & Foncier', type: 'conference' },
    ],
  },
  btp: {
    code: 'BTP',
    name: 'Salon International du BTP',
    tagline: 'Travaux Publics · Matériaux · Infrastructures',
    description:
      'Le Salon BTP est le carrefour annuel des professionnels du bâtiment et des travaux publics au Maroc : équipements lourds, matériaux de construction, ingénierie, sous-traitance et normes sectorielles.',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    gradient: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
    dates: 'Septembre 2026',
    location: 'Tanger, Maroc',
    venue: 'Tanger Free Zone Exhibition Park',
    visitors: '7 000+',
    exhibitors: '200+',
    edition: '3ème édition',
    icon: <Hammer className="w-8 h-8" />,
    features: [
      { title: 'Matériaux & Équipements', desc: 'Catalogue complet des fournisseurs BTP' },
      { title: 'Génie Civil', desc: 'Solutions pour infrastructures et ouvrages d\'art' },
      { title: 'Sous-traitance', desc: 'Bourse de sous-traitance B2B en ligne' },
      { title: 'Normes & Certifications', desc: 'Veille réglementaire et certifications qualité' },
    ],
    highlights: [
      'Zone Matériaux Innovants & Éco-construction',
      'Espace Équipements Lourds en démonstration live',
      'Forum Grands Chantiers du Maroc 2026',
      'Remise Labels Qualité Construction',
    ],
    program: [
      { day: 'J1', title: 'Inauguration & Forum Grands Chantiers', type: 'opening' },
      { day: 'J2', title: 'Démonstrations Équipements Lourds', type: 'demo' },
      { day: 'J3', title: 'Table ronde Normes & Qualité', type: 'debate' },
      { day: 'J4', title: 'Bourse Sous-traitance & Networking', type: 'networking' },
    ],
  },
  sie: {
    code: 'SIE',
    name: 'Salon International de l\'Environnement',
    tagline: 'Green Tech · Énergies Renouvelables · RSE',
    description:
      'Le SIE est le forum de référence des solutions vertes, des énergies renouvelables et du développement durable appliqué à l\'environnement urbain et industriel au Maroc et en Afrique.',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    gradient: 'linear-gradient(135deg,#388E3C,#1B5E20)',
    dates: 'Octobre 2027',
    location: 'Marrakech, Maroc',
    venue: 'Palais des Congrès de Marrakech',
    visitors: '4 000+',
    exhibitors: '100+',
    edition: '1ère édition',
    icon: <Leaf className="w-8 h-8" />,
    features: [
      { title: 'Énergies Renouvelables', desc: 'Solaire, éolien, biomasse et stockage d\'énergie' },
      { title: 'Bâtiment Passif', desc: 'Solutions HQE, LEED et économies d\'énergie' },
      { title: 'Mobilité Verte', desc: 'Véhicules électriques et infrastructures de charge' },
      { title: 'Label HQE', desc: 'Certification et audit environnemental des bâtiments' },
    ],
    highlights: [
      'Conférence Internationale sur le Changement Climatique',
      'Pavillon Afrique Verte & Solutions durables',
      'Startup Green Tech Competition',
      'Remise Prix Ville Verte du Maroc',
    ],
    program: [
      { day: 'J1', title: 'Conférence Internationale Climat', type: 'conference' },
      { day: 'J2', title: 'Green Tech Competition', type: 'workshop' },
      { day: 'J3', title: 'Forum Énergies Renouvelables Afrique', type: 'forum' },
    ],
  },
} as const;

type SalonId = keyof typeof SALON_DATA;

const TYPE_COLORS: Record<string, string> = {
  opening: '#4598D1',
  forum: '#EB9A44',
  debate: '#9C27B0',
  networking: '#4CAF50',
  workshop: '#D32F2F',
  conference: '#2E7D32',
  demo: '#FF6F00',
};

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
interface SalonPageProps {
  salonId: SalonId;
}

export default function SalonPage({ salonId }: SalonPageProps) {
  const salon = SALON_DATA[salonId];
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!salon) {
    navigate(ROUTES.SALON_SELECTION);
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9F9FF]">

      {/* ── HERO ────────────────────────────────────── */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: salon.gradient }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Back */}
          <Link
            to={ROUTES.SALON_SELECTION}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tous les salons
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
              <div className="text-white">{salon.icon}</div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-black bg-white/20 border border-white/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {salon.code}
                </span>
                <span className="text-xs text-white/60 font-medium">{salon.edition}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-1">{salon.name}</h1>
              <p className="text-white/70 text-sm sm:text-base font-medium mb-4">{salon.tagline}</p>

              {/* Info chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Calendar, text: salon.dates },
                  { icon: MapPin, text: salon.location },
                  { icon: Users, text: `${salon.visitors} visiteurs` },
                  { icon: Building2, text: `${salon.exhibitors} exposants` },
                ].map((chip) => (
                  <span
                    key={chip.text}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 border border-white/20 px-3 py-1.5 rounded-full"
                  >
                    <chip.icon className="w-3.5 h-3.5" />
                    {chip.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40 Z" fill="#F9F9FF" />
          </svg>
        </div>
      </section>

      {/* ── MAIN CONTENT ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">

        {/* Auth gate banner */}
        {!isAuthenticated && (
          <div
            className="flex flex-col sm:flex-row items-center gap-4 bg-white border rounded-2xl p-4 sm:p-5 shadow-sm mb-8"
            style={{ borderColor: `${salon.color}30` }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${salon.color}15` }}>
                <Lock className="w-5 h-5" style={{ color: salon.color }} />
              </div>
              <p className="text-[#647483] text-sm">
                <span className="font-bold text-[#333333]">Connexion requise</span> — Inscrivez-vous gratuitement pour accéder à toutes les fonctionnalités du {salon.code}.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
              <Link to={ROUTES.LOGIN} className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all" style={{ borderColor: salon.color, color: salon.color }}>
                Connexion
              </Link>
              <Link to={ROUTES.REGISTER} className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:opacity-90" style={{ background: salon.gradient }}>
                S'inscrire
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#333333] mb-3">À propos du {salon.code}</h2>
              <p className="text-[#647483] leading-relaxed text-sm sm:text-base">{salon.description}</p>
              <ul className="mt-4 space-y-2">
                {salon.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-[#647483]">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: salon.color }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fonctionnalités */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#333333] mb-4">Fonctionnalités disponibles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {salon.features.map((f, i) => (
                  <AccreditationGate key={f.title} requiredLevel={i > 1 ? 2 : 1} mode="blur">
                    <div
                      className="rounded-xl p-4 border transition-shadow hover:shadow-md"
                      style={{ borderColor: `${salon.color}20`, backgroundColor: salon.bgColor }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${salon.color}20` }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: salon.color }} />
                      </div>
                      <h3 className="font-bold text-[#333333] text-sm mb-1">{f.title}</h3>
                      <p className="text-[#647483] text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </AccreditationGate>
                ))}
              </div>
            </div>

            {/* Programme */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#333333] mb-4">Programme du salon</h2>
              <div className="space-y-3">
                {salon.program.map((p) => (
                  <div key={p.day} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:border-gray-100 transition-colors">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{ backgroundColor: TYPE_COLORS[p.type] ?? salon.color }}
                    >
                      {p.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#333333] text-sm truncate">{p.title}</p>
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize mt-0.5"
                        style={{
                          backgroundColor: `${TYPE_COLORS[p.type] ?? salon.color}15`,
                          color: TYPE_COLORS[p.type] ?? salon.color,
                        }}
                      >
                        {p.type}
                      </span>
                    </div>
                    {isAuthenticated && (
                      <button
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                        style={{ backgroundColor: `${salon.color}15`, color: salon.color }}
                      >
                        + Ajouter
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (1/3) ── */}
          <div className="space-y-5">

            {/* Accreditation levels card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-black text-[#333333] mb-3 uppercase tracking-wide">Votre accès</h3>
              <div className="space-y-2">
                {[
                  { level: 1, label: 'Visiteur Standard', icon: Users, color: '#4598D1' },
                  { level: 2, label: 'Visiteur VIP', icon: Star, color: '#FFD700' },
                  { level: 3, label: 'Exposant', icon: Award, color: '#EB9A44' },
                  { level: 4, label: 'Partenaire', icon: Shield, color: '#4CAF50' },
                ].map((lvl) => (
                  <div
                    key={lvl.level}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border"
                    style={{ borderColor: `${lvl.color}20`, backgroundColor: `${lvl.color}08` }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: lvl.color }}>
                      <lvl.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#333333]">{lvl.label}</span>
                  </div>
                ))}
              </div>
              {!isAuthenticated && (
                <Link
                  to={ROUTES.REGISTER}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: salon.gradient }}
                >
                  S'inscrire gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Contact / RDV */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: salon.gradient, borderColor: 'transparent' }}
            >
              <h3 className="text-sm font-black text-white mb-2">Exposer au {salon.code} ?</h3>
              <p className="text-white/75 text-xs mb-4 leading-relaxed">
                Réservez votre stand et bénéficiez d'une visibilité maximale auprès de {salon.visitors} visiteurs professionnels.
              </p>
              <Link
                to={ROUTES.EXHIBITOR_SUBSCRIPTION}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white rounded-xl text-sm font-bold transition-all hover:shadow-md"
                style={{ color: salon.color }}
              >
                <MessageCircle className="w-4 h-4" />
                Demander un stand
              </Link>
            </div>

            {/* Venue */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-black text-[#333333] mb-3">Lieu du salon</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: salon.color }} />
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">{salon.venue}</p>
                    <p className="text-xs text-[#647483]">{salon.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: salon.color }} />
                  <p className="text-sm text-[#647483]">{salon.dates}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
