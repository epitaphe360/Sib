import React from 'react';
import { Wrench, GraduationCap, Briefcase, Tv, Handshake } from 'lucide-react';
import { usePageContent } from '../../hooks/usePageContent';
import { ScrollReveal, HeroReveal, StaggerReveal, fadeUp } from '../../components/ui/motion';

export default function EspacesSibPage() {
  const cms = usePageContent('espaces-sib');

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const defaultEspaces = [
    {
      icon: Wrench,
      title: cms.espace_1_title || '2 Espaces de Démonstration',
      description: cms.espace_1_desc || "Le SIB 2026 dispose de 2 espaces de démonstration conçus pour permettre aux professionnels du bâtiment de présenter leurs innovations en direct. Ces plateformes offrent une opportunité unique d'interagir avec les visiteurs, de valoriser les pratiques exemplaires et de démontrer concrètement la performance des matériaux, solutions et 30 applications techniques.",
    },
    {
      icon: GraduationCap,
      title: cms.espace_2_title || 'Espace Formation — SIB Academy',
      description: cms.espace_2_desc || "SIB Academy est le pôle formation du Salon. Cet espace regroupe les stands des Académies, Instituts, Universités, Écoles Privées et Centres Professionnels proposant des formations liées aux secteurs du Bâtiment, de l'Urbanisme et de l'Architecture. Plus de 20 conférences sont prévues avec des experts marocains et internationaux.",
    },
    {
      icon: Briefcase,
      title: cms.espace_3_title || 'Espace Recrutement',
      description: cms.espace_3_desc || "En partenariat avec l'Anapec, le SIB met à disposition des visiteurs un espace où il est permis de déposer son CV, de passer des entretiens et de rencontrer ses futurs employeurs directement pendant le salon.",
    },
    {
      icon: Tv,
      title: cms.espace_4_title || 'SIB TV',
      description: cms.espace_4_desc || 'SIB TV est la chaîne web officielle du salon. Avec ses plateaux TV, elle assure une couverture médiatique complète de l\'événement. Interviews, débats et reportages sont diffusés en continu pendant les 5 jours du salon, offrant une visibilité maximale aux exposants et partenaires.',
    },
    {
      icon: Handshake,
      title: cms.espace_5_title || 'URBA EVENT — B2B',
      description: cms.espace_5_desc || "URBA EVENT est le programme de rencontres d'affaires B2B du SIB. Pour l'édition 2026, 300 rencontres qualifiées sont planifiées entre exposants nationaux et internationaux. L'objectif : faciliter les partenariats stratégiques et la signature de contrats pendant les 5 jours du salon.",
    },
  ];

  const espaces = (() => {
    const raw = cms.espaces_json;
    if (!raw) {return defaultEspaces;}
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {return defaultEspaces;}
      const icons = [Wrench, GraduationCap, Briefcase, Tv, Handshake];
      return parsed.map((item: any, idx: number) => ({
        icon: icons[idx % icons.length],
        title: String(item?.title ?? ''),
        description: String(item?.description ?? ''),
      })).filter((e: any) => e.title);
    } catch {
      return defaultEspaces;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <HeroReveal>
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sib-gold/20 text-sib-gold text-sm font-semibold mb-4">
            {getCms('hero_badge', '5 espaces dédiés')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Espaces SIB'}</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {cms.hero_subtitle || "Parce que le SIB ne se résume pas qu'aux stands d'exposition, plusieurs espaces sont également mis en avant."}
          </p>
        </div>
      </div>
      </HeroReveal>

      {/* Espaces */}
      <StaggerReveal className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {espaces.map((espace, i) => {
            const Icon = espace.icon;
            return (
              <ScrollReveal key={i} variant={fadeUp} delay={i * 0.1}>
              <div
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-8 flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-sib-navy/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-sib-navy" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sib-navy mb-3 font-display">{espace.title}</h2>
                    <p className="text-gray-600 leading-relaxed">{espace.description}</p>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            );
          })}
        </div>
      </StaggerReveal>

      {/* CTA */}
      <ScrollReveal variant={fadeUp} delay={0.2}>
      <div className="bg-sib-navy/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-sib-navy mb-4 font-display">{getCms('cta_title', 'Intéressé par un espace ?')}</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            {getCms('cta_text', 'Contactez-nous pour en savoir plus sur les modalités de participation et de réservation.')}
          </p>
          <a
            href={getCms('cta_url', '/contact')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            style={{ background: '#C9A84C' }}
          >
            {getCms('cta_button', 'Contactez-nous')}
          </a>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
