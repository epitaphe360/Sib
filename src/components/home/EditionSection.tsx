/**
 * SIB 2026 — EditionSection
 * 40 ans d'histoire. Timeline des jalons, style epure et raffine.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const milestones = [
  {
    year: '1986',
    title: '1ère Édition',
    desc: "Naissance du Salon International du Bâtiment à Casablanca, organisé par URBACOM — premier rendez-vous BTP d'envergure internationale au Maroc.",
  },
  {
    year: '2004',
    title: 'Ère Mohammed VI',
    desc: "Le SIB se tient désormais sous le Haut Patronage de Sa Majesté le Roi Mohammed VI. Transfert progressif vers le Parc d'Exposition Mohammed VI d'El Jadida.",
  },
  {
    year: '2022',
    title: '18ème Édition',
    desc: "500+ exposants · 160 000 visiteurs · 42 pays. Retour en force après la pandémie, sous le signe de l'innovation et de la construction durable.",
  },
  {
    year: '2026',
    title: '20ème Édition',
    desc: "El Jadida · 40 ans d'histoire. 500+ exposants, 200 000+ visiteurs attendus, SIB Academy, Espace Démonstration, 300+ rencontres B2B.",
    highlight: true,
  },
];

export const EditionSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-white dark:bg-neutral-950">
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">Depuis 1986</div>
          <div className="relative inline-block">
            <span
              aria-hidden
              className="absolute inset-0 -translate-y-4 select-none pointer-events-none text-primary-900/5 dark:text-primary-100/5 font-bold tracking-tight"
              style={{ fontSize: 'clamp(5rem, 18vw, 11rem)', lineHeight: 1 }}
            >
              40
            </span>
            <h2 className="relative text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.05]">
              40 ans <span className="sib-text-gradient">d'excellence</span>
            </h2>
          </div>
          <p className="mt-6 text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Depuis 1986, le SIB est le rendez-vous biennal de référence des professionnels du Bâtiment, de la Construction,
            de l'Urbanisme et de la Décoration, au niveau national et international.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-accent-500" />
            <div className="w-1.5 h-1.5 rotate-45 bg-accent-500" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-accent-500" />
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={[
                'relative rounded-2xl p-7 border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                m.highlight
                  ? 'bg-gradient-to-br from-accent-50 to-white dark:from-accent-500/10 dark:to-neutral-900 border-accent-500/40'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
              ].join(' ')}
            >
              <div className={m.highlight ? 'text-accent-600 dark:text-accent-500' : 'text-primary-600 dark:text-primary-400'}>
                <div className="text-4xl font-bold tracking-tight tabular-nums leading-none">{m.year}</div>
                <div className="mt-3 h-0.5 w-10 rounded-full bg-current opacity-40" />
              </div>

              <h3 className="mt-5 text-base font-semibold uppercase tracking-wide text-neutral-900 dark:text-white">
                {m.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {m.desc}
              </p>

              {m.highlight && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-white/80 dark:bg-neutral-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-500">
                  <Sparkles className="h-3 w-3" />
                  Édition anniversaire
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700 dark:text-neutral-300 shadow-sm">
            <span className="tabular-nums">1986 — 2026</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>40 ans</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>20 éditions</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
