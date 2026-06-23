import React from 'react';
import { Users, UserCheck, Award, Globe2 } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';

const STATS = [
  { icon: Users, valueKey: 'mockup.stats.exhibitors_value', labelKey: 'mockup.stats.exhibitors_label' },
  { icon: UserCheck, valueKey: 'mockup.stats.visitors_value', labelKey: 'mockup.stats.visitors_label' },
  { icon: Award, valueKey: 'mockup.stats.history_value', labelKey: 'mockup.stats.history_label' },
  { icon: Globe2, valueKey: 'mockup.stats.countries_value', labelKey: 'mockup.stats.countries_label' },
] as const;

export const MockupStatsBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section style={{ backgroundColor: MOCKUP.navy }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, valueKey, labelKey }, i) => (
            <div
              key={valueKey}
              className={`flex items-center gap-3 sm:gap-4 px-5 sm:px-8 py-7 lg:py-8 ${
                i > 0 ? 'border-l border-white/12' : ''
              } ${i === 2 ? 'border-l max-lg:border-l-0 max-lg:border-t max-lg:border-white/12' : ''}`}
            >
              <Icon className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" style={{ color: MOCKUP.orange }} strokeWidth={1.5} />
              <div>
                <div
                  className="text-xl sm:text-2xl lg:text-[26px] font-extrabold leading-none tabular-nums mb-1"
                  style={{ color: MOCKUP.orange }}
                >
                  {t(valueKey)}
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-white leading-snug">
                  {t(labelKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
