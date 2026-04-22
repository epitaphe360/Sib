/**
 * SIB 2026 — OrganizersSection
 * Organisateurs & partenaires institutionnels, style epure et raffine.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface OrganizerItem {
  role: string;
  name: string;
  acronym: string;
  description: string;
  category: 'tutelle' | 'partenaire' | 'organisateur';
}

const organizers: OrganizerItem[] = [
  {
    role: 'Sous le Haut Patronage de',
    name: 'Sa Majesté le Roi Mohammed VI',
    acronym: '♛',
    description: 'Royaume du Maroc',
    category: 'tutelle',
  },
  {
    role: 'Organisateur Principal',
    name: "Ministère de l'Habitat et de la Politique de la Ville",
    acronym: 'MHPV',
    description: 'Aménagement du Territoire · Urbanisme · Habitat',
    category: 'tutelle',
  },
  {
    role: 'Partenaire Co-organisateur',
    name: 'Agence Marocaine de Développement des Investissements et des Exportations',
    acronym: 'AMDIE',
    description: 'Promotion des investissements & exportations au Maroc',
    category: 'partenaire',
  },
  {
    role: 'Partenaire Co-organisateur',
    name: 'Fédération des Industries des Matériaux de Construction',
    acronym: 'FMC',
    description: 'Représentant des industriels du bâtiment au Maroc',
    category: 'partenaire',
  },
  {
    role: 'Partenaire Co-organisateur',
    name: 'Fédération Nationale du Bâtiment et des Travaux Publics',
    acronym: 'FNBTP',
    description: 'Fédération des entrepreneurs BTP marocains',
    category: 'partenaire',
  },
  {
    role: 'Organisateur Délégué',
    name: 'URBACOM — Agence Communication & Événementiel',
    acronym: 'URBACOM',
    description: 'Organisateur délégué du SIB depuis 2006 · Casablanca',
    category: 'organisateur',
  },
];

const categoryMeta: Record<OrganizerItem['category'], { label: string; accent: string }> = {
  tutelle: { label: 'Tutelle', accent: 'text-accent-600 dark:text-accent-500' },
  partenaire: { label: 'Partenaire', accent: 'text-primary-600 dark:text-primary-400' },
  organisateur: { label: 'Organisateur Délégué', accent: 'text-success-600 dark:text-success-500' },
};

export const OrganizersSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-24 bg-neutral-50 dark:bg-neutral-950 border-t border-b border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">
            Partenaires & Organisateurs
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Sous l'égide des <span className="sib-text-gradient">Institutions</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-accent-500/70" />
            <div className="w-1.5 h-1.5 rotate-45 bg-accent-500" />
            <div className="h-px w-16 bg-accent-500/70" />
          </div>
        </motion.div>

        {/* Ministère — feature card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 p-7 sm:p-9 rounded-2xl mb-8 bg-white dark:bg-neutral-900 border border-accent-500/20 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-2xl bg-accent-50 dark:bg-accent-500/10 border border-accent-500/20">
            <img
              src="/logo-ministere.png"
              alt="Ministère de l'Équipement et de l'Eau — Royaume du Maroc"
              className="h-20 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo-ministere.svg';
              }}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1.5 text-accent-600 dark:text-accent-500">
              Sous le Haut Patronage de Sa Majesté le Roi Mohammed VI
            </p>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">
              Ministère de l'Habitat et de la Politique de la Ville
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
              Aménagement du Territoire National · Urbanisme · Habitat · Politique de la Ville
            </p>
          </div>
        </motion.div>

        {/* Partner cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizers.slice(2).map((org, i) => {
            const meta = categoryMeta[org.category];
            return (
              <motion.div
                key={org.acronym}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl p-5 flex items-start gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-center leading-tight bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 ${meta.accent} ${org.acronym.length > 5 ? 'text-[0.6rem]' : 'text-xs'}`}
                >
                  {org.acronym}
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-semibold tracking-[0.15em] uppercase ${meta.accent}`}>
                    {meta.label}
                  </span>
                  <h4 className="font-semibold text-sm text-neutral-900 dark:text-white leading-snug mt-0.5 mb-1">
                    {org.name}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">
                    {org.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center text-xs text-neutral-500 dark:text-neutral-500 flex flex-wrap items-center justify-center gap-2"
        >
          <span>Application officielle :</span>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300 tracking-wide">URBA EVENT</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>Itinéraires personnalisés · Rendez-vous exposants · Programme en temps réel</span>
        </motion.div>
      </div>
    </section>
  );
};
