import React from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  /** Image de fond optionnelle (hero photo v4) */
  backgroundImage?: string;
  gradient?: string;
  py?: string;
  noWave?: boolean;
  children?: React.ReactNode;
}

const DEFAULT_GRADIENT = 'from-sib-navy via-sib-navy to-sib-navy-deep';

export function PageHero({
  badge,
  title,
  subtitle,
  actions,
  aside,
  backgroundImage = '/sib2026-home-v4/assets/sib-hero.webp',
  gradient = DEFAULT_GRADIENT,
  py = 'py-16 md:py-24',
  noWave = false,
  children,
}: PageHeroProps) {
  const hasPhoto = Boolean(backgroundImage);

  return (
    <section className={`relative text-white overflow-hidden ${hasPhoto ? '' : `bg-gradient-to-br ${gradient}`}`}>
      {hasPhoto && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,27,56,.9) 0%, rgba(0,22,47,.55) 38%, rgba(0,15,34,.15) 100%)',
            }}
            aria-hidden
          />
        </>
      )}

      <div className={`sib-v4-container ${py} relative z-10`}>
        {aside ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {badge && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                  {badge}
                </div>
              )}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[0.95] tracking-tight">
                {title}
              </h1>
              {subtitle && <p className="text-lg md:text-xl text-white/75 mb-8 leading-relaxed">{subtitle}</p>}
              {actions && <div>{actions}</div>}
              {children}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {aside}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {badge && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                {badge}
              </div>
            )}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[0.95] tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-lg md:text-xl text-white/75 mb-8 leading-relaxed">{subtitle}</p>}
            {actions && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">{actions}</div>
            )}
            {children}
          </motion.div>
        )}
      </div>

      {!noWave && (
        <div className="absolute bottom-0 inset-x-0 leading-none z-10 pointer-events-none">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12">
            <path d="M0,48 C360,8 720,40 1080,16 C1260,4 1380,12 1440,8 L1440,48 Z" fill="#f7f7f5" />
          </svg>
        </div>
      )}
    </section>
  );
}
