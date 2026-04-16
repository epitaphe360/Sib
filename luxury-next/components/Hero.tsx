'use client'

import { useRef, useCallback } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'

// ─── Constantes d'animation ──────────────────────────────────────────────────

const EASE_PRESTIGE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const revealVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.4,
      delay,
      ease: EASE_PRESTIGE,
    },
  }),
}

// ─── Magnetic CTA principal ──────────────────────────────────────────────────

function MagneticCTA() {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 18 })
  const springY = useSpring(y, { stiffness: 150, damping: 18 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.28)
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.28)
    },
    [x, y],
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="group relative px-12 py-4 bg-[#4A4A4A] overflow-hidden font-inter text-[11px] font-medium tracking-[0.22em] uppercase text-white"
    >
      {/* Wash doré au hover */}
      <motion.span
        className="absolute inset-0 bg-[#E7D192]"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.5, ease: EASE_PRESTIGE }}
      />
      <span className="relative z-10 group-hover:text-[#4A4A4A] transition-colors duration-300">
        Voir nos Réalisations
      </span>
    </motion.button>
  )
}

// ─── Lignes de grille décoratives ────────────────────────────────────────────

function GridLines() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* Lignes verticales */}
      <div className="absolute inset-0 grid grid-cols-6 opacity-[0.04]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border-r border-[#4A4A4A] h-full" />
        ))}
      </div>

      {/* Halo de lumière central */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 65% at 50% 45%, rgba(231,209,146,0.07) 0%, transparent 68%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />

      {/* Ligne horizontale dorée */}
      <motion.div
        className="absolute left-12 right-12 top-1/2 h-px bg-gradient-to-r from-transparent via-[#E7D192]/20 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.8, ease: EASE_PRESTIGE }}
      />
    </div>
  )
}

// ─── Indicateur de scroll ────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 1 }}
    >
      <span className="font-inter text-[8px] tracking-[0.4em] text-[#4A4A4A]/25 uppercase">
        Scroll
      </span>
      <div className="relative w-px h-14 overflow-hidden">
        <div className="absolute inset-0 bg-[#EEE]" />
        <motion.div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#E7D192] to-transparent"
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ height: '60%' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Hero principal ───────────────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[680px] flex items-center justify-center overflow-hidden bg-white"
    >
      <GridLines />

      {/* Numéro de section */}
      <motion.span
        aria-hidden="true"
        className="absolute top-36 left-6 md:left-12 font-inter text-[10px] tracking-[0.3em] text-[#4A4A4A]/20 uppercase"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: EASE_PRESTIGE }}
      >
        01 / Hero
      </motion.span>

      {/* Année verticale */}
      <motion.span
        aria-hidden="true"
        className="absolute top-1/2 right-6 md:right-12 -translate-y-1/2 font-inter text-[9px] tracking-[0.35em] text-[#4A4A4A]/15 uppercase"
        style={{ writingMode: 'vertical-rl' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        Depuis 1994
      </motion.span>

      {/* ─── Contenu central ─── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.p
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="font-inter text-[10px] font-light tracking-[0.4em] text-[#E7D192] uppercase mb-12"
        >
          Maison d&apos;Architecture · Fondée en 1994
        </motion.p>

        {/* Titre principal */}
        <div className="overflow-visible mb-8">
          <motion.h1
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            custom={0.35}
            className="font-cormorant font-light leading-[0.92] tracking-[-0.025em] text-[#4A4A4A]"
            style={{ fontSize: 'clamp(3.8rem, 9vw, 8.5rem)' }}
          >
            L&apos;Excellence
            <br />
            <em className="italic text-[#E7D192]">Transcende</em>
            <br />
            le Temps
          </motion.h1>
        </div>

        {/* Séparateur doré */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0.6}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="w-12 h-px bg-[#E7D192]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#E7D192]/50" />
          <div className="w-12 h-px bg-[#E7D192]/40" />
        </motion.div>

        {/* Sous-titre */}
        <motion.p
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0.7}
          className="font-inter text-[14px] md:text-[15px] font-light text-[#4A4A4A]/50 leading-[1.9] max-w-md mx-auto mb-14"
        >
          Nous concevons des espaces qui ne se contentent pas d&apos;exister.
          Ils respirent, ils dialoguent, ils perdurent.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          custom={0.9}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          <MagneticCTA />

          <a
            href="#philosophie"
            className="group font-inter text-[11px] font-light tracking-[0.15em] text-[#4A4A4A]/40 uppercase flex items-center gap-3 hover:text-[#4A4A4A] transition-colors duration-400"
          >
            <span className="w-7 h-px bg-current group-hover:w-12 transition-all duration-500 group-hover:bg-[#E7D192]" />
            Notre philosophie
          </a>
        </motion.div>
      </motion.div>

      <ScrollIndicator />
    </section>
  )
}
