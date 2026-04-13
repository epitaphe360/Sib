/**
 * Section "40 ans d'histoire" — Timeline des jalons
 * Design : clair, hiérarchie simple, palette sib
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

const milestones = [
  {
    year: '1986',
    title: '1ère Édition',
    desc: 'Naissance du Salon International du Bâtiment à Casablanca, organisé par URBACOM — premier rendez-vous BTP d\'envergure internationale au Maroc.',
  },
  {
    year: '2004',
    title: 'Ère Mohammed VI',
    desc: 'Le SIB se tient désormais sous le Haut Patronage de Sa Majesté le Roi Mohammed VI. Transfert progressif vers le Parc d\'Exposition Mohammed VI d\'El Jadida.',
  },
  {
    year: '2022',
    title: '18ème Édition',
    desc: '500+ exposants · 160 000 visiteurs · 42 pays. Retour en force après la pandémie, sous le signe de l\'innovation et de la construction durable.',
  },
  {
    year: '2026',
    title: '20ème Édition',
    desc: 'El Jadida · 40 ans d\'histoire. 600+ exposants, 200 000+ visiteurs attendus, SIB Academy, Espace Démonstration, 300+ rencontres B2B.',
    highlight: true,
  },
];

export const EditionSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-sib-light/40 to-white" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* En-tête */}
        <div className="text-center mb-14 lg:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-[0.25em] uppercase text-sib-gold"
          >
            Depuis 1986
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4"
          >
            <div className="relative inline-block">
              <span className="absolute inset-0 -translate-y-3 select-none pointer-events-none text-sib-primary/8 font-heading font-bold tracking-tight" style={{ fontSize: 'clamp(5rem, 18vw, 11rem)', lineHeight: 1 }}>
                40
              </span>
              <h2 className="relative font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
                40 ans d'excellence
              </h2>
            </div>
            <p className="mt-4 text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Depuis 1986, le SIB est le rendez-vous biennal de référence des professionnels du Bâtiment, de la Construction,
              de l'Urbanisme et de la Décoration, au niveau national et international.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-sib-gold" />
              <div className="w-1.5 h-1.5 rotate-45 bg-sib-gold" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-sib-gold" />
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Card
                hover
                padding="lg"
                className={m.highlight ? 'border-sib-gold/35 bg-sib-gold/5' : ''}
              >
                <div className={m.highlight ? 'text-sib-gold' : 'text-sib-primary'}>
                  <div className="font-heading font-bold text-4xl">{m.year}</div>
                  <div className="mt-2 h-0.5 w-10 rounded-full bg-current opacity-40" />
                </div>

                <h3 className="mt-4 font-heading font-bold text-lg uppercase tracking-wide text-slate-900">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {m.desc}
                </p>

                {m.highlight && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-sib-gold/30 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sib-gold">
                    <span>✦</span>
                    Édition anniversaire
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sib">
            1986 — 2026
            <span className="text-slate-300">·</span>
            40 ans
            <span className="text-slate-300">·</span>
            20 éditions
          </div>
        </motion.div>
      </div>
    </section>
  );
};
