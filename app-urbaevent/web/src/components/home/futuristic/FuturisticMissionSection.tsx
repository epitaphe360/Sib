import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Ticket } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
 * Mission section — GSAP horizontal reveal
 * ========================================================= */
export function FuturisticMissionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Expanding line */
      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      /* Text stagger */
      gsap.from(textRef.current?.querySelectorAll('.gsap-line') ?? [], {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      });

      /* Image parallax */
      gsap.to(imgRef.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="futuristic-page relative bg-[#000D24] py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-0 top-0 w-[50%] h-full opacity-15"
          style={{
            background: 'linear-gradient(to right, #1B365D, transparent)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Text content */}
          <div>
            <p className="section-label-futuristic mb-6">Notre Mission</p>

            {/* Expanding line */}
            <div
              ref={lineRef}
            className="h-px mb-10 origin-left"
            style={{ background: 'linear-gradient(to right, #F39200, #5E8FBE, transparent)', width: '100%' }}
            />

            <div ref={textRef} className="space-y-5">
              <h2 className="gsap-line font-display text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                Façonner<br />
                <span className="holo-text">l'avenir</span><br />
                du bâtiment
              </h2>
              <p className="gsap-line text-[#8BB8D8]/80 text-lg leading-relaxed">
                Depuis 40 ans, le Salon International du Bâtiment fédère les acteurs
                de la construction autour d'une vision commune : bâtir un Maroc moderne,
                durable et innovant.
              </p>
              <p className="gsap-line text-[#8BB8D8]/65 text-base leading-relaxed">
                SIB 2026 est le carrefour incontournable où architectes, ingénieurs,
                promoteurs et industriels se rencontrent pour dessiner ensemble les
                villes et bâtiments de demain.
              </p>

              <div className="gsap-line flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={ROUTES.PRESENTATION}>
                  <button className="btn-futuristic-outline flex items-center gap-2">
                    Découvrir le salon
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION}>
                  <button className="btn-futuristic-primary flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Exposer au SIB
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right — Visual panel */}
          <div ref={imgRef} className="relative">
            <div className="holo-border glass-panel p-8 relative overflow-hidden">
              {/* Blueprint grid background */}
              <div className="absolute inset-0 holo-grid-bg opacity-20" />

              {/* Content */}
              <div className="relative z-10 space-y-6">
                <p className="section-label-futuristic">SIB 2026 · En bref</p>

                {[
                  { value: '25 – 28 Nov 2026', label: 'Dates',               color: '#F39200' },
                  { value: 'Casablanca · OFEC', label: 'Lieu',               color: '#5E8FBE' },
                  { value: '50 000 m²', label: 'Surface d\'exposition',      color: '#2E5984' },
                  { value: '300+ exposants', label: 'Marques représentées',  color: '#2E5984' },
                  { value: '4 jours', label: 'D\'immersion totale',          color: '#5E8FBE' },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex items-center justify-between border-b border-[#00D4FF]/10 pb-3"
                  >
                    <span className="text-[#8BB8D8]/60 text-sm">{row.label}</span>
                    <span
                      className="font-bold text-base"
                      style={{ color: row.color }}
                    >
                      {row.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Corner glow */}
              <div
          className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(243,146,0,0.15), transparent)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
 * Futuristic CTA Banner — full-width gradient call-to-action
 * ========================================================= */
export function FuturisticCTABanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bannerRef.current?.querySelectorAll('.gsap-cta') ?? [], {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bannerRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    }, bannerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={bannerRef}
      className="futuristic-page relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #000912 0%, #001A3D 50%, #000D24 100%)',
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(46,89,132,0.18), transparent)',
        }}
      />

      {/* Top/bottom lines */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(to right, transparent, #F3920040, #5E8FBE40, transparent)',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(to right, transparent, #F3920040, #5E8FBE40, transparent)',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="gsap-cta section-label-futuristic justify-center mb-6">
          Participez à SIB 2026
        </div>
        <h2 className="gsap-cta font-display text-4xl md:text-6xl font-black text-white leading-tight mb-6">
          Votre présence,{' '}
          <span className="holo-text">notre force</span>
        </h2>
        <p className="gsap-cta text-[#8BB8D8]/70 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Que vous soyez visiteur, exposant ou partenaire, SIB 2026 vous offre une plateforme
          unique pour développer votre activité et élargir votre réseau professionnel.
        </p>
        <div className="gsap-cta flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
            <button className="btn-futuristic-primary flex items-center gap-2 text-base px-8 py-4">
              <Ticket className="w-5 h-5" />
              Obtenir mon badge visiteur
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION}>
            <button className="btn-futuristic-outline flex items-center gap-2 text-base px-8 py-4">
              Réserver mon stand
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
