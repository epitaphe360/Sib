import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function ArchitectBlueprintHero() {
  return (
    <HeroDesignFrame
      badge="Design · Architect Blueprint"
      title="Plan directeur SIB 2026"
      subtitle="Style plan d'architecte"
      className="bg-[#0d2847]"
      dark
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-8 border border-dashed border-white/25 rounded-sm" />
      <div className="absolute top-12 right-12 text-[10px] font-mono text-white/40 uppercase tracking-widest">
        Échelle 1:500 — El Jadida
      </div>
    </HeroDesignFrame>
  );
}
