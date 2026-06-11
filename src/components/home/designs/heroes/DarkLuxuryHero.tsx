import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function DarkLuxuryHero() {
  return (
    <HeroDesignFrame
      badge="Design · Dark Luxury"
      title={
        <>
          L&apos;excellence
          <br />
          <span className="text-[#2E5984]">du BTP marocain</span>
        </>
      }
      subtitle="Or et noir — style VIP"
      className="bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2E598422,_transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-[#2E5984]/10 blur-3xl" />
    </HeroDesignFrame>
  );
}
