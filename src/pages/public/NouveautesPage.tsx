import React from 'react';
import { MapPin, Zap, Smartphone, Battery, Eye, Cpu, Presentation, Tv, Users } from 'lucide-react';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard, HeroReveal,
} from '../../components/ui/motion';

const nouveautes = [
  {
    icon: Zap,
    title: '40 ans d\'excellence — Édition anniversaire',
    desc: 'Le SIB 2026 célèbre 40 ans d\'histoire et sa 20ᵉ édition. Un événement pensé pour valoriser les savoir-faire, connecter les acteurs et ouvrir de nouveaux horizons.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: MapPin,
    title: '35 000 m² d\'exposition',
    desc: 'Un espace agrandi et optimisé au Parc d\'Exposition Mohammed VI d\'El Jadida (3ᵉ édition consécutive sur ce site). Parcours de visite fluide, structuré et immersif.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users,
    title: '600 exposants — 1 500 marques',
    desc: 'Entreprises, institutions, start-ups et marques internationales de 50 pays réunies autour d\'un même objectif : construire l\'avenir. 80% de reconduction d\'exposants.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Smartphone,
    title: 'URBA EVENT — Plateforme B2B digitale',
    desc: '300 rencontres B2B planifiées via la plateforme digitale connectée du salon. Application mobile pour badges, networking et gestion des rendez-vous.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Presentation,
    title: '2 Espaces de Démonstration',
    desc: 'Des zones dédiées aux applications réelles et à la performance des matériaux. 30 applications techniques pour voir les innovations en action.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Tv,
    title: 'SIB TV — Chaîne officielle du salon',
    desc: 'Créée et produite par URBACOM, SIB TV diffuse sur YouTube et les réseaux sociaux du salon : interviews en direct, reportages exclusifs et capsules quotidiennes.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Battery,
    title: 'Entrée gratuite',
    desc: 'L\'accès au salon est entièrement gratuit sur présentation d\'un badge électronique téléchargeable en ligne, d\'une invitation ou d\'une carte de visite professionnelle.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Cpu,
    title: '20 conférences & programme scientifique',
    desc: 'Un programme riche animé par des experts marocains et internationaux. Conférences, panels, forums et cérémonies officielles tout au long des 5 jours.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Eye,
    title: 'Campagne 360° & visibilité internationale',
    desc: 'Affichage urbain, campagnes digitales ciblées (LinkedIn, Facebook, Instagram, Google), presse spécialisée BTP, radio, TV et emailings personnalisés.',
    color: 'bg-orange-50 text-orange-600',
  },
];

export default function NouveautesPage() {
  const cms = usePageContent('nouveautes');
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <HeroReveal>
            <span className="inline-block px-4 py-1.5 rounded-full bg-sib-gold/20 text-sib-gold text-sm font-semibold mb-4">
              SIB 2026
            </span>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Nouveautés'}</h1>
          </HeroReveal>
          <HeroReveal delay={0.3}>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {cms.hero_subtitle || 'Découvrez les innovations et les changements majeurs de cette 20ème édition du SIB.'}
            </p>
          </HeroReveal>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-16">
        <StaggerReveal slow className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nouveautes.map((item, i) => (
            <StaggerItem key={i}>
              <HoverCard className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-5`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </div>
  );
}
