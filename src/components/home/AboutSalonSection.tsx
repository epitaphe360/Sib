/**
 * Section "À propos du salon" — Redesign 40ème édition
 * Identité bâtiment & construction — icônes maritimes supprimées
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award,
  Globe,
  Users,
  TrendingUp,
  CalendarDays,
  MapPin,
  ArrowRight,
  Building2,
  HardHat,
  Layers,
  Handshake,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

const GOLD = '#D4AF37';

const features = [
  {
    Icon: Award,
    titleKey: 'about.excellence',
    descKey: 'about.excellence_desc',
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.1)',
  },
  {
    Icon: Globe,
    titleKey: 'about.international',
    descKey: 'about.international_desc',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    Icon: Handshake,
    titleKey: 'about.networking',
    descKey: 'about.networking_desc',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    Icon: TrendingUp,
    titleKey: 'about.innovation',
    descKey: 'about.innovation_desc',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
  },
];

const cardStats = [
  { number: '500+',      labelKey: 'about.exhibitors_stat', Icon: Building2 },
  { number: '50',        labelKey: 'about.countries_stat',  Icon: Globe },
  { number: '200 000+',  labelKey: 'about.visitors_stat',   Icon: Users },
  { number: '30 000 m²', labelKey: 'about.surface_stat',    Icon: CalendarDays },
];

export const AboutSalonSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-gray-50 relative overflow-hidden">
      {/* Motif géométrique subtil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(27,54,93,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(27,54,93,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Accent doré haut droit */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-[0.04]"
        style={{ background: `radial-gradient(circle at top right, ${GOLD}, transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* ── Colonne gauche : contenu ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
            viewport={{ once: true }}
          >
            {/* Label badge */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(27,54,93,0.08)' }}
              >
                <HardHat className="h-5 w-5" style={{ color: '#1B365D' }} />
              </div>
              <span className="text-sm font-bold tracking-[0.15em] uppercase" style={{ color: '#1B365D' }}>
                {t('about.badge', 'À propos du salon')}
              </span>
            </div>

            {/* Titre */}
            <h2 className="font-heading font-bold text-3xl lg:text-5xl text-gray-900 uppercase leading-tight mb-2">
              SIB 2026
            </h2>
            <h2 className="font-heading font-bold text-2xl lg:text-4xl uppercase leading-tight mb-6" style={{ color: '#1B365D' }}>
              {t('home.about_subtitle', 'La Référence du Bâtiment')}
            </h2>

            {/* Séparateur doré */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-0.5 w-16 rounded-full" style={{ background: GOLD }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: GOLD }} />
            </div>

            {/* Description officielle */}
            <div className="space-y-4 mb-10 text-gray-600 leading-relaxed">
              <p className="text-base">
                Le <strong className="text-gray-900">Salon International du Bâtiment (SIB)</strong> s'est imposé comme le rendez-vous biennal de référence des acteurs clés du secteur du <strong className="text-gray-900">Bâtiment, de la Construction, de l'Urbanisme, de la Décoration et de l'Immobilier</strong> aux niveaux national et international.
              </p>
              <p className="text-sm">
                Fondé en <strong className="text-gray-900">1986</strong> et organisé par <strong className="text-gray-900">URBACOM</strong> en partenariat avec le Ministère de l'Habitat, il réunit entreprises privées, organismes publics, fournisseurs de matériaux, importateurs d'équipements, architectes et ingénieurs pour des échanges d'expertise et la promotion des dernières innovations.
              </p>
              <p className="text-sm">
                La 20ème édition en <strong className="text-gray-900">2026</strong> marque les <strong className="text-gray-900">40 ans d'histoire</strong> du salon, avec de nouveaux espaces : <em>SIB Academy, Espace Démonstration, SIB Women</em> et <em>300+ rencontres B2B</em> avec des décideurs internationaux.
              </p>
            </div>

            {/* Features 2×2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
                >
                  <div
                    className="p-2 rounded-lg flex-shrink-0 mt-0.5"
                    style={{ background: f.bg }}
                  >
                    <f.Icon className="h-4 w-4" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
                      {t(f.titleKey)}
                    </h3>
                    <p className="text-xs text-gray-500 leading-snug">
                      {t(f.descKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={ROUTES.EXHIBITORS}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Building2 className="mr-2 h-4 w-4" />
                  {t('home.discover_exhibitors_btn', 'Voir les exposants')}
                </Button>
              </Link>
              <Link to={ROUTES.PARTNERS}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Users className="mr-2 h-4 w-4" />
                  {t('home.see_partners_btn', 'Partenaires')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ── Colonne droite : carte visuelle ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Carte principale — fond sombre */}
            <div
              className="relative rounded-2xl p-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #071828 0%, #0A1929 50%, #1B365D 100%)',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              {/* Motif intérieur */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(212,175,55,1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)
                  `,
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Titre carte */}
              <div className="relative z-10 text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mx-auto mb-4"
                  style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}30` }}
                >
                  <Layers className="h-7 w-7" style={{ color: GOLD }} />
                </div>
                <h3 className="font-heading font-bold text-xl uppercase text-white tracking-wide">
                  {t('about.card_title', 'Le Salon en Données')}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {t('about.card_desc', 'Édition 2026 · El Jadida, Maroc')}
                </p>
              </div>

              {/* Stats 2×2 */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {cardStats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-xl p-4 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="font-heading font-bold text-2xl sm:text-3xl mb-1"
                      style={{ color: GOLD }}
                    >
                      {s.number}
                    </div>
                    <div className="text-xs text-white opacity-60 leading-snug">
                      {t(s.labelKey)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating badge — date */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -top-5 -left-5 bg-white rounded-xl shadow-lg border border-gray-100 p-3.5 flex items-center gap-2.5"
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: 'rgba(212,175,55,0.12)' }}
              >
                <CalendarDays className="h-4 w-4" style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">25 – 29 Novembre</p>
                <p className="text-[10px] text-gray-400">2026</p>
              </div>
            </motion.div>

            {/* Floating badge — lieu */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              viewport={{ once: true }}
              className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-lg border border-gray-100 p-3.5 flex items-center gap-2.5"
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.1)' }}
              >
                <MapPin className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">El Jadida</p>
                <p className="text-[10px] text-gray-400">Maroc 🇲🇦</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bandeau CTA bas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 lg:mt-20 rounded-2xl p-8 text-center overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, #1B365D 0%, #0A1929 100%)`,
            border: `1px solid ${GOLD}20`,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(212,175,55,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10">
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white uppercase tracking-wide mb-3">
              {t('about.cta_title', 'Participez à la 20ème Édition · 40 Ans d\'Histoire')}
            </h3>
            <p className="text-sm sm:text-base mb-6 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('about.cta_desc', 'Sous le Haut Patronage de Sa Majesté le Roi · 25-29 Novembre 2026 · Parc d\'Exposition Mohammed VI · El Jadida')}
            </p>
            <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
              <button
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-250 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #B8960C)`,
                  color: '#020913',
                  boxShadow: `0 4px 20px rgba(212,175,55,0.35)`,
                }}
              >
                {t('about.cta_button', 'S\'inscrire maintenant')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
