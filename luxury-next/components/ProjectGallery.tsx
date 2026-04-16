'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────

type ProjectSize = 'large' | 'small'

interface Project {
  id: number
  title: string
  location: string
  year: string
  category: string
  image: string
  size: ProjectSize
}

// ─── Données ─────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Villa Solstice',
    location: 'Côte d\'Azur, France',
    year: '2024',
    category: 'Résidentiel',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85',
    size: 'large',
  },
  {
    id: 2,
    title: 'Tour Zénith',
    location: 'Paris 8e, France',
    year: '2023',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=85',
    size: 'small',
  },
  {
    id: 3,
    title: 'Résidence Lumière',
    location: 'Genève, Suisse',
    year: '2023',
    category: 'Résidentiel',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85',
    size: 'small',
  },
  {
    id: 4,
    title: 'Pavillon de l\'Eau',
    location: 'Amsterdam, Pays-Bas',
    year: '2022',
    category: 'Institutionnel',
    image: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1400&q=85',
    size: 'large',
  },
]

// ─── Skeleton image ───────────────────────────────────────────────────────────

function ImageSkeleton() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#F5F3EE]" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─── Carte de projet ──────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project
  index: number
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Parallaxe inversé au scroll
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  const isLarge = project.size === 'large'

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{
        duration: 1.1,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden cursor-pointer group ${
        isLarge ? 'aspect-[3/4]' : 'aspect-[4/3]'
      }`}
      style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.03)' }}
    >
      {/* ── Skeleton pendant le chargement ── */}
      {!loaded && <ImageSkeleton />}

      {/* ── Image avec parallaxe ── */}
      <motion.div
        className="absolute inset-[-8%] will-change-transform"
        style={{ y: imageY }}
      >
        <Image
          src={project.image}
          alt={`${project.title} — ${project.location}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-700 ease-out ${
            hovered ? 'scale-[1.06]' : 'scale-100'
          }`}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>

      {/* ── Overlay gradient ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          hovered ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          background:
            'linear-gradient(to top, rgba(74,74,74,0.78) 0%, rgba(74,74,74,0.1) 45%, transparent 100%)',
        }}
      />

      {/* ── Encadrement doré au hover ── */}
      <motion.div
        className="absolute inset-3 border border-[#E7D192]/0 pointer-events-none"
        animate={{ borderColor: hovered ? 'rgba(231,209,146,0.35)' : 'rgba(231,209,146,0)' }}
        transition={{ duration: 0.4 }}
      />

      {/* ── Numéro d'index ── */}
      <motion.span
        aria-hidden="true"
        className="absolute top-5 right-5 font-inter text-[10px] tracking-[0.2em] text-white/30"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {String(index + 1).padStart(2, '0')}
      </motion.span>

      {/* ── Métadonnées (apparaissent au hover) ── */}
      <motion.div
        className="absolute top-5 left-5"
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="px-2.5 py-1 font-inter text-[8px] tracking-[0.25em] text-[#4A4A4A] uppercase bg-[#E7D192]/90">
          {project.category}
        </span>
      </motion.div>

      {/* ── Infos bas ── */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <motion.p
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-inter text-[9px] tracking-[0.3em] text-[#E7D192] uppercase mb-2"
        >
          {project.year}
        </motion.p>

        <h3 className="font-cormorant text-[1.6rem] md:text-[1.9rem] font-light text-white tracking-[-0.01em] leading-tight">
          {project.title}
        </h3>

        <div className="flex items-center justify-between mt-1.5">
          <p className="font-inter text-[10px] font-light text-white/50 tracking-[0.06em]">
            {project.location}
          </p>

          <motion.span
            animate={{ x: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            className="font-inter text-[9px] tracking-[0.2em] text-[#E7D192] uppercase flex items-center gap-1.5"
          >
            Voir
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className="flex-shrink-0"
            >
              <path
                d="M0 4H10.5M7.5 1L10.5 4L7.5 7"
                stroke="currentColor"
                strokeWidth="0.8"
              />
            </svg>
          </motion.span>
        </div>
      </div>
    </motion.article>
  )
}

// ─── Galerie principale ───────────────────────────────────────────────────────

export default function ProjectGallery() {
  return (
    <section id="projets" className="py-28 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* ── En-tête ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-inter text-[10px] tracking-[0.38em] text-[#E7D192] uppercase mb-4"
            >
              02 / Portfolio Sélectionné
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-cormorant font-light tracking-[-0.025em] text-[#4A4A4A] leading-[1.05]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.8rem)' }}
            >
              Réalisations
              <br />
              <em className="italic">Emblématiques</em>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex items-center gap-4 self-start md:self-auto"
          >
            <div className="font-inter text-[10px] tracking-[0.08em] text-[#4A4A4A]/30">
              {PROJECTS.length} projets
            </div>
            <div className="w-px h-4 bg-[#EEE]" />
            <a
              href="#"
              className="group flex items-center gap-3 font-inter text-[10px] tracking-[0.15em] text-[#4A4A4A]/50 uppercase hover:text-[#E7D192] transition-colors duration-300"
            >
              Tous les projets
              <span className="w-5 h-px bg-current group-hover:w-9 transition-all duration-400" />
            </a>
          </motion.div>
        </div>

        {/* ── Grille asymétrique Museum ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {PROJECTS.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
