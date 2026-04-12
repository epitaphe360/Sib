import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, Mic2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const stats = [
  {
    icon: Building2,
    value: '300+',
    labelKey: 'stats.exhibitors',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    glowColor: 'from-blue-400/30'
  },
  {
    icon: Users,
    value: '6,000+',
    labelKey: 'stats.visitors',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    glowColor: 'from-emerald-400/30'
  },
  {
    icon: Globe,
    value: '40',
    labelKey: 'stats.countries',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    glowColor: 'from-purple-400/30'
  },
  {
    icon: Mic2,
    value: '40+',
    labelKey: 'stats.conferences',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    glowColor: 'from-amber-400/30'
  }
];

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-0 w-96 h-96 bg-sib-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="group"
            >
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
                {/* Glow effect on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${stat.glowColor} to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                
                <div className="relative flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${stat.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>

                  {/* Value */}
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-1 tracking-tight">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-sm sm:text-base font-medium text-blue-100 uppercase tracking-wider">
                    {t(stat.labelKey) || stat.labelKey.split('.')[1]}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
