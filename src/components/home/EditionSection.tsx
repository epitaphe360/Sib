/**
 * Section 40ème Édition — Célébration du jubilé
 * Design : fond sombre, chiffre "40" monumental, timeline des jalons
 */

import React from 'react';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';

const milestones = [
  {
    year: '1985',
    title: '1ère Édition',
    desc: 'Naissance du Salon International du Bâtiment à Casablanca — premier rendez-vous du secteur au Maroc.',
  },
  {
    year: '1998',
    title: 'Rayonnement Régional',
    desc: 'Le SIB devient la référence du bâtiment en Afrique du Nord, attirant les premiers exposants internationaux.',
  },
  {
    year: '2012',
    title: 'Internationalisation',
    desc: '+200 exposants, 30 pays représentés. Lancement de la plateforme numérique B2B et des conférences high-level.',
  },
  {
    year: '2026',
    title: '40ème Édition',
    desc: 'El Jadida — Nouveau site, ambition continentale, plateforme digitale et 300+ exposants attendus.',
    highlight: true,
  },
];

export const EditionSection: React.FC = () => {
  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #020913 0%, #04111f 40%, #0A1929 100%)',
      }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Éclat radial doré */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <span
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: GOLD }}
            >
              Depuis 1985
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </motion.div>

          {/* Grand "40" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative inline-block"
          >
            {/* Ombre portée monumentale */}
            <span
              className="font-heading font-bold select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                fontSize: 'clamp(10rem, 25vw, 20rem)',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: `1px rgba(212,175,55,0.08)`,
                letterSpacing: '-0.04em',
                userSelect: 'none',
              }}
            >
              40
            </span>

            <h2
              className="font-heading font-bold leading-none relative"
              style={{
                fontSize: 'clamp(6rem, 20vw, 16rem)',
                background: `linear-gradient(135deg, ${GOLD} 0%, #F5D978 40%, ${GOLD} 70%, #9A7820 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.04em',
              }}
            >
              40
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <p
              className="font-heading font-bold text-2xl sm:text-4xl uppercase tracking-[0.15em] text-white mt-2 mb-3"
            >
              Ans d'Excellence
            </p>
            <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Quarante éditions au service de l'innovation, de la construction durable et du développement du secteur bâtiment au Maroc et en Afrique.
            </p>
          </motion.div>
        </div>

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Ligne centrale */}
          <div
            className="hidden lg:block absolute top-10 left-0 right-0 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${GOLD}40, ${GOLD}80, ${GOLD}40, transparent)` }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.12 }}
                className="relative"
              >
                {/* Point sur la ligne (desktop) */}
                <div
                  className="hidden lg:flex absolute -top-[calc(2.5rem-1px)] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full items-center justify-center z-20"
                  style={{
                    background: m.highlight ? GOLD : '#0A1929',
                    border: `2px solid ${m.highlight ? GOLD : `${GOLD}50`}`,
                    boxShadow: m.highlight ? `0 0 16px ${GOLD}60` : undefined,
                  }}
                >
                  {m.highlight && (
                    <div className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
                  )}
                </div>

                {/* Carte */}
                <div
                  className="rounded-2xl p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: m.highlight
                      ? `linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.06) 100%)`
                      : 'rgba(255,255,255,0.04)',
                    border: m.highlight
                      ? `1px solid ${GOLD}40`
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: m.highlight ? `0 0 32px ${GOLD}12` : undefined,
                  }}
                >
                  {/* Année */}
                  <div
                    className="font-heading font-bold text-4xl mb-2"
                    style={{ color: m.highlight ? GOLD : 'rgba(255,255,255,0.35)' }}
                  >
                    {m.year}
                  </div>

                  {/* Trait */}
                  <div
                    className="h-0.5 w-8 rounded-full mb-3"
                    style={{ background: m.highlight ? GOLD : 'rgba(255,255,255,0.15)' }}
                  />

                  {/* Titre */}
                  <h3
                    className="font-heading font-bold text-lg uppercase tracking-wide mb-2"
                    style={{ color: m.highlight ? GOLD : 'white' }}
                  >
                    {m.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-xs sm:text-sm leading-relaxed flex-1"
                    style={{ color: m.highlight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}
                  >
                    {m.desc}
                  </p>

                  {m.highlight && (
                    <div
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase"
                      style={{ color: GOLD }}
                    >
                      <span>✦</span>
                      <span>Édition Anniversaire</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Séparateur bas ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="h-px flex-1 max-w-xs" style={{ background: `linear-gradient(to right, transparent, ${GOLD}50)` }} />
          <div
            className="px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase"
            style={{
              border: `1px solid ${GOLD}30`,
              color: GOLD,
              background: 'rgba(212,175,55,0.05)',
            }}
          >
            1985 — 2026
          </div>
          <div className="h-px flex-1 max-w-xs" style={{ background: `linear-gradient(to left, transparent, ${GOLD}50)` }} />
        </motion.div>
      </div>
    </section>
  );
};
