import React from 'react';
import { motion } from 'framer-motion';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function KineticTypeHero() {
  return (
    <HeroDesignFrame
      badge="Design · Kinetic Type"
      title={
        <motion.span
          animate={{ x: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          SIB 2026
        </motion.span>
      }
      subtitle="Typographie cinétique"
      className="bg-neutral-900"
    >
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[8rem] font-black text-white whitespace-nowrap"
            style={{ top: `${i * 18}%` }}
            animate={{ x: ['-10%', '-50%'] }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
          >
            BÂTIMENT · HABITAT · BTP ·
          </motion.div>
        ))}
      </div>
    </HeroDesignFrame>
  );
}
