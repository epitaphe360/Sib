import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { DM } from '../../../design/designMasterTokens';

const TESTIMONIAL_IDS = ['t1', 't2', 't3'] as const;

/** P1 — Témoignages visiteurs */
export const P1TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = useMemo(
    () =>
      TESTIMONIAL_IDS.map((id) => ({
        id,
        name: t(`home.p1_testimonials.${id}_name`),
        role: t(`home.p1_testimonials.${id}_role`),
        company: t(`home.p1_testimonials.${id}_company`),
        content: t(`home.p1_testimonials.${id}_content`),
      })),
    [t],
  );

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-14"
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: DM.orange }}
          >
            {t('home.p1_testimonials.kicker')}
          </p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: DM.navy }}>
            {t('home.p1_testimonials.title')}
          </h2>
          <p className="text-[#001A3D]/65 max-w-2xl mx-auto">{t('home.p1_testimonials.desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...DM.springSoft, delay: index * 0.08 }}
              whileHover={{ scale: DM.hoverScale }}
              className="rounded-[32px] p-8 border border-[#001A3D]/08 shadow-[0_8px_32px_rgba(0,26,61,0.06)] bg-[#ECECE8]/50"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#F39200] text-[#F39200]" />
                ))}
              </div>

              <p className="text-[#001A3D]/80 mb-6 leading-relaxed italic">&ldquo;{testimonial.content}&rdquo;</p>

              <div className="flex items-center gap-3 pt-6 border-t border-[#001A3D]/10">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${DM.navy}10` }}
                >
                  <User className="h-5 w-5" style={{ color: DM.navy }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: DM.navy }}>
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#001A3D]/50">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default P1TestimonialsSection;
