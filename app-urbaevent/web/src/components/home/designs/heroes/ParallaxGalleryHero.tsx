import React from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

const IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
];

export default function ParallaxGalleryHero() {
  return (
    <HeroDesignFrame
      badge="Design · Parallax Gallery"
      title="Construire l'avenir"
      subtitle="Galerie d'images avec effet parallax"
      className="bg-[#001A3D]"
    >
      <div className="absolute inset-0 flex gap-4 px-8 opacity-40">
        {IMAGES.map((src, i) => (
          <div
            key={src}
            className="flex-1 h-full bg-cover bg-center rounded-lg"
            style={{
              backgroundImage: `url(${src})`,
              transform: `translateY(${i * 8}%) scale(${1 - i * 0.05})`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#001A3D] via-[#001A3D]/80 to-transparent" />
    </HeroDesignFrame>
  );
}
