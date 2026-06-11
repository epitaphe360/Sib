import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { SIB2026 } from './tokens';
import { SIB2026_ASSETS } from './assets';
import { Sib2026Picture } from './Sib2026Picture';

const MILESTONES = [
  { year: '1986', titleKey: 'mockup.timeline.y1986_title', descKey: 'mockup.timeline.y1986_desc', img: 0 },
  { year: '2000', titleKey: 'mockup.timeline.y2000_title', descKey: 'mockup.timeline.y2000_desc', img: 1 },
  { year: '2012', titleKey: 'mockup.timeline.y2012_title', descKey: 'mockup.timeline.y2012_desc', img: 2 },
  { year: '2022', titleKey: 'mockup.timeline.y2022_title', descKey: 'mockup.timeline.y2022_desc', img: 3 },
  { year: '2026', titleKey: 'mockup.timeline.y2026_title', descKey: 'mockup.timeline.y2026_desc', img: 4 },
] as const;

export const Sib2026TimelineSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="sib2026-container">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16 items-start">
          <div className="lg:pt-2">
            <h2
              className="sib2026-display text-2xl font-extrabold uppercase leading-tight mb-6"
              style={{ color: SIB2026.navy }}
            >
              {t('mockup.timeline.title')}
            </h2>
            <Link
              to={ROUTES.EDITIONS}
              className="sib2026-btn-navy-outline inline-flex items-center gap-2 px-5 py-2.5 text-[10px]"
            >
              {t('mockup.timeline.cta')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="relative">
            <div className="hidden lg:block sib2026-timeline-line" aria-hidden />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
              {MILESTONES.map((m) => (
                <article key={m.year} className="relative">
                  <div className="hidden lg:flex mb-4 h-[18px] items-center">
                    <span className="sib2026-timeline-dot" aria-hidden />
                  </div>
                  <p className="text-[15px] font-extrabold mb-1 lg:mb-2 lg:-mt-1" style={{ color: SIB2026.orange }}>
                    {m.year}
                  </p>
                  <h3
                    className="text-[10px] font-extrabold uppercase tracking-wide mb-1 leading-snug"
                    style={{ color: SIB2026.navy }}
                  >
                    {t(m.titleKey)}
                  </h3>
                  <p className="text-[10px] leading-relaxed text-neutral-500 mb-3 min-h-[2.8em]">
                    {t(m.descKey)}
                  </p>
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                    <Sib2026Picture
                      asset={SIB2026_ASSETS.timeline[m.img]}
                      alt={`SIB ${m.year} — ${t(m.titleKey)}`}
                      className="h-full w-full object-cover grayscale-[15%]"
                      sizes="(min-width:1024px) 180px, 45vw"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

