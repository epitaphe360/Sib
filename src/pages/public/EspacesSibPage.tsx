import React from 'react';
import { Wrench, GraduationCap, Briefcase, Tv, Handshake, ArrowRight } from 'lucide-react';
import { usePageContent } from '../../hooks/usePageContent';
import { ScrollReveal, HeroReveal, StaggerReveal, StaggerItem } from '../../components/ui/motion';

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
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      <div className="relative h-[58vh] min-h-[380px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&w=1920&q=80"
            alt="Espaces SIB"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/75 via-[#0A0F1E]/60 to-[#0A0F1E]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <HeroReveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/35 text-[#C9A84C] text-sm font-semibold mb-6">
              {getCms('hero_badge', '5 espaces dédiés')}
            </span>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display">
              {cms.hero_title || 'Espaces SIB'}
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.3}>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              {cms.hero_subtitle || "Parce que le SIB ne se résume pas qu'aux stands d'exposition, plusieurs espaces sont également mis en avant."}
            </p>
          </HeroReveal>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <StaggerReveal className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {espaces.map((espace, i) => {
            const Icon = espace.icon;
            return (
              <StaggerItem key={i}>
                <article className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 hover:border-[#C9A84C]/45 transition-colors">
                  <div className="w-14 h-14 rounded-xl border border-[#C9A84C]/35 bg-[#C9A84C]/12 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-[#C9A84C]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-3 font-display leading-snug">{espace.title}</h2>
                  <p className="text-white/65 leading-relaxed text-sm">{espace.description}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>

      <section className="relative py-20 border-t border-white/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-4">
              {getCms('cta_title', 'Intéressé par un espace ?')}
            </h2>
            <p className="text-white/65 mb-8 text-lg">
              {getCms('cta_text', 'Contactez-nous pour en savoir plus sur les modalités de participation et de réservation.')}
            </p>
            <a
              href={getCms('cta_url', '/contact')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C9A84C] text-[#0A0F1E] font-semibold hover:bg-[#E7D192] transition-colors"
            >
              {getCms('cta_button', 'Contactez-nous')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
