'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stat {
  value: number
  suffix: string
  label: string
  description: string
}

// ─── Données ─────────────────────────────────────────────────────────────────

const STATS: Stat[] = [
  {
    value: 127,
    suffix: '',
    label: 'Projets Livrés',
    description: 'De la villa privée à la tour commerciale',
  },
  {
    value: 30,
    suffix: '+',
    label: "Années d'Expertise",
    description: 'De maîtrise artisanale ininterrompue',
  },
  {
    value: 18,
    suffix: '',
    label: 'Pays Présents',
    description: 'Sur les 5 continents habités',
  },
  {
    value: 96,
    suffix: '%',
    label: 'Clients Satisfaits',
    description: 'Recommandent nos services',
  },
]

const EASE_PRESTIGE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Compteur animé ───────────────────────────────────────────────────────────

interface AnimatedCounterProps {
  value: number
  suffix: string
  isInView: boolean
  delay: number
}

function AnimatedCounter({ value, suffix, isInView, delay }: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.floor(v))

  useEffect(() => {
    if (!isInView) return
    const controls = animate(count, value, {
      duration: 2.2,
      delay,
      ease: EASE_PRESTIGE,
    })
    return () => controls.stop()
  }, [isInView, count, value, delay])

  return (
    <div className="flex items-baseline justify-center gap-1">
      <motion.span
        className="font-cormorant font-light text-[#4A4A4A] leading-none tracking-[-0.035em]"
        style={{ fontSize: 'clamp(3.2rem, 5.5vw, 5rem)' }}
      >
        {rounded}
      </motion.span>
      {suffix && (
        <span
          className="font-cormorant font-light text-[#E7D192] leading-none"
          style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}

// ─── Cellule de stat ──────────────────────────────────────────────────────────

interface StatCellProps {
  stat: Stat
  index: number
}

function StatCell({ stat, index }: StatCellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-15%' })

  const isLastInRow = index % 2 === 1
  const isLastRow = index >= 2

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.9,
        delay: index * 0.1,
        ease: EASE_PRESTIGE,
      }}
      className={`
        relative flex flex-col items-center justify-center px-8 py-14 text-center
        border-r border-b border-[#EEE]
        ${isLastInRow ? 'border-r-0 md:border-r' : ''}
        ${isLastRow ? 'border-b-0' : ''}
        md:last:border-r-0
      `}
    >
      {/* Accent doré en haut */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px bg-[#E7D192]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
      />

      <AnimatedCounter
        value={stat.value}
        suffix={stat.suffix}
        isInView={isInView}
        delay={index * 0.15}
      />

      <p className="font-inter text-[11px] font-medium tracking-[0.12em] text-[#4A4A4A] uppercase mt-4 mb-2">
        {stat.label}
      </p>

      <p className="font-inter text-[11px] font-light text-[#4A4A4A]/35 leading-[1.6] max-w-[140px]">
        {stat.description}
      </p>
    </motion.div>
  )
}

// ─── Heritage section ─────────────────────────────────────────────────────────

export default function Heritage() {
  return (
    <section
      id="heritage"
      className="py-28 md:py-40 bg-[#FAFAF8]"
      style={{ borderTop: '0.5px solid #EEE', borderBottom: '0.5px solid #EEE' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── En-tête ── */}
        <div className="max-w-2xl mb-20 md:mb-28">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-inter text-[10px] tracking-[0.38em] text-[#E7D192] uppercase mb-4"
          >
            03 / Notre Héritage
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: EASE_PRESTIGE }}
            className="font-cormorant font-light tracking-[-0.025em] text-[#4A4A4A] leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)' }}
          >
            Des Chiffres qui
            <br />
            <em className="italic text-[#E7D192]">Parlent d&apos;Eux-Mêmes</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_PRESTIGE }}
            className="font-inter text-[14px] font-light text-[#4A4A4A]/45 leading-[1.9]"
          >
            Trois décennies de passion architecturale, de rigueur constructive
            et d&apos;une relation d&apos;exception avec chaque client.
          </motion.p>
        </div>

        {/* ── Grille des statistiques ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[#EEE]">
          {STATS.map((stat, idx) => (
            <StatCell key={stat.label} stat={stat} index={idx} />
          ))}
        </div>

        {/* ── Citation ── */}
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: EASE_PRESTIGE }}
          className="mt-20 md:mt-28 text-center max-w-2xl mx-auto"
        >
          <div className="font-cormorant text-5xl text-[#E7D192]/40 leading-none mb-4">
            &ldquo;
          </div>
          <p className="font-cormorant text-[1.4rem] md:text-[1.7rem] font-light italic text-[#4A4A4A]/60 leading-[1.5] tracking-[-0.01em]">
            L&apos;architecture, c&apos;est la volonté d&apos;une époque traduite
            en espace. Vivante, changeante, neuve.
          </p>
          <footer className="mt-6 font-inter text-[10px] tracking-[0.25em] text-[#E7D192] uppercase">
            — Ludwig Mies van der Rohe
          </footer>
        </motion.blockquote>
      </div>
    </section>
  )
}
