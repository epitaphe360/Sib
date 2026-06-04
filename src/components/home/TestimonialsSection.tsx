/**
 * SIB 2026 — TestimonialsSection
 * Temoignages — cartes claires, citation, rating, signature.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useSupabaseTestimonials } from '../../hooks/useSupabaseContent';

interface TestimonialCardProps {
  name: string;
  company: string;
  position?: string;
  quote: string;
  photo_url?: string;
  rating?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  company,
  position,
  quote,
  photo_url,
  rating = 5,
}) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B365D&color=fff&size=128`;

  return (
    <div className="group relative h-full flex flex-col rounded-2xl p-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Decorative quote */}
      <Quote className="absolute top-5 right-5 w-10 h-10 text-accent-500/10 dark:text-accent-500/15" strokeWidth={1.5} />

      {/* Rating */}
      {rating && (
        <div className="flex gap-1 mb-5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating
                  ? 'text-accent-500 fill-accent-500'
                  : 'text-neutral-300 dark:text-neutral-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* Citation */}
      <blockquote className="text-base text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed flex-grow">
        « {quote} »
      </blockquote>

      {/* Signature */}
      <div className="flex items-center gap-4 pt-5 border-t border-neutral-100 dark:border-neutral-800">
        <img
          src={photo_url || defaultAvatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-accent-500/30"
          onError={(e) => {
            e.currentTarget.src = defaultAvatar;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-neutral-900 dark:text-white text-sm truncate tracking-tight">
            {name}
          </div>
          {position && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
              {position}
            </div>
          )}
          <div className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">
            {company}
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultTestimonials: TestimonialCardProps[] = [
  {
    name: 'Mohamed Al-Fassi',
    company: 'Tanger Med Bâtiment Authority',
    position: 'Directeur Général',
    quote:
      "SIB a été un catalyseur exceptionnel pour le développement de nos partenariats stratégiques en Afrique. Un événement incontournable.",
    rating: 5,
  },
  {
    name: 'Sarah Dubois',
    company: 'CMA CGM Group',
    position: 'VP Operations Africa',
    quote:
      "La qualité du networking et des conférences font de SIB le rendez-vous annuel de référence pour l'industrie du bâtiment africaine.",
    rating: 5,
  },
  {
    name: 'Ahmed Benkirane',
    company: 'Marsa Maroc',
    position: 'Directeur Innovation',
    quote:
      "SIB nous a permis de découvrir les dernières technologies Smart Bâtiment et d'établir des connexions précieuses avec des leaders mondiaux.",
    rating: 5,
  },
];

export const TestimonialsSection: React.FC = () => {
  const { data: supabaseTestimonials, loading } = useSupabaseTestimonials(3);
  const testimonials = supabaseTestimonials?.length > 0 ? supabaseTestimonials : defaultTestimonials;

  return (
    <section className="relative py-20 lg:py-24 bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">Témoignages</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            Ce que disent nos <span className="sib-text-gradient">participants</span>
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Découvrez les expériences des professionnels qui ont participé à SIB.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl p-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 h-64">
                <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-2 w-5/6" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-6 w-3/4" />
                <div className="h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
