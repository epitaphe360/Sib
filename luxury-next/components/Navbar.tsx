'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Projets', href: '#projets' },
  { label: 'Philosophie', href: '#philosophie' },
  { label: 'Héritage', href: '#heritage' },
  { label: 'Contact', href: '#contact' },
]

// ─── Magnetic Button ────────────────────────────────────────────────────────

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
}

function MagneticButton({ children, className = '' }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 22 })
  const springY = useSpring(y, { stiffness: 200, damping: 22 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3)
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3)
  }, [x, y])

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
      className={className}
    >
      {children}
    </motion.button>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      // Cache au scroll vers le bas (>50px du haut), montre au scroll vers le haut
      if (currentY > 80) {
        setVisible(delta < 0)
      } else {
        setVisible(true)
      }

      setScrolled(currentY > 30)
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.nav
            key="navbar"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
              scrolled
                ? 'bg-white/80 backdrop-blur-[12px] border-b border-[#EEE]'
                : 'bg-transparent'
            }`}
            style={
              scrolled ? { WebkitBackdropFilter: 'blur(12px)' } : undefined
            }
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between">
              {/* ── Logo ── */}
              <Link href="/" className="flex flex-col leading-none select-none">
                <span className="font-cormorant text-[1.6rem] font-light tracking-[-0.02em] text-[#4A4A4A]">
                  Lumière
                </span>
                <span className="font-inter text-[9px] font-light tracking-[0.28em] text-[#E7D192] uppercase -mt-0.5">
                  Architecture
                </span>
              </Link>

              {/* ── Links desktop ── */}
              <nav
                aria-label="Navigation principale"
                className="hidden md:flex items-center gap-10"
              >
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="font-inter text-[11px] font-light tracking-[0.1em] text-[#4A4A4A] uppercase relative group overflow-hidden"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-[#E7D192] group-hover:w-full transition-all duration-400 ease-out" />
                  </a>
                ))}
              </nav>

              {/* ── CTA desktop ── */}
              <MagneticButton className="hidden md:flex items-center gap-2 px-7 py-3 border border-[#E7D192] hover:bg-[#E7D192]/10 transition-colors duration-400 font-inter text-[10px] font-medium tracking-[0.18em] uppercase text-[#4A4A4A]">
                Nous Contacter
              </MagneticButton>

              {/* ── Hamburger mobile ── */}
              <button
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden flex flex-col gap-1.5 p-2"
              >
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-px bg-[#4A4A4A] origin-center"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                  className="block w-4 h-px bg-[#4A4A4A]"
                  transition={{ duration: 0.25 }}
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-px bg-[#4A4A4A] origin-center"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Menu mobile overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-[16px] flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {NAV_LINKS.map(({ label, href }, i) => (
              <motion.a
                key={label}
                href={href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setMenuOpen(false)}
                className="font-cormorant text-4xl font-light tracking-[-0.01em] text-[#4A4A4A] hover:text-[#E7D192] transition-colors duration-300"
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
