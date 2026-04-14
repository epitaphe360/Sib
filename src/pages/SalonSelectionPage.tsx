import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Calendar, MapPin, Users, Building2, Globe, Leaf, Ship, Home, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../lib/routes';

interface Salon {
  id: string;
  code: string;
  name: string;
  fullName: string;
  description: string;
  dates: string;
  location: string;
  visitors: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  route: string;
  edition: string;
  isActive: boolean;
}

const SALONS: Salon[] = [
  {
    id: 'sib',
    code: 'SIB',
    name: 'Salon International du Bâtiment',
    fullName: 'SIB 2026',
    description: 'Le rendez-vous incontournable des professionnels de la construction, de l\'architecture et du BTP au Maroc.',
    dates: '25 - 29 Nov 2026',
    location: 'El Jadida, Maroc',
    visitors: '6 000+',
    color: '#4598D1',
    bgColor: '#EBF5FB',
    borderColor: '#4598D1',
    icon: <Building2 className="w-8 h-8" />,
    route: ROUTES.HOME,
    edition: '4ème édition',
    isActive: true,
  },
  {
    id: 'sir',
    code: 'SIR',
    name: 'Salon International de l\'Immobilier',
    fullName: 'SIR 2026',
    description: 'La plateforme de référence dédiée à l\'immobilier résidentiel, commercial et aux investissements fonciers.',
    dates: 'Juin 2026',
    location: 'Casablanca, Maroc',
    visitors: '8 000+',
    color: '#EB9A44',
    bgColor: '#FDF3E7',
    borderColor: '#EB9A44',
    icon: <Home className="w-8 h-8" />,
    route: '/salon/sir',
    edition: '2ème édition',
    isActive: false,
  },
  {
    id: 'sip',
    code: 'SIP',
    name: 'Salon International de la Promotion',
    fullName: 'SIP 2027',
    description: 'L\'espace dédié aux promoteurs immobiliers, aux lotisseurs et aux acteurs du développement urbain.',
    dates: 'Mars 2027',
    location: 'Rabat, Maroc',
    visitors: '5 000+',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    borderColor: '#4CAF50',
    icon: <TrendingUp className="w-8 h-8" />,
    route: '/salon/sip',
    edition: '1ère édition',
    isActive: false,
  },
  {
    id: 'siport',
    code: 'SIPORT',
    name: 'Salon International du Port',
    fullName: 'SIPORT 2027',
    description: 'Le carrefour des acteurs portuaires, maritimes et logistiques pour l\'Afrique et le bassin méditerranéen.',
    dates: 'Septembre 2027',
    location: 'Tanger, Maroc',
    visitors: '4 500+',
    color: '#1B365D',
    bgColor: '#E8EDF4',
    borderColor: '#1B365D',
    icon: <Ship className="w-8 h-8" />,
    route: '/salon/siport',
    edition: '3ème édition',
    isActive: false,
  },
  {
    id: 'sie',
    code: 'SIE',
    name: 'Salon International de l\'Environnement',
    fullName: 'SIE 2027',
    description: 'Le forum des solutions vertes, des énergies renouvelables et du développement durable en milieu urbain.',
    dates: 'Octobre 2027',
    location: 'Marrakech, Maroc',
    visitors: '3 500+',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    borderColor: '#2E7D32',
    icon: <Leaf className="w-8 h-8" />,
    route: '/salon/sie',
    edition: '1ère édition',
    isActive: false,
  },
];

