import React from 'react';
import { Calendar, Users, Building2 } from 'lucide-react';
import { usePageContent } from '../../hooks/usePageContent';
import { ScrollReveal, HeroReveal, fadeUp } from '../../components/ui/motion';

interface Edition {
  year: number;
  edition: string;
  theme?: string;
  dates?: string;
  lieu?: string;
  exposants?: string;
  visiteurs?: string;
  highlight?: string;
}

const defaultEditions: Edition[] = [
  { year: 2026, edition: '20ème', dates: 'Du 25 au 29 Novembre', lieu: 'Parc d\'Exposition Mohammed VI, El Jadida', exposants: '600', highlight: '40 ans du SIB — Édition anniversaire exceptionnelle' },
  { year: 2024, edition: '19ème', theme: 'Mise en œuvre Maîtrisée, Matériaux et Bâtiments Valorisés', dates: 'Du 20 au 24 Novembre', lieu: 'Parc d\'Exposition Mohammed VI, El Jadida', exposants: '500', visiteurs: '200 000' },
  { year: 2022, edition: '18ème', theme: 'Innovation et résilience au service d\'un cadre de vie meilleur', dates: 'Du 23 au 27 Novembre', lieu: 'Parc d\'Exposition Mohammed VI, El Jadida', exposants: '500', visiteurs: '160 000' },
  { year: 2018, edition: '17ème', theme: 'Construire pour mieux vivre ensemble', dates: 'Du 21 au 25 Novembre', lieu: 'Foire Internationale de Casablanca', exposants: '700', visiteurs: '190 000' },
  { year: 2016, edition: '16ème', theme: 'Vers un Cadre Bâti Durable et Harmonieux', dates: 'Du 23 au 27 Novembre', lieu: 'Foire Internationale de Casablanca', exposants: '660 (dont 340 étrangers)', visiteurs: '182 000' },
  { year: 2014, edition: '15ème', theme: 'Construire la Ville de Demain', dates: 'Du 26 au 30 Novembre', lieu: 'Foire Internationale de Casablanca', exposants: '651 (dont 331 étrangers)', visiteurs: '175 000' },
  { year: 2012, edition: '14ème', theme: 'Vivre la ville', dates: 'Du 21 au 25 Novembre', lieu: 'Foire Internationale de Casablanca', exposants: '611 (dont 330 étrangers)', visiteurs: '132 000' },
  { year: 2010, edition: '13ème', theme: 'Convergence Habitat Urbanisme «Habitat Social» «Villes Nouvelles»', dates: 'Du 1 au 7 Novembre', lieu: 'Foire Internationale de Casablanca', exposants: '583 (dont 326 étrangers)', visiteurs: '129 000' },
  { year: 2008, edition: '12ème', theme: 'L\'innovation et le développement durable dans le bâtiment', dates: 'Du 5 au 9 Novembre', lieu: 'Office des Foires et Expositions de Casablanca', exposants: '407 (dont 232 étrangers)', visiteurs: '129 072' },
  { year: 2006, edition: '11ème', theme: 'Le partenariat dans l\'immobilier', dates: 'Du 22 au 26 Novembre', lieu: 'Office des Foires et Expositions de Casablanca', exposants: '360 (dont 160 étrangers)', visiteurs: '106 000', highlight: 'URBACOM devient organisateur délégué' },
  { year: 2004, edition: '10ème', theme: 'Convergence Habitat Urbanisme', exposants: '260 (dont 64 étrangers)', visiteurs: '50 000' },
  { year: 2002, edition: '9ème', theme: 'Investir dans l\'immobilier en toute sécurité', exposants: '200 (dont 41 étrangers)', visiteurs: '40 000' },
  { year: 2000, edition: '8ème', theme: 'La performance au service du social', exposants: '200', visiteurs: '45 000' },
  { year: 1998, edition: '7ème', theme: 'Quelle politique de logement pour le Maroc de demain', exposants: '178 (dont 21 étrangers)', visiteurs: '45 000' },
  { year: 1996, edition: '6ème', theme: 'Les performances et la qualité dans la production de l\'habitat social', exposants: '157 (dont 45 étrangers)', visiteurs: '42 000' },
  { year: 1994, edition: '5ème', theme: 'La stratégie de l\'intervention de l\'état dans le domaine de l\'habitat social', exposants: '250 (dont 70 étrangers)', visiteurs: '41 000' },
  { year: 1992, edition: '4ème', theme: 'Les nouvelles approches et la recherche développement dans le secteur du BTP', exposants: '223 (dont 49 étrangers)', visiteurs: '40 000' },
  { year: 1990, edition: '3ème', theme: 'Le bâtiment, la qualité au service de la sécurité et du développement des échanges', exposants: '190 (dont 52 étrangers)', visiteurs: '41 000' },
  { year: 1988, edition: '2ème', theme: 'Le bâtiment, culture, technologie et développement', exposants: '108', visiteurs: '20 000' },
  { year: 1986, edition: '1ère', theme: 'Le bâtiment au service du développement et des échanges', exposants: '90', visiteurs: '20 000', highlight: 'Création du Salon International du Bâtiment' },
];

