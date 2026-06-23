import React from 'react';

interface SibPublicHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  children?: React.ReactNode;
  align?: 'center' | 'left';
  image?: string;
  className?: string;
}

const HERO_GRADIENT =
  'linear-gradient(90deg, rgba(0,27,56,.92) 0%, rgba(0,22,47,.72) 45%, rgba(0,15,34,.35) 100%)';

/** Hero pages publiques — pleine largeur, aligné maquette home SIB 2026 v4 */
export function SibPublicHero({
  title,
  subtitle,
  eyebrow = 'SIB 2026',
  children,
  align = 'left',
  image = '/sib-ma/static/hero.jpg',
  className = '',
}: SibPublicHeroProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <section
      className={`sib-public-hero py-20 md:py-24 pb-28 md:pb-32 ${className}`}
      style={{
        backgroundImage: `${HERO_GRADIENT}${image ? `, url(${image})` : ''}`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={`sib-v4-container relative z-10 ${alignClass}`}>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sib-orange mb-3 font-display">
            {eyebrow}
          </p>
        )}
        <h1
          className={`font-display text-4xl md:text-5xl xl:text-[3.25rem] font-extrabold leading-[0.95] tracking-tight mb-4 text-white ${
            align === 'center' ? 'max-w-4xl mx-auto' : 'max-w-3xl'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-base md:text-lg text-white/75 max-w-3xl mb-8 ${
              align === 'center' ? 'mx-auto' : ''
            }`}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export default SibPublicHero;
