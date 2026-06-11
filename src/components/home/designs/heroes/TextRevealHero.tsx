import React from 'react';
import { motion } from 'framer-motion';
import { HeroDesignFrame } from '../HeroDesignFrame';

const HEADLINE = 'SALON INTERNATIONAL DU BÂTIMENT 2026';

export default function TextRevealHero() {
  return (
    <HeroDesignFrame
      badge="Design · Text Reveal"
      title={
        <span className="flex flex-wrap gap-x-[0.15em]">
          {HEADLINE.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className={char === ' ' ? 'w-[0.25em]' : ''}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </span>
      }
      subtitle="Révélation lettre par lettre"
      className="bg-[#001A3D]"
    />
  );
}
