import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function NeonCyberpunkHero() {
  return (
    <HeroDesignFrame
      badge="Design · Neon Cyberpunk"
      title={
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-[#F39200]">
          SIB 2026
        </span>
      }
      subtitle="Néons et effets futuristes"
      className="bg-[#0a0a12]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[100px]" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-[#F39200] shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
    </HeroDesignFrame>
  );
}
