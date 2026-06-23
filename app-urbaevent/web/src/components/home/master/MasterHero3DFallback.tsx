import React from 'react';

/** Fallback CSS quand WebGL / R3F indisponible */
export const MasterHero3DFallback: React.FC = () => (
  <div
    className="absolute inset-y-0 right-0 w-full max-w-[520px] pointer-events-none hidden lg:flex items-center justify-center opacity-70"
    aria-hidden
  >
    <div
      className="w-64 h-64 rounded-full animate-pulse"
      style={{
        background:
          'radial-gradient(circle at 35% 35%, rgba(243,146,0,0.85) 0%, rgba(243,146,0,0.35) 45%, transparent 70%)',
        filter: 'blur(2px)',
        animation: 'dm-float 6s ease-in-out infinite',
      }}
    />
    <style>{`
      @keyframes dm-float {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-16px) scale(1.04); }
      }
    `}</style>
  </div>
);