const STATS = [
  { label: 'Salons', value: '5', icon: <Globe className="w-5 h-5" /> },
  { label: 'Exposants', value: '500+', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Visiteurs/an', value: '25 000+', icon: <Users className="w-5 h-5" /> },
  { label: 'Pays', value: '40+', icon: <MapPin className="w-5 h-5" /> },
];

export default function SalonSelectionPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleSalonClick = (salon: Salon) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { redirectTo: salon.route, salonCode: salon.code } });
      return;
    }
    navigate(salon.route);
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#4598D1] via-[#2E7DB8] to-[#1B4F72] text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,215,0,0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(235,154,68,0.3) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Urbacom Logo / Branding */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <span className="text-2xl font-bold tracking-widest text-white">URBACOM</span>
            </div>
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#EB9A44]/30 border border-[#EB9A44]/50 text-sm font-medium mb-6">
            <Calendar className="w-4 h-4 mr-2 text-[#FFD700]" />
            <span>Plateforme digitale multi-salons 2026 – 2027</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Bienvenue sur{' '}
            <span className="text-[#FFD700]">UrbaEvent</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            La plateforme digitale officielle d'Urbacom regroupant les 5 salons professionnels
            dédiés à l'urbanisme, au bâtiment, à l'immobilier et à l'environnement au Maroc.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-center mb-2 text-[#FFD700]">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 80" className="w-full h-12" preserveAspectRatio="none">
            <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="#F9F9FF" />
          </svg>
        </div>
      </section>

      {/* Salon Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            Choisissez votre Salon
          </h2>
          <p className="text-[#647483] text-lg max-w-2xl mx-auto">
            {isAuthenticated
              ? 'Sélectionnez le salon auquel vous souhaitez accéder.'
              : 'Connectez-vous ou inscrivez-vous pour accéder aux fonctionnalités exclusives de chaque salon.'}
          </p>
        </div>

        {/* Auth Banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-[#4598D1]/10 border border-[#4598D1]/30 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#4598D1] rounded-full p-2">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#333333]">Accès restreint</p>
                <p className="text-[#647483] text-sm">
                  Créez votre compte UrbaEvent pour accéder à tous les salons et leurs fonctionnalités.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                to={ROUTES.LOGIN}
                className="px-5 py-2.5 rounded-full border-2 border-[#4598D1] text-[#4598D1] font-semibold text-sm hover:bg-[#4598D1] hover:text-white transition-all duration-200"
              >
                Se connecter
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-5 py-2.5 rounded-full bg-[#EB9A44] text-white font-semibold text-sm hover:bg-[#d4883a] transition-all duration-200 shadow-md"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        )}

        {/* Salon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SALONS.map((salon) => {
            const isLocked = !isAuthenticated;
            return (
              <div
                key={salon.id}
                onClick={() => handleSalonClick(salon)}
                className={`
                  relative bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer
                  ${isLocked
                    ? 'opacity-85 hover:opacity-100 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    : `border-transparent hover:shadow-xl hover:-translate-y-1`
                  }
                  ${!isLocked ? `hover:border-[${salon.color}]/40` : ''}
                `}
                style={{
                  boxShadow: isLocked ? undefined : '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                {/* Active badge */}
                {salon.isActive && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-[#4CAF50] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Ouvert
                    </span>
                  </div>
                )}

                {/* Lock overlay for non-authenticated */}
                {isLocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-[#333333] rounded-full p-3 mb-3 shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[#333333] font-semibold text-sm">Connexion requise</p>
                    <p className="text-[#647483] text-xs mt-1">Cliquez pour vous connecter</p>
                  </div>
                )}

                {/* Card header with color band */}
                <div
                  className="h-3 w-full"
                  style={{ backgroundColor: salon.color }}
                />

                <div className="p-6">
                  {/* Icon and code */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: salon.bgColor, color: salon.color }}
                    >
                      {salon.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: salon.bgColor, color: salon.color }}
                      >
                        {salon.code}
                      </span>
                      <span className="text-xs text-[#647483]">{salon.edition}</span>
                    </div>
                  </div>

                  {/* Salon name */}
                  <h3 className="text-lg font-bold text-[#333333] mb-2 leading-tight">
                    {salon.name}
                  </h3>
                  <p className="text-[#647483] text-sm mb-5 leading-relaxed line-clamp-2">
                    {salon.description}
                  </p>

                  {/* Info chips */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-[#647483]">
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: salon.color }} />
                      <span>{salon.dates}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#647483]">
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: salon.color }} />
                      <span>{salon.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#647483]">
                      <Users className="w-4 h-4 flex-shrink-0" style={{ color: salon.color }} />
                      <span>{salon.visitors} visiteurs attendus</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all duration-200"
                    style={
                      isLocked
                        ? { backgroundColor: '#F1F5F9', color: '#64748B' }
                        : { backgroundColor: salon.color, color: '#FFFFFF' }
                    }
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Connexion requise
                      </>
                    ) : (
                      <>
                        Accéder au salon
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Urbacom Section */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#4598D1]/10 text-[#4598D1] text-sm font-medium mb-4">
                À propos d'Urbacom
              </div>
              <h2 className="text-3xl font-bold text-[#333333] mb-6">
                L'organisateur des grands salons professionnels du Maroc
              </h2>
              <p className="text-[#647483] leading-relaxed mb-6">
                Urbacom est l'organisation de référence pour les salons professionnels dédiés
                à l'urbanisme, au bâtiment, à l'immobilier et à l'environnement au Maroc.
                Depuis plus de 10 ans, Urbacom connecte les acteurs clés du secteur pour
                favoriser l'innovation et les échanges B2B.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Années d\'expérience', value: '10+' },
                  { label: 'Partenaires', value: '200+' },
                  { label: 'Exposants fidèles', value: '85%' },
                  { label: 'Pays représentés', value: '40+' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F9F9FF] rounded-xl p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-[#4598D1]">{item.value}</div>
                    <div className="text-[#647483] text-sm mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditation levels */}
            <div>
              <h3 className="text-xl font-bold text-[#333333] mb-6">
                Niveaux d'accréditation UrbaEvent
              </h3>
              <div className="space-y-3">
                {[
                  {
                    level: 'Niveau 1',
                    title: 'Visiteur Standard',
                    desc: 'Catalogue exposants · Plan interactif · Programme · E-Badge',
                    color: '#4598D1',
                    bg: '#EBF5FB',
                  },
                  {
                    level: 'Niveau 2',
                    title: 'Visiteur VIP',
                    desc: 'Standard + Networking · Zones VIP · Conférences privées',
                    color: '#FFD700',
                    bg: '#FFFDE7',
                  },
                  {
                    level: 'Niveau 3',
                    title: 'Exposant',
                    desc: 'Standard + Dashboard stats · Lead Scanner · Rendez-vous B2B',
                    color: '#EB9A44',
                    bg: '#FDF3E7',
                  },
                  {
                    level: 'Niveau 4',
                    title: 'Partenaire',
                    desc: 'Exposant + Matching B2B prioritaire · Annuaire · Stats multi-salons',
                    color: '#4CAF50',
                    bg: '#E8F5E9',
                  },
                ].map((item) => (
                  <div
                    key={item.level}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
                  >
                    <div
                      className="rounded-lg px-2.5 py-1 text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: item.bg, color: item.color }}
                    >
                      {item.level}
                    </div>
                    <div>
                      <p className="font-semibold text-[#333333] text-sm">{item.title}</p>
                      <p className="text-[#647483] text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#4598D1] to-[#2E7DB8] py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à rejoindre l'écosystème UrbaEvent ?
          </h2>
          <p className="text-blue-100 mb-8">
            Inscrivez-vous gratuitement et obtenez votre QR Code universel (#UVE) pour accéder
            à tous les salons Urbacom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.REGISTER}
              className="px-8 py-4 rounded-full bg-[#EB9A44] text-white font-bold hover:bg-[#d4883a] transition-all duration-200 shadow-lg text-lg"
            >
              Créer mon compte gratuit
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="px-8 py-4 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-[#4598D1] transition-all duration-200 text-lg"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
