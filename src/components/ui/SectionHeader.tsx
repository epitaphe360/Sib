import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  /** Petite étiquette pill avec icône optionnelle */
  badge?: React.ReactNode;
  /** Couleur du badge pill (classes Tailwind bg + text + border) */
  badgeClass?: string;
  /** Titre principal — supporte JSX pour colorer un mot */
  title: React.ReactNode;
  /** Sous-titre */
  subtitle?: React.ReactNode;
  /** Alignement */
  align?: 'left' | 'center';
  /** Couleur du trait vertical gauche (classes Tailwind bg-gradient) */
  accentClass?: string;
  /** Texte au-dessus du trait (label catégorie) */
  label?: string;
  /** Couleur du label (classes Tailwind text) */
  labelClass?: string;
}

/**
 * SectionHeader — En-tête de section au style de PartnerSubscriptionPage.
 *
 * Mode LEFT:
 *   ─ Trait vertical coloré + petite étiquette + grand titre
 *
 * Mode CENTER:
 *   ─ Pill badge centrée + grand titre
 */
export function SectionHeader({
  badge,
  badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200',
  title,
  subtitle,
  align = 'left',
  accentClass = 'from-indigo-600 to-indigo-400',
  label,
  labelClass = 'text-indigo-600',
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={align === 'center' ? 'text-center mb-14' : 'mb-12'}
    >
      {align === 'left' ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-1 h-10 bg-gradient-to-b ${accentClass} rounded-full`} />
            {label && (
              <span className={`text-xs font-bold uppercase tracking-[0.2em] ${labelClass}`}>
                {label}
              </span>
            )}
            {badge && !label && (
              <span className={`text-xs font-bold uppercase tracking-[0.15em] ${labelClass}`}>
                {badge}
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-500 max-w-2xl">{subtitle}</p>
          )}
        </>
      ) : (
        <>
          {badge && (
            <div className={`inline-flex items-center gap-2 border text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest ${badgeClass}`}>
              {badge}
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">{subtitle}</p>
          )}
        </>
      )}
    </motion.div>
  );
}
