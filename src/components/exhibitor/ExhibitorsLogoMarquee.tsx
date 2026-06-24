import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

const MARQUEE_CSS = `
@keyframes sib-exhibitors-marquee-scroll {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}
.sib-exhibitors-marquee {
  overflow: hidden;
  width: 100%;
  position: relative;
}
.sib-exhibitors-marquee__fade-left,
.sib-exhibitors-marquee__fade-right {
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3rem;
  z-index: 2;
}
@media (min-width: 640px) {
  .sib-exhibitors-marquee__fade-left,
  .sib-exhibitors-marquee__fade-right { width: 5rem; }
}
.sib-exhibitors-marquee__fade-left {
  left: 0;
  background: linear-gradient(to right, var(--marquee-fade, #fafafa), transparent);
}
.sib-exhibitors-marquee__fade-right {
  right: 0;
  background: linear-gradient(to left, var(--marquee-fade, #fafafa), transparent);
}
.sib-exhibitors-marquee__track {
  display: flex;
  width: max-content;
  align-items: center;
  gap: 1.25rem;
  animation: sib-exhibitors-marquee-scroll var(--marquee-duration, 60s) linear infinite;
  will-change: transform;
}
.sib-exhibitors-marquee:hover .sib-exhibitors-marquee__track {
  animation-play-state: paused;
}
.sib-exhibitors-marquee__item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  width: 6.5rem;
  padding: 0.25rem 0.625rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.sib-exhibitors-marquee__item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.sib-exhibitors-marquee__item img {
  display: block;
  max-height: 2rem;
  max-width: 5.5rem;
  width: auto;
  height: auto;
  object-fit: contain;
}
@media (min-width: 640px) {
  .sib-exhibitors-marquee__item {
    height: 3.25rem;
    width: 7rem;
  }
  .sib-exhibitors-marquee__item img {
    max-height: 2.25rem;
    max-width: 6rem;
  }
}
`;

export interface ExhibitorsLogoMarqueeItem {
  to: string;
  src: string;
  alt: string;
}

interface ExhibitorsLogoMarqueeProps {
  logos: ExhibitorsLogoMarqueeItem[];
  fadeBg?: string;
  /** Durée d'un cycle complet (plus élevé = défilement plus lent) */
  durationSeconds?: number;
}

export default function ExhibitorsLogoMarquee({
  logos,
  fadeBg = '#fafafa',
  durationSeconds,
}: ExhibitorsLogoMarqueeProps) {
  if (logos.length === 0) return null;

  const copies = Math.max(4, Math.ceil(18 / logos.length));
  const sequence = Array.from({ length: copies }, () => logos).flat();
  const track = [...sequence, ...sequence];
  const duration = durationSeconds ?? Math.max(60, Math.min(120, logos.length * 16));

  return (
    <>
      <style>{MARQUEE_CSS}</style>
      <div
        className="sib-exhibitors-marquee"
        style={{ '--marquee-fade': fadeBg, '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        <div className="sib-exhibitors-marquee__fade-left" aria-hidden />
        <div className="sib-exhibitors-marquee__fade-right" aria-hidden />
        <div className="sib-exhibitors-marquee__track">
          {track.map((logo, index) => (
            <Link
              key={`${logo.to}-${index}`}
              to={logo.to}
              className="sib-exhibitors-marquee__item"
              title={logo.alt}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
