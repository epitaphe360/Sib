import React from 'react';

export const MoroccanPattern = ({ 
  className = "opacity-10", 
  color = "currentColor",
  scale = 1
}: { 
  className?: string;
  color?: string;
  scale?: number;
}) => (
  <div className={`absolute inset-0 ${className} pointer-events-none overflow-hidden`} style={{ zIndex: 0 }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern 
          id="moroccan-zellige" 
          x="0" 
          y="0" 
          width={60 * scale} 
          height={60 * scale} 
          patternUnits="userSpaceOnUse"
        >
          {/* Motif inspiré du Zellige (étoile à 8 branches simplifiée) */}
          <path 
            d={`M${30 * scale} 0 L${37 * scale} ${23 * scale} L${60 * scale} ${30 * scale} L${37 * scale} ${37 * scale} L${30 * scale} ${60 * scale} L${23 * scale} ${37 * scale} L0 ${30 * scale} L${23 * scale} ${23 * scale} Z`} 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
          />
          <circle cx={30 * scale} cy={30 * scale} r={3 * scale} fill={color} opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#moroccan-zellige)" />
    </svg>
  </div>
);

export const MoroccanArch = ({ className = "", color = "white" }: { className?: string, color?: string }) => (
  <div className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none ${className}`}>
     <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
        {/* Forme d'arche marocaine stylisée */}
        <path 
          fill={color} 
          d="M0,120 L0,40 C240,40 360,100 720,100 C1080,100 1200,40 1440,40 L1440,120 Z"
        ></path>
    </svg>
  </div>
);
