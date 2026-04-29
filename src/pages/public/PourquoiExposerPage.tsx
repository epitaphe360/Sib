import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Globe, Target, BarChart3, Handshake, Eye, Award } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard,
  AnimatedCounter, HeroReveal, fadeUp, scaleUp,
} from '../../components/ui/motion';

const arguments_exposer_static = [
  { icon: Users, title: '200 000+ visiteurs', desc: 'Architectes, ingénieurs, promoteurs, décideurs publics et privés venus du Maroc, d\'Afrique et du monde entier.' },
  { icon: Globe, title: '50 pays représentés', desc: '600 exposants et 1 500 marques internationales réunis sur 35 000 m² : pavillons nationaux et délégations institutionnelles.' },
  { icon: Target, title: 'Visibilité renforcée', desc: 'Plan média international ambitieux, présence digitale soutenue, couverture presse et vidéos diffusées sur SIB TV et les plateformes officielles.' },
  { icon: BarChart3, title: '300 rencontres B2B', desc: 'Des échanges ciblés organisés via URBA EVENT, la plateforme digitale connectée du salon. Chaque stand devient un espace de connexion.' },
  { icon: Handshake, title: '80% de reconduction', desc: 'Un taux de fidélisation exceptionnel, reflet de la confiance des exposants et de la qualité du salon.' },
  { icon: Award, title: 'Édition anniversaire', desc: 'Pour ses 40 ans, le SIB franchit un cap : plus d\'espace, plus d\'exposants, des zones thématiques repensées et des espaces de démonstration interactifs.' },
];

const secteurs_cles = [
  'Gros Œuvre & Structure', 'Menuiserie & Fermeture', 'Décoration & Aménagement',
  'Climatisation & Sanitaire', 'Équipements Électriques', 'Matériels & Machines',
  'Environnement Durable', 'Formation & Institutions', 'Immobilier & Financement',
  'Technologies Numériques',
];

const chiffres = [
  { value: '600+', label: 'Exposants' },
  { value: '200 000+', label: 'Visiteurs' },
  { value: '35 000 m²', label: 'Surface' },
  { value: '50', label: 'Pays' },
  { value: '5', label: 'Jours' },
  { value: '10', label: 'Secteurs' },
];

