import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  /** Offset Y initial en px (défaut 60) */
  y?: number;
  /** Délai en secondes */
  delay?: number;
  /** Stagger pour les enfants directs */
  stagger?: number;
  /** Activer le stagger sur les enfants */
  staggerChildren?: boolean;
  className?: string;
}

/**
 * Wrapper qui révèle son contenu au scroll avec GSAP.
 * Utilise ScrollTrigger pour un effet cinématique.
 */
export function ScrollReveal({
  children,
  y = 60,
  delay = 0,
  stagger = 0.12,
  staggerChildren = false,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = staggerChildren ? Array.from(el.children) : [el];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          delay,
          stagger: staggerChildren ? stagger : 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [y, delay, stagger, staggerChildren]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
