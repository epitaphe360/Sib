/**
 * Section "Les Univers du Salon" — 6 filières du bâtiment
 * Design : grille de cartes hover avec fond sombre/clair alterné
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HardHat,
  Compass,
  Cpu,
  Layers,
  Building2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';

const themes = [
  {
    Icon: HardHat,
    number: '01',
    title: 'Gros Œuvre',
    desc: 'Matériaux de construction, produits chimiques, étanchéité, isolation thermique et phonique, béton et acier.',
  },
  {
    Icon: Compass,
    number: '02',
    title: 'Menuiserie & Fermeture',
    desc: 'Menuiserie bois, métallique et PVC, portes, fenêtres, volets, façades et systèmes d\'occultation.',
  },
  {
    Icon: Layers,
    number: '03',
    title: 'Sanitaire & Climatisation',
    desc: 'Plomberie, robinetterie, systèmes solaires thermiques, revêtements sol et mur, carrelage et céramique.',
  },
  {
    Icon: Zap,
    number: '04',
    title: 'Équipement Électrique',
    desc: 'Installation électrique, ascenseurs, énergie renouvelable, domotique et systèmes de sécurité intelligents.',
  },
  {
    Icon: Building2,
    number: '05',
    title: 'Décoration & Aménagement',
    desc: 'Ameublement, éclairage, artisanat marocain, revêtements décoratifs, peintures et finitions haut de gamme.',
  },
  {
    Icon: Cpu,
    number: '06',
    title: 'Construction Durable & Digital',
    desc: 'Solutions écologiques, certifications vertes, BIM, intelligence artificielle, maquette numérique et Smart Building.',
  },
];

export const ThemesSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-sib-light/40 to-white overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3 text-sib-gold">
            Univers du Salon
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 uppercase tracking-wide mb-4">
            Les Filières du Bâtiment
          </h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            SIB 2026 réunit entreprises privées, organismes publics, fournisseurs de matériaux, architectes et ingénieurs autour de six filières officielles, avec Espace Démonstration, SIB Academy et rencontres B2B.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-sib-gold" />
            <div className="w-1.5 h-1.5 rotate-45 bg-sib-gold" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-sib-gold" />
          </div>
        </motion.div>

        {/* Grille 3×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, i) => (
            <ThemeCard key={i} theme={theme} index={i} />
          ))}
        </div>

        {/* CTA bas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link to={ROUTES.EXHIBITORS}>
            <Button size="lg" className="group">
              Explorer les exposants
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Carte thème ─────────────────────────────────────────────────────────── */
const ThemeCard: React.FC<{
  theme: typeof themes[0];
  index: number;
}> = ({ theme, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group relative rounded-2xl p-6 bg-white/95 backdrop-blur border border-slate-200/80 shadow-sm hover:shadow-sib-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Numéro de fond */}
      <span
        className="absolute top-4 right-5 font-heading font-bold text-5xl pointer-events-none select-none transition-opacity duration-300"
        style={{ lineHeight: 1 }}
      >
        <span className="text-sib-primary/7 group-hover:text-sib-gold/15">
          {theme.number}
        </span>
      </span>

      {/* Icône */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-sib-light/70 border border-slate-200 text-sib-primary group-hover:text-sib-gold transition-colors duration-300">
        <theme.Icon className="h-6 w-6" />
      </div>

      {/* Titre */}
      <h3 className="font-heading font-bold text-lg uppercase tracking-wide mb-2 text-slate-900">
        {theme.title}
      </h3>

      {/* Trait */}
      <div className="h-0.5 w-8 rounded-full mb-3 bg-sib-gold/50 group-hover:bg-sib-gold transition-colors duration-300" />

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">
        {theme.desc}
      </p>
    </motion.div>
  );
};
