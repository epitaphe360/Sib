import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function GeometricHero() {
  return (
    <HeroDesignFrame
      badge="Design · Geometric"
      title="Formes & structure"
      subtitle="Formes géométriques abstraites"
      className="bg-[#001A3D]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 h-48 w-48 rotate-45 border-2 border-[#F39200]/40" />
        <div className="absolute top-40 right-40 h-32 w-32 rotate-12 bg-[#F39200]/10" />
        <div className="absolute bottom-32 left-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute bottom-48 left-32 h-40 w-40 bg-white/5 clip-path-polygon" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      </div>
    </HeroDesignFrame>
  );
}
