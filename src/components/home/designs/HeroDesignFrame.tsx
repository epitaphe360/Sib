import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';

interface HeroDesignFrameProps {
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  dark?: boolean;
}

/** En-tête commun SIB pour les demos hero */
export const HeroDesignFrame: React.FC<HeroDesignFrameProps> = ({
  badge,
  title,
  subtitle,
  className = '',
  children,
  dark = true,
}) => (
  <section
    className={`relative min-h-[85vh] flex flex-col justify-end overflow-hidden ${className}`.trim()}
  >
    {children}
    <div className="relative z-10 max-w-container mx-auto px-6 lg:px-8 pb-16 lg:pb-24 w-full">
      <span
        className={`inline-block mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${
          dark ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-primary-100 text-primary-800'
        }`}
      >
        {badge}
      </span>
      <h1
        className={`text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl ${
          dark ? 'text-white' : 'text-neutral-900'
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p className={`mt-6 text-lg max-w-2xl ${dark ? 'text-white/75' : 'text-neutral-600'}`}>
          {subtitle}
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          to={ROUTES.VISITOR_SUBSCRIPTION}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#F39200] text-white font-semibold text-sm hover:bg-[#E08500] transition-colors"
        >
          Devenir visiteur
        </Link>
        <Link
          to={ROUTES.EXHIBITOR_SUBSCRIPTION}
          className={`inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-sm border transition-colors ${
            dark
              ? 'border-white/40 text-white hover:bg-white/10'
              : 'border-neutral-300 text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          Devenir exposant
        </Link>
      </div>
    </div>
  </section>
);
