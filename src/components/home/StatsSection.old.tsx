import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, Mic2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const stats = [
  {
    icon: Building2,
    value: '600+',
    labelKey: 'stats.exhibitors',
    iconColor: '#E7D192',
  },
  {
    icon: Users,
    value: '200 000+',
    labelKey: 'stats.visitors',
    iconColor: '#E7D192',
  },
  {
    icon: Globe,
    value: '50',
    labelKey: 'stats.countries',
    iconColor: '#E7D192',
  },
  {
    icon: Mic2,
    value: '40+',
    labelKey: 'stats.conferences',
    iconColor: '#E7D192',
  }
];

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Fine ligne dorée en haut */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px]" style={{ background: 'rgba(231,209,146,0.4)' }} />

      {/* Ambient glow subtil */}
      <div className="absolute top-0 left-1/4 w-96 h-48 opacity-[0.4]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(231,209,146,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group text-center"
            >
              {/* Carte glassmorphism ultra-légère */}
              <div className="luxury-card p-8 sm:p-10 flex flex-col items-center">
                {/* Icône */}
                <div className="mb-5 p-3 rounded-sm"
                  style={{ background: 'rgba(231,209,146,0.1)', border: '0.5px solid rgba(231,209,146,0.25)' }}>
                  <stat.icon className="h-5 w-5" style={{ color: '#C9A84C' }} />
                </div>

                {/* Valeur */}
                <div className="text-4xl sm:text-5xl font-light mb-2 tracking-tight"
                  style={{ fontFamily: '"Cormorant Garamond", serif', color: '#1A1A1A' }}>
                  {stat.value}
                </div>

                {/* Ligne décorative */}
                <div className="w-8 h-[0.5px] mb-3" style={{ background: '#E7D192' }} />

                {/* Label */}
                <div className="text-xs font-light tracking-[0.15em] uppercase"
                  style={{ color: '#888' }}>
                  {t(stat.labelKey) || stat.labelKey.split('.')[1]}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fine ligne dorée en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px]" style={{ background: 'rgba(231,209,146,0.4)' }} />
    </section>
  );
};
