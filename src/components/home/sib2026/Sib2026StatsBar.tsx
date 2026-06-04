import React from 'react';

import { Users, UserCheck, Globe2, Medal } from 'lucide-react';

import { useTranslation } from '../../../hooks/useTranslation';

import { SIB2026 } from './tokens';



const STATS = [

  { icon: Users, valueKey: 'mockup.stats.exhibitors_value', labelKey: 'mockup.stats.exhibitors_label' },

  { icon: UserCheck, valueKey: 'mockup.stats.visitors_value', labelKey: 'mockup.stats.visitors_label' },

  { icon: Medal, valueKey: 'mockup.stats.history_value', labelKey: 'mockup.stats.history_label' },

  { icon: Globe2, valueKey: 'mockup.stats.countries_value', labelKey: 'mockup.stats.countries_label' },

] as const;



export const Sib2026StatsBar: React.FC = () => {

  const { t } = useTranslation();



  return (

    <section style={{ backgroundColor: SIB2026.navy }}>

      <div className="sib2026-container">

        <div className="grid grid-cols-2 lg:grid-cols-4">

          {STATS.map(({ icon: Icon, valueKey, labelKey }, i) => (

            <div

              key={valueKey}

              className={`flex items-center gap-4 py-8 lg:py-9 ${

                i > 0 ? 'lg:border-l border-white/12' : ''

              } ${i >= 2 ? 'border-t lg:border-t-0 border-white/12' : ''}`}

            >

              <Icon className="h-9 w-9 shrink-0" style={{ color: SIB2026.orange }} strokeWidth={1.25} />

              <div>

                <div

                  className="text-[26px] lg:text-[30px] font-extrabold leading-none tabular-nums mb-1"

                  style={{ color: SIB2026.orange }}

                >

                  {t(valueKey)}

                </div>

                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white leading-snug">

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


