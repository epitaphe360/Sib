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

const editions: Edition[] = [
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <HeroReveal>
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sib-gold/20 text-sib-gold text-sm font-semibold mb-4">
            40 ans d'histoire
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Nos Éditions'}</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {cms.hero_subtitle || 'Depuis 1986, le SIB accompagne l\'essor du secteur du bâtiment au Maroc et en Afrique.'}
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
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sib-gold via-sib-navy/30 to-gray-200" />

            <div className="space-y-6">
              {editions.map((ed, i) => {
                const isCurrent = ed.year === 2026;
                return (
                  <div key={ed.year} className="relative flex gap-6">
                    {/* Dot */}
                    <div className={`relative z-10 w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCurrent
                        ? 'bg-sib-gold text-sib-navy shadow-lg shadow-sib-gold/30'
                        : 'bg-white border-2 border-gray-200 text-gray-700'
                    }`}>
                      {ed.year}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 rounded-xl p-6 ${
                      isCurrent
                        ? 'bg-sib-navy text-white shadow-lg'
                        : 'bg-white border border-gray-100 shadow-sm'
                    }`}>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className={`text-lg font-bold ${isCurrent ? 'text-sib-gold' : 'text-sib-navy'}`}>
                          {ed.edition} Édition
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-sib-gold/20 text-sib-gold text-xs font-semibold">
                            À venir
                          </span>
                        )}
                      </div>

                      {ed.theme && (
                        <p className={`text-sm font-medium mb-2 ${isCurrent ? 'text-white/80' : 'text-gray-700'} italic`}>
                          « {ed.theme} »
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {ed.dates && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/70' : 'text-gray-500'}`}>
                            <Calendar className="w-4 h-4" /> {ed.dates}
                          </span>
                        )}
                        {ed.lieu && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/70' : 'text-gray-500'}`}>
                            📍 {ed.lieu}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-1">
                        {ed.exposants && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/70' : 'text-gray-500'}`}>
                            <Building2 className="w-4 h-4" /> {ed.exposants} exposants
                          </span>
                        )}
                        {ed.visiteurs && (
                          <span className={`flex items-center gap-1.5 ${isCurrent ? 'text-white/70' : 'text-gray-500'}`}>
                            <Users className="w-4 h-4" /> {ed.visiteurs} visiteurs
                          </span>
                        )}
                      </div>

                      {ed.highlight && (
                        <p className={`mt-2 text-sm ${isCurrent ? 'text-white/60' : 'text-gray-400'}`}>
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
