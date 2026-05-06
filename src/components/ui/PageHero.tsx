import React from 'react';
import { motion } from 'framer-motion';
import { MoroccanPattern } from './MoroccanDecor';

interface PageHeroProps {
  /** Petite étiquette pill au-dessus du titre (ex: icône + texte) */
  badge?: React.ReactNode;
  /** Titre principal — supporte du JSX pour colorer un mot */
  title: React.ReactNode;
  /** Sous-titre */
  subtitle?: React.ReactNode;
  /** Contenu optionnel en bas du hero (boutons, countdown, etc.) */
  actions?: React.ReactNode;
  /** Colonne droite optionnelle (stats, illustration…) */
  aside?: React.ReactNode;
  /** Gradient Tailwind (par défaut indigo comme partner/subscription) */
  gradient?: string;
  /** Hauteur de padding vertical */
  py?: string;
  /** Désactive la vague de séparation en bas */
  noWave?: boolean;
  children?: React.ReactNode;
}

export function PageHero({
  badge,
  title,
  subtitle,
  actions,
  aside,
  gradient = 'from-indigo-500 via-indigo-600 to-indigo-700',
  py = 'py-20 md:py-28',
  noWave = false,
  children,
}: PageHeroProps) {
  return (
    <section className={`relative bg-gradient-to-br ${gradient} text-white overflow-hidden`}>
      {/* Motif marocain */}
      <MoroccanPattern className="opacity-[0.05] text-white" scale={1.5} />

      {/* Formes géométriques décoratives */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-300 rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white rotate-45 transform" />
        <div
          className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-yellow-300"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        />
      </div>

      {/* Orbes lumineux flottants */}
      <motion.div
        animate={{ y: [0, -25, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-[8%] w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-[8%] w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Contenu */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${py} relative z-10`}>
        {aside ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {badge && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                  {badge}
                </div>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed">
                  {subtitle}
                </p>
              )}
              {actions && <div>{actions}</div>}
              {children}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {aside}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            {badge && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                {badge}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed">
                {subtitle}
              </p>
            )}
            {actions && <div className="flex flex-col sm:flex-row items-center justify-center gap-4">{actions}</div>}
            {children}
          </motion.div>
        )}
      </div>

      {/* Indicateur de défilement */}
      <motion.button
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.25em]">Découvrir</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* Vague de séparation */}
      {!noWave && (
        <div className="absolute bottom-0 inset-x-0 leading-none z-10">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-14">
            <path d="M0,56 C240,0 480,40 720,20 C960,0 1200,40 1440,10 L1440,56 Z" fill="#f8fafc" />
          </svg>
        </div>
      )}
    </section>
  );
}
