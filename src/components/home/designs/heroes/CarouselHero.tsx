import React, { useState, useEffect } from 'react';
import { HeroDesignFrame } from '../HeroDesignFrame';

const SLIDES = [
  { title: '40 ans d\'innovation', bg: 'from-[#001A3D] to-[#003366]' },
  { title: '600+ exposants', bg: 'from-[#003366] to-[#001A3D]' },
  { title: '200 000+ visiteurs', bg: 'from-[#001530] to-[#002244]' },
];

export default function CarouselHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <HeroDesignFrame
      badge="Design · Carousel"
      title={SLIDES[index].title}
      subtitle="Slides avec transitions fluides"
      className="transition-all duration-1000"
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </HeroDesignFrame>
  );
}
