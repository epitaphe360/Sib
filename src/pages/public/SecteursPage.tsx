import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { usePageContent } from '../../hooks/usePageContent';
import {
  ScrollReveal, StaggerReveal, StaggerItem, HoverCard, HeroReveal,
  fadeUp, motion, AnimatePresence,
} from '../../components/ui/motion';

interface Secteur {
  id: number;
  name: string;
  subcategories: string[];
}

const secteurs: Secteur[] = [
  { id: 1, name: 'Gros Œuvre & Structure', subcategories: ['Matériaux de construction (ciment, béton, acier, verre, composites)', 'Produits chimiques et solutions de structure', 'Charpentes métalliques et bois', 'Étanchéité, isolation et imperméabilisation', 'Couvertures, tuiles et systèmes de façade', 'Outillage et composants du gros œuvre'] },
  { id: 2, name: 'Menuiserie & Fermeture', subcategories: ['Menuiserie bois, aluminium, PVC et mixte', 'Portes industrielles, portes blindées, fenêtres et vitrages', 'Quincaillerie, serrurerie, extrusion aluminium', 'Systèmes de fermeture et automatisation'] },
  { id: 3, name: 'Décoration & Aménagement Intérieur', subcategories: ['Ameublement et agencement intérieur', 'Éclairage, design et scénographie', 'Revêtements décoratifs, tissus, papiers peints', 'Artisanat marocain et création sur mesure'] },
  { id: 4, name: 'Climatisation, Sanitaire & Confort', subcategories: ['Chauffage, climatisation, ventilation', 'Sanitaire, robinetterie et plomberie', 'Revêtements sols et murs : carrelage, pierre, marbre, granit, parquet', 'Solutions de confort et de bien-être'] },
  { id: 5, name: 'Équipements Électriques & Technologies Intégrées', subcategories: ['Installations électriques, éclairage et sécurité', 'Domotique, smart building et automatisation', 'Ascenseurs, câblage et réseaux techniques', 'Énergies renouvelables, protection solaire et efficacité énergétique'] },
  { id: 6, name: 'Matériels, Machines & Outillage', subcategories: ['Équipements de chantier, grues et engins de levage', 'Outillage industriel et professionnel', 'Sécurité et gestion technique de chantier', 'Transport et logistique de construction'] },
  { id: 7, name: 'Environnement & Construction Durable', subcategories: ['Énergies propres et matériaux écologiques', 'Gestion des déchets et économie circulaire', 'Certification environnementale et construction responsable'] },
  { id: 8, name: 'Formation, Services & Institutions', subcategories: ['Formations techniques et spécialisées', 'Écoles, instituts et organismes professionnels', 'Associations, fédérations et ordres techniques', 'Bureaux d\'études, ingénierie et conseils'] },
  { id: 9, name: 'Immobilier, Financement & Investissement', subcategories: ['Promoteurs et constructeurs', 'Banques, assurances et financement de projets', 'Aménageurs, fonciers et cabinets de conseil', 'Coopération et partenariats africains'] },
  { id: 10, name: 'Technologies Numériques & Innovations', subcategories: ['BTP digitalisé, BIM, jumeaux numériques', 'Réalité augmentée, impression 3D, IA appliquée au bâtiment', 'Solutions logicielles et plateformes collaboratives', 'Smart cities et infrastructures connectées'] },
];

export default function SecteursPage() {
  const cms = usePageContent('secteurs-activites');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = secteurs.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subcategories.some((sub) => sub.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sib-navy to-sib-navy/90 text-white py-16 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <HeroReveal>
            <span className="inline-block px-4 py-1.5 rounded-full bg-sib-gold/20 text-sib-gold text-sm font-semibold mb-4">
              10 secteurs d'activité
            </span>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{cms.hero_title || 'Secteurs d\'Activités'}</h1>
          </HeroReveal>
          <HeroReveal delay={0.3}>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {cms.hero_subtitle || 'Tous les métiers du bâtiment, réunis sous un même toit. Plongez au cœur des univers du SIB, où se rencontrent innovation, savoir-faire et solutions concrètes pour construire l\'avenir.'}
            </p>
          </HeroReveal>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un secteur ou une sous-catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sib-gold/50 text-gray-800"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-12">
        <StaggerReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((secteur) => {
            const isOpen = expanded === secteur.id;
            return (
              <StaggerItem key={secteur.id}>
                <HoverCard
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : secteur.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-lg bg-sib-navy/10 flex items-center justify-center text-sib-navy font-bold text-sm">
                        {String(secteur.id).padStart(2, '0')}
                      </span>
                      <h3 className="font-bold text-gray-900">{secteur.name}</h3>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <div className="border-t border-gray-100 pt-4">
                            <ul className="space-y-2">
                              {secteur.subcategories.map((sub, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-sib-gold" />
                                  {sub}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </HoverCard>
              </StaggerItem>
            );
          })}
          </StaggerReveal>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun secteur ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}
