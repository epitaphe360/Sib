import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';

const MILESTONES = [
  { year: '1986', titleKey: 'mockup.timeline.y1986_title', descKey: 'mockup.timeline.y1986_desc' },
  { year: '2000', titleKey: 'mockup.timeline.y2000_title', descKey: 'mockup.timeline.y2000_desc' },
  { year: '2012', titleKey: 'mockup.timeline.y2012_title', descKey: 'mockup.timeline.y2012_desc' },
  { year: '2022', titleKey: 'mockup.timeline.y2022_title', descKey: 'mockup.timeline.y2022_desc' },
  { year: '2026', titleKey: 'mockup.timeline.y2026_title', descKey: 'mockup.timeline.y2026_desc' },
] as const;

export const MockupTimelineSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-[#ecece8] py-12 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
          <div>
            <h2 className="mockup-display text-xl lg:text-2xl font-extrabold uppercase leading-tight mb-5" style={{ color: MOCKUP.navy }}>
              {t('mockup.timeline.title')}
            </h2>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wide border"
              style={{ color: MOCKUP.navy, borderColor: MOCKUP.navy }}
            >
              {t('mockup.timeline.cta')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {MILESTONES.map((m) => (
              <div key={m.year}>
                <p className="text-sm font-extrabold mb-1" style={{ color: MOCKUP.orange }}>{m.year}</p>
                <h3 className="text-[10px] font-extrabold uppercase tracking-wide mb-1 leading-snug" style={{ color: MOCKUP.navy }}>
                  {t(m.titleKey)}
                </h3>
                <p className="text-[10px] leading-relaxed text-neutral-600">{t(m.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