export default function PourquoiExposerPage() {
  const cms = usePageContent('pourquoi-exposer');

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const chiffres = (() => {
    const raw = cms.stats_json;
    if (!raw) {return [
      { value: '600+', label: 'Exposants' },
      { value: '200 000+', label: 'Visiteurs' },
      { value: '35 000 m²', label: 'Surface' },
      { value: '50', label: 'Pays' },
      { value: '5', label: 'Jours' },
      { value: '10', label: 'Secteurs' },
    ];}
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [
        { value: '600+', label: 'Exposants' },
        { value: '200 000+', label: 'Visiteurs' },
        { value: '35 000 m²', label: 'Surface' },
        { value: '50', label: 'Pays' },
        { value: '5', label: 'Jours' },
        { value: '10', label: 'Secteurs' },
      ];
    }
  })();

  const secteurs_cles = (() => {
    const raw = cms.sectors_json;
    if (!raw) {return [
      'Gros Œuvre & Structure', 'Menuiserie & Fermeture', 'Décoration & Aménagement',
      'Climatisation & Sanitaire', 'Équipements Électriques', 'Matériels & Machines',
      'Environnement Durable', 'Formation & Institutions', 'Immobilier & Financement',
      'Technologies Numériques',
    ];}
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((s: unknown) => String(s)) : [];
    } catch {
      return [
        'Gros Œuvre & Structure', 'Menuiserie & Fermeture', 'Décoration & Aménagement',
        'Climatisation & Sanitaire', 'Équipements Électriques', 'Matériels & Machines',
        'Environnement Durable', 'Formation & Institutions', 'Immobilier & Financement',
        'Technologies Numériques',
      ];
    }
  })();

  const arguments_exposer = [
    { icon: Users, title: cms.arg_1_title || '200 000+ visiteurs', desc: cms.arg_1_desc || "Architectes, ingénieurs, promoteurs, décideurs publics et privés venus du Maroc, d'Afrique et du monde entier." },
    { icon: Globe, title: cms.arg_2_title || '50 pays représentés', desc: cms.arg_2_desc || '600 exposants et 1 500 marques internationales réunis sur 35 000 m².' },
    { icon: Target, title: cms.arg_3_title || 'Visibilité renforcée', desc: cms.arg_3_desc || "Plan média international, présence digitale, couverture presse et vidéos sur SIB TV." },
    { icon: BarChart3, title: cms.arg_4_title || '300 rencontres B2B', desc: cms.arg_4_desc || 'Échanges ciblés organisés via URBA EVENT, la plateforme digitale connectée du salon.' },
    { icon: Handshake, title: cms.arg_5_title || '80% de reconduction', desc: cms.arg_5_desc || "Un taux de fidélisation exceptionnel, reflet de la confiance des exposants et de la qualité du salon." },
    { icon: Award, title: cms.arg_6_title || 'Édition anniversaire 40 ans', desc: cms.arg_6_desc || "Plus d'espace, plus d'exposants, des zones thématiques repensées et des espaces de démonstration interactifs." },
  ];
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Hero */}
      <div className="relative min-h-[50vh] bg-[#0A0F1E] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/80 via-[#0A0F1E]/40 to-[#0A0F1E]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 container mx-auto px-4 py-24 text-center">
          <HeroReveal>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-white">{cms.hero_title || 'Pourquoi Exposer au SIB ?'}</h1>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
              {cms.hero_subtitle || "Le rendez-vous incontournable du bâtiment en Afrique. Participez à l'édition anniversaire des 40 ans du SIB aux côtés de 600 exposants et 200 000 visiteurs professionnels."}
            </p>
          </HeroReveal>
          <HeroReveal delay={0.3}>
            <Link
              to={ROUTES.EXHIBITOR_SUBSCRIPTION}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A84C] text-[#0A0F1E] rounded-lg font-bold text-lg hover:bg-[#E7D192] transition-all duration-300 hover:scale-105 transform shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              {getCms('hero_cta', 'Réservez votre stand')}
            </Link>
          </HeroReveal>
        </div>
      </div>

      {/* Chiffres */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {chiffres.map((c) => (
            <StaggerItem key={c.label}>
              <HoverCard className="bg-white/5 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10 h-full hover:border-[#C9A84C]/30 transition-colors">
                <AnimatedCounter value={c.value} className="text-2xl font-bold text-[#E7D192] block" />
                <div className="text-sm text-white/50 mt-1">{c.label}</div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Arguments */}
      <div className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-white mb-10 text-center font-display">
            {getCms('reasons_title', "6 raisons d'exposer")}
          </h2>
        </ScrollReveal>
        <StaggerReveal slow className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arguments_exposer.map((arg, i) => (
            <StaggerItem key={i}>
              <HoverCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full hover:border-[#C9A84C]/30 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/20 flex items-center justify-center mb-5">
                  <arg.icon className="w-7 h-7 text-[#C9A84C]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{arg.title}</h3>
                <p className="text-white/60 leading-relaxed">{arg.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>

      {/* Secteurs */}
      <div className="border-t border-white/5 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white mb-8 text-center font-display">
              {getCms('sectors_title', 'Secteurs représentés')}
            </h2>
          </ScrollReveal>
          <StaggerReveal className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {secteurs_cles.map((s) => (
              <StaggerItem key={s}>
                <span className="inline-block px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm font-medium text-white/70 hover:border-[#C9A84C]/40 hover:text-white transition-all duration-300 cursor-default">
                  {s}
                </span>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#C9A84C]/10 border-t border-[#C9A84C]/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal variant={scaleUp}>
            <Eye className="w-12 h-12 text-[#C9A84C] mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4 font-display">{getCms('cta_title', 'Prêt à exposer ?')}</h3>
            <p className="text-white/60 max-w-xl mx-auto mb-8">
              {getCms('cta_text', 'Réservez votre stand dès maintenant et bénéficiez des meilleurs emplacements pour la 20ème édition du SIB.')}
            </p>
            <Link
              to={ROUTES.EXHIBITOR_SUBSCRIPTION}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A84C] text-[#0A0F1E] rounded-lg font-bold text-lg hover:bg-[#E7D192] transition-all duration-300 hover:scale-105 transform"
            >
              {getCms('cta_button', 'Demander un devis')}
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
