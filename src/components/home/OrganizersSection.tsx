/**
 * Section Organisateurs & Partenaires Institutionnels
 * Données officielles SIB : MHPV, AMDIE, FMC, FNBTP, URBACOM
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
    name: 'Ministère de l\'Habitat et de la Politique de la Ville',
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

const categoryMeta: Record<OrganizerItem['category'], { label: string; accentClass: string; borderClass: string }> = {
  tutelle: {
    label: 'Tutelle',
    accentClass: 'text-sib-gold',
    borderClass: 'border-sib-gold/25',
  },
  partenaire: {
    label: 'Partenaire',
    accentClass: 'text-sib-primary',
    borderClass: 'border-sib-primary/15',
  },
  organisateur: {
    label: 'Organisateur Délégué',
    accentClass: 'text-sib-secondary',
    borderClass: 'border-sib-secondary/20',
  },
};

export const OrganizersSection: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-20 bg-gradient-to-b from-sib-light/40 via-white to-white border-t border-b border-slate-200/60 overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3 text-sib-gold">
            Partenaires & Organisateurs
          </p>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
            Sous l'égide des Institutions
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-0.5 w-16 rounded-full bg-sib-gold/70" />
            <div className="w-1.5 h-1.5 rotate-45 bg-sib-gold" />
            <div className="h-0.5 w-16 rounded-full bg-sib-gold/70" />
          </div>
        </motion.div>

        {/* Ministère logo + texte — en évidence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 sm:p-8 rounded-2xl mb-10 bg-gradient-to-br from-sib-gold/10 via-white to-sib-light/60 border border-sib-gold/20 shadow-sib"
        >
          <img
            src="/logo-ministere.png"
            alt="Ministère de l'Équipement et de l'Eau — Royaume du Maroc"
            className="h-20 md:h-24 w-auto object-contain flex-shrink-0"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo-ministere.svg'; }}
          />
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-1 text-sib-gold">
              Sous le Haut Patronage de Sa Majesté le Roi Mohammed VI
            </p>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-gray-900 uppercase">
              Ministère de l'Habitat et de la Politique de la Ville
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Aménagement du Territoire National · Urbanisme · Habitat · Politique de la Ville
            </p>
          </div>
        </motion.div>

        {/* Grille partenaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizers.slice(2).map((org, i) => {
            const meta = categoryMeta[org.category];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`rounded-xl p-5 flex items-start gap-4 border bg-white/90 backdrop-blur shadow-sm ${meta.borderClass}`}
              >
                {/* Acronyme badge */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-center leading-tight bg-white border ${meta.borderClass} ${meta.accentClass} ${org.acronym.length > 5 ? 'text-[0.6rem]' : 'text-xs'}`}
                >
                  {org.acronym}
                </div>
                <div className="min-w-0">
                  {/* Role */}
                  <span
                    className={`text-[10px] font-bold tracking-[0.15em] uppercase ${meta.accentClass}`}
                  >
                    {meta.label}
                  </span>
                  {/* Nom */}
                  <h4 className="font-semibold text-sm text-gray-900 leading-snug mt-0.5 mb-1">
                    {org.name}
                  </h4>
                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-snug">
                    {org.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mention URBA EVENT app */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2"
        >
          <span>Application officielle :</span>
          <span className="font-bold text-gray-600 tracking-wide">URBA EVENT</span>
          <span>·</span>
          <span>Itinéraires personnalisés · Rendez-vous exposants · Programme en temps réel</span>
        </motion.div>
      </div>
    </section>
  );
};
