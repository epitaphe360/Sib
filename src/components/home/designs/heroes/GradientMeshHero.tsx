import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function GradientMeshHero() {
  return (
    <HeroDesignFrame
      badge="Design · Gradient Mesh"
      title="SIB 2026"
      subtitle="Mesh animé, glassmorphism"
      className="bg-neutral-950"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 h-[120%] w-[80%] rounded-full bg-[#F39200]/30 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 h-[100%] w-[70%] rounded-full bg-[#001A3D]/80 blur-[80px]" />
        <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/20 blur-[90px]" />
      </div>
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5" />
    </HeroDesignFrame>
  );
}
