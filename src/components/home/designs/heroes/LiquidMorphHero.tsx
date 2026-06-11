import React from 'react';
import { motion } from 'framer-motion';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function LiquidMorphHero() {
  return (
    <HeroDesignFrame
      badge="Design · Liquid Morph"
      title="Fluidité & innovation"
      subtitle="Effet liquide avec morphing"
      className="bg-[#001530]"
    >
      <motion.div
        className="absolute -top-1/4 -right-1/4 h-[80%] w-[80%] rounded-[40%] bg-[#F39200]/25 blur-2xl"
        animate={{ borderRadius: ['40% 60% 50% 40%', '60% 40% 55% 45%', '40% 60% 50% 40%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 h-[70%] w-[70%] rounded-[50%] bg-sky-500/20 blur-2xl"
        animate={{ borderRadius: ['50% 40% 60% 50%', '40% 55% 45% 60%', '50% 40% 60% 50%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </HeroDesignFrame>
  );
}
