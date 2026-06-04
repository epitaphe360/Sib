import React from 'react';

/** Dégradé cinéma — texte hero lisible sur photos SIB réelles */
export const HeroPhotoOverlay: React.FC = () => (
  <>
    <div className="absolute inset-0 bg-[#001530]/55 pointer-events-none" aria-hidden />
    <div
      className="absolute inset-0 bg-gradient-to-r from-[#001A3D]/[0.97] via-[#001A3D]/75 to-[#001A3D]/25 pointer-events-none"
      aria-hidden
    />
    <div
      className="absolute inset-0 bg-gradient-to-t from-[#001530]/90 via-transparent to-[#001A3D]/20 pointer-events-none"
      aria-hidden
    />
  </>
);

export default HeroPhotoOverlay;
