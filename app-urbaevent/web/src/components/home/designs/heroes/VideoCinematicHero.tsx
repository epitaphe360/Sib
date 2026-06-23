import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

export default function VideoCinematicHero() {
  return (
    <HeroDesignFrame
      badge="Design · Video Cinematic"
      title="Le rendez-vous du bâtiment"
      subtitle="Effet cinématique avec overlay vidéo"
      className="bg-black"
    >
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </HeroDesignFrame>
  );
}
