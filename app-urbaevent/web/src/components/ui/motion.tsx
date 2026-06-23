import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Variants réutilisables                                            */
/* ------------------------------------------------------------------ */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  <ScrollReveal> — apparition au scroll                             */
/* ------------------------------------------------------------------ */

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: Variants;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  variant = fadeUp,
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  <StaggerReveal> — container qui stagger ses enfants               */
/* ------------------------------------------------------------------ */

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  slow?: boolean;
  delay?: number;
}

export function StaggerReveal({ children, className = '', slow = false, delay = 0 }: StaggerRevealProps) {
  return (
    <motion.div
      variants={slow ? staggerContainerSlow : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  <StaggerItem> — enfant au sein d'un StaggerReveal                 */
/* ------------------------------------------------------------------ */

interface StaggerItemProps {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
}

export function StaggerItem({ children, variant = fadeUp, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={variant}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  <HoverCard> — carte avec effet hover fluide                       */
/* ------------------------------------------------------------------ */

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  <AnimatedCounter> — compteur animé de 0 à la valeur cible         */
/* ------------------------------------------------------------------ */

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  // Extraire le nombre et le suffixe
  const match = value.match(/^([\d\s]+)(.*)/);
  if (!match) {return <span className={className}>{value}</span>;}

  const rawNumber = match[1].replace(/\s/g, '');
  const target = parseInt(rawNumber, 10);
  const suffix = match[2] || '';

  if (isNaN(target)) {return <span className={className}>{value}</span>;}

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <CountUp target={target} suffix={suffix} />
    </motion.span>
  );
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!ref.current) {return;}
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(target * eased));
            if (progress < 1) {requestAnimationFrame(step);}
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const formatted = count >= 1000 ? count.toLocaleString('fr-FR') : String(count);

  return (
    <span ref={ref}>
      {formatted}{suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  <HeroReveal> — animations spécifiques pour les hero sections      */
/* ------------------------------------------------------------------ */

interface HeroRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function HeroReveal({ children, className = '', delay = 0 }: HeroRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  <FloatingElement> — élément avec animation flottante continue     */
/* ------------------------------------------------------------------ */

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export function FloatingElement({
  children,
  className = '',
  amplitude = 10,
  duration = 3,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  <PageTransition> — wrapper de page pour transitions               */
/* ------------------------------------------------------------------ */

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/* Re-export framer-motion essentials */
export { motion, AnimatePresence };
