import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Format avec séparateur de milliers */
  format?: boolean;
}

/**
 * Compteur animé qui démarre quand il entre dans le viewport.
 */
export function CountUp({
  to,
  duration = 2.5,
  prefix = '',
  suffix = '',
  className = '',
  format = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          const v = Math.floor(obj.value);
          el.textContent = `${prefix}${format ? v.toLocaleString('fr-FR') : v}${suffix}`;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
  }, [to, duration, prefix, suffix, format]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
