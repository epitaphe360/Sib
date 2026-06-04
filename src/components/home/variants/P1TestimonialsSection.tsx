import React from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Ahmed Bennani',
    role: 'Directeur Général',
    company: 'Groupe Construction Maroc',
    content: 'Le SIB a été une opportunité exceptionnelle pour rencontrer les acteurs clés du secteur et découvrir les dernières innovations en matière de construction durable.',
    rating: 5,
  },
  {
    name: 'Fatima El Idrissi',
    role: 'Responsable Achats',
    company: 'Immobilier Prestige',
    content: 'Grâce au networking B2B du SIB, nous avons établi des partenariats stratégiques qui ont transformé nos projets. Un événement indispensable.',
    rating: 5,
  },
  {
    name: 'Mohamed Karim',
    role: 'Entrepreneur',
    company: 'StartUp Tech BTP',
    content: 'L\'espace innovation du SIB m\'a permis de présenter ma startup à des investisseurs et des clients potentiels. Résultats exceptionnels !',
    rating: 5,
  },
];

/**
 * P1 — Testimonials Section
 * Section de témoignages pour renforcer la confiance et la conversion
 */
export const P1TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Ce que disent nos visiteurs
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Découvrez les témoignages de professionnels qui ont transformé leur activité grâce au SIB
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
