import React from 'react';
import { HeroBuilding3D } from '../../../3d/HeroBuilding3D';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function Immersive3DHero() {
  return (
    <HeroDesignFrame
      badge="Design · Immersif 3D"
      title={
        <>
          Salon International
          <br />
          du Bâtiment 2026
        </>
      }
      subtitle="Effet parallax cinématique — wireframe 3D animé"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#001A3D] via-[#001530] to-[#000a18]" />
      <div className="absolute inset-0 opacity-90">
        <HeroBuilding3D />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#001530] via-transparent to-transparent" />
    </HeroDesignFrame>
  );
}
