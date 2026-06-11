import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { SIB2026 } from './tokens';
import { useSiteImage } from '../../../hooks/useSiteImage';
import type { SiteImageKey } from '../../../config/siteImagesConfig';

const MILESTONES = [
  { year: '1986', titleKey: 'mockup.timeline.y1986_title', descKey: 'mockup.timeline.y1986_desc', imageKey: 'sib2026_timeline_1' as SiteImageKey },
  { year: '2000', titleKey: 'mockup.timeline.y2000_title', descKey: 'mockup.timeline.y2000_desc', imageKey: 'sib2026_timeline_2' as SiteImageKey },
  { year: '2012', titleKey: 'mockup.timeline.y2012_title', descKey: 'mockup.timeline.y2012_desc', imageKey: 'sib2026_timeline_3' as SiteImageKey },
  { year: '2022', titleKey: 'mockup.timeline.y2022_title', descKey: 'mockup.timeline.y2022_desc', imageKey: 'sib2026_timeline_4' as SiteImageKey },
  { year: '2026', titleKey: 'mockup.timeline.y2026_title', descKey: 'mockup.timeline.y2026_desc', imageKey: 'sib2026_timeline_5' as SiteImageKey },
] as const;

const TimelineSlot: React.FC<{ year: string; titleKey: string; descKey: string; imageKey: SiteImageKey }> = ({ year, titleKey, descKey, imageKey }) => {
  const { t } = useTranslation();
  const { src } = useSiteImage(imageKey);
  return (
    <article className="relative">
      <div className="hidden lg:flex mb-4 h-[18px] items-center">
        <span className="sib2026-timeline-dot" aria-hidden />
      </div>
      <p className="text-[15px] font-extrabold mb-1 lg:mb-2 lg:-mt-1" style={{ color: SIB2026.orange }}>
        {year}
      </p>
      <h3
        className="text-[10px] font-extrabold uppercase tracking-wide mb-1 leading-snug"
        style={{ color: SIB2026.navy }}
      >
        {t(titleKey)}
      </h3>
      <p className="text-[10px] leading-relaxed text-neutral-500 mb-3 min-h-[2.8em]">
        {t(descKey)}
      </p>
      <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={src}
          alt={`SIB ${year} — ${t(titleKey)}`}
          className="h-full w-full object-cover grayscale-[15%]"
          loading="lazy"
          decoding="async"
          sizes="(min-width:1024px) 180px, 45vw"
        />
      </div>
    </article>
  );
};

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
              {MILESTONES.map(m => (
                <TimelineSlot key={m.year} year={m.year} titleKey={m.titleKey} descKey={m.descKey} imageKey={m.imageKey} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

