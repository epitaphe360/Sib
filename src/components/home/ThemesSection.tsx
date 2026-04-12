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

const GOLD = '#D4AF37';

const themes = [
  {
    Icon: HardHat,
    number: '01',
    title: 'Construction & Gros Œuvre',
    desc: 'Béton, structure, fondations, coffrage, charpente métallique et systèmes de construction.',
    color: '#FF6B35',
    bg: 'rgba(255,107,53,0.1)',
  },
  {
    Icon: Compass,
    number: '02',
    title: 'Architecture & Design',
    desc: 'Conception architecturale, design d\'intérieur, aménagement urbain et paysage.',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    Icon: Cpu,
    number: '03',
    title: 'Smart Building',
    desc: 'Bâtiment connecté, domotique, automatisation, IoT, sécurité intelligente et BIM.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    Icon: Layers,
    number: '04',
    title: 'Matériaux & Innovation',
    desc: 'Matériaux innovants, revêtements, isolation, menuiserie, verre et céramique.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    Icon: Building2,
    number: '05',
    title: 'Immobilier & Urbanisme',
    desc: 'Promoteurs, aménageurs, financement immobilier, logement social et résidentiel.',
    color: GOLD,
    bg: 'rgba(212,175,55,0.1)',
  },
  {
    Icon: Zap,
    number: '06',
    title: 'Énergie & Durabilité',
    desc: 'Énergies renouvelables, efficacité énergétique, certification verte et bâtiment durable.',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
  },
];

export const ThemesSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
      {/* Fond léger quadrillage */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(27,54,93,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(27,54,93,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-bold tracking-[0.25em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Univers du Salon
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 uppercase tracking-wide mb-4">
            Les Filières du Bâtiment
          </h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            SIB 2026 réunit tous les acteurs de la chaîne de valeur du secteur bâtiment autour de six grandes filières thématiques.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: GOLD }} />
            <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
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
            <button
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-250 hover:-translate-y-0.5 group"
              style={{
                background: 'linear-gradient(135deg, #1B365D, #0A1929)',
                color: 'white',
                boxShadow: '0 4px 18px rgba(27,54,93,0.25)',
              }}
            >
              Explorer les Exposants
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
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
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group relative rounded-2xl p-6 cursor-pointer transition-all duration-300"
      style={{
        background: hovered ? theme.bg : 'white',
        border: `1px solid ${hovered ? `${theme.color}30` : '#f0f0f0'}`,
        boxShadow: hovered
          ? `0 12px 32px ${theme.color}18, 0 2px 8px rgba(0,0,0,0.04)`
          : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Numéro de fond */}
      <span
        className="absolute top-4 right-5 font-heading font-bold text-5xl pointer-events-none select-none transition-opacity duration-300"
        style={{
          color: theme.color,
          opacity: hovered ? 0.12 : 0.06,
          lineHeight: 1,
        }}
      >
        {theme.number}
      </span>

      {/* Icône */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          background: hovered ? theme.color : theme.bg,
        }}
      >
        <theme.Icon
          className="h-6 w-6 transition-colors duration-300"
          style={{ color: hovered ? 'white' : theme.color }}
        />
      </div>

      {/* Titre */}
      <h3
        className="font-heading font-bold text-lg uppercase tracking-wide mb-2 transition-colors duration-300"
        style={{ color: hovered ? theme.color : '#1B365D' }}
      >
        {theme.title}
      </h3>

      {/* Trait */}
      <div
        className="h-0.5 w-8 rounded-full mb-3 transition-all duration-300"
        style={{
          background: theme.color,
          opacity: hovered ? 1 : 0.3,
          width: hovered ? '3rem' : '2rem',
        }}
      />

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">
        {theme.desc}
      </p>
    </motion.div>
  );
};