export default function EditionsPage() {
  const cms = usePageContent('editions');

  const getCms = (key: string, fallback: string) => {
    const value = cms[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  };

  const editions: Edition[] = (() => {
    const raw = cms.timeline_json;
    if (!raw) {return defaultEditions;}
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {return defaultEditions;}
      return parsed
        .map((item: any) => ({
          year: Number(item?.year),
          edition: String(item?.edition ?? ''),
          theme: item?.theme ? String(item.theme) : undefined,
          dates: item?.dates ? String(item.dates) : undefined,
          lieu: item?.lieu ? String(item.lieu) : undefined,
          exposants: item?.exposants ? String(item.exposants) : undefined,
          visiteurs: item?.visiteurs ? String(item.visiteurs) : undefined,
          highlight: item?.highlight ? String(item.highlight) : undefined,
        }))
        .filter((ed: Edition) => Number.isFinite(ed.year) && ed.edition.length > 0);
    } catch {
      return defaultEditions;
    }
  })();

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Hero */}
      <HeroReveal>
      <div className="relative min-h-[40vh] bg-[#0A0F1E] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-12" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/80 via-[#0A0F1E]/40 to-[#0A0F1E]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#E7D192] text-sm font-semibold mb-5">
            {getCms('hero_badge', "40 ans d'histoire")}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-white">{cms.hero_title || 'Nos Éditions'}</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {cms.hero_subtitle || "Depuis 1986, le SIB accompagne l'essor du secteur du bâtiment au Maroc et en Afrique."}
          </p>
        </div>
      </div>
      </HeroReveal>

      {/* Timeline */}
      <ScrollReveal variant={fadeUp} delay={0.1}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C9A84C] via-white/10 to-transparent" />

            <div className="space-y-6">
              {editions.map((ed) => {
                const isCurrent = ed.year === 2026;
                return (
                  <div key={ed.year} className="relative flex gap-6">
                    {/* Dot */}
                    <div className={`relative z-10 w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCurrent
                        ? 'bg-[#C9A84C] text-[#0A0F1E] shadow-lg shadow-[#C9A84C]/30'
                        : 'bg-white/5 border border-white/20 text-white/60'
                    }`}>
                      {ed.year}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 rounded-xl p-6 ${
                      isCurrent
                        ? 'bg-[#C9A84C]/10 border border-[#C9A84C]/30'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className={`text-lg font-bold ${isCurrent ? 'text-[#E7D192]' : 'text-white/80'}`}>
                          {ed.edition} Édition
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#E7D192] text-xs font-semibold border border-[#C9A84C]/30">
                            À venir
                          </span>
                        )}
                      </div>

                      {ed.theme && (
                        <p className={`text-sm font-medium mb-2 ${isCurrent ? 'text-white/70' : 'text-white/50'} italic`}>
                          « {ed.theme} »
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {ed.dates && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/60' : 'text-white/40'}`}>
                            <Calendar className="w-4 h-4" /> {ed.dates}
                          </span>
                        )}
                        {ed.lieu && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/60' : 'text-white/40'}`}>
                            📍 {ed.lieu}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-1">
                        {ed.exposants && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/60' : 'text-white/40'}`}>
                            <Building2 className="w-4 h-4" /> {ed.exposants} exposants
                          </span>
                        )}
                        {ed.visiteurs && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/60' : 'text-white/40'}`}>
                            <Users className="w-4 h-4" /> {ed.visiteurs} visiteurs
                          </span>
                        )}
                      </div>

                      {ed.highlight && (
                        <p className={`mt-2 text-sm ${isCurrent ? 'text-[#C9A84C]/80' : 'text-white/30'}`}>
                          ★ {ed.highlight}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}
