/**
 * SIB 2026 — ThemesSection
 * Les six filieres officielles, cartes epurees avec numerotation en ombre.
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
    desc: "Menuiserie bois, métallique et PVC, portes, fenêtres, volets, façades et systèmes d'occultation.",
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

const ThemeCard: React.FC<{ theme: typeof themes[number]; index: number }> = ({ theme, index }) => {
  const Icon = theme.Icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay: index * 0.07 }}
      className="group relative rounded-2xl p-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Accent strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-500/0 via-accent-500 to-accent-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Background number */}
      <span
        aria-hidden
        className="absolute -top-2 right-4 font-bold text-7xl pointer-events-none select-none leading-none text-neutral-100 dark:text-neutral-800 group-hover:text-accent-500/20 transition-colors duration-500 tabular-nums"
      >
        {theme.number}
      </span>

      {/* Icon */}
      <div className="relative z-10 h-12 w-12 rounded-xl flex items-center justify-center mb-5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="relative z-10 text-base font-semibold uppercase tracking-wide mb-3 text-neutral-900 dark:text-white">
        {theme.title}
      </h3>

      <div className="relative z-10 h-0.5 w-10 rounded-full mb-4 bg-accent-500/50 group-hover:bg-accent-500 group-hover:w-16 transition-all duration-300" />

      <p className="relative z-10 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {theme.desc}
      </p>
    </motion.div>
  );
};

export const ThemesSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-3xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">Univers du Salon</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.05] mb-5">
            Les filières du <span className="sib-text-gradient">bâtiment</span>
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            SIB 2026 réunit entreprises privées, organismes publics, fournisseurs de matériaux, architectes et ingénieurs autour de six filières officielles, avec Espace Démonstration, SIB Academy et rencontres B2B.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent-500" />
            <div className="w-1.5 h-1.5 rotate-45 bg-accent-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent-500" />
          </div>
        </motion.div>

        {/* Grid 3x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, i) => (
            <ThemeCard key={theme.number} theme={theme} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-14"
        >
          <Link to={ROUTES.EXHIBITORS}>
            <Button variant="primary" size="lg" className="group">
              Explorer les exposants
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
