/**
 * Section Témoignages sur la HomePage
 * Contenu depuis Supabase (ou fallback statique)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useSupabaseTestimonials } from '../../hooks/useSupabaseContent';
import { MoroccanPattern } from '../ui/MoroccanDecor';

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
  rating = 5
}) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=fff&size=128`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative bg-white/90 backdrop-blur-md rounded-2xl p-8 border-l-4 border-sib-gold shadow-lg hover:shadow-xl transition-all h-full"
    >
      {/* Pattern Zellige en arrière-plan */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <MoroccanPattern scale={0.5} />
      </div>

      <div className="relative z-10">
        {/* Quote icon décoratif */}
        <div className="absolute -top-4 -right-4 text-6xl text-sib-gold/10 font-serif">
          <Quote className="w-16 h-16" />
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-sib-gold fill-sib-gold' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Citation */}
        <blockquote className="text-lg italic text-slate-700 mb-6 leading-relaxed">
          "{quote}"
        </blockquote>

        {/* Auteur */}
        <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
          <img
            src={photo_url || defaultAvatar}
            alt={name}
            className="w-16 h-16 rounded-full border-4 border-sib-gold object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sib-primary text-lg truncate">
              {name}
            </div>
            {position && (
              <div className="text-sm text-slate-600 truncate">{position}</div>
            )}
            <div className="text-sm text-slate-500 font-semibold truncate">
              {company}
            </div>
          </div>
        </div>

        {/* Décoration carrés marocains */}
        <div className="absolute bottom-4 right-4 flex gap-1">
          <div className="w-2 h-2 bg-red-600 rotate-45" />
          <div className="w-2 h-2 bg-sib-gold rotate-45" />
          <div className="w-2 h-2 bg-green-600 rotate-45" />
        </div>
      </div>
    </motion.div>
  );
};

// Témoignages par défaut (reflètent les vraies données Supabase — seed_testimonials_sib.sql)
const defaultTestimonials: TestimonialCardProps[] = [
  {
    name: 'Karim Tazi',
    company: 'LafargeHolcim Maroc',
    position: 'Directeur Commercial',
    quote: 'Le SIB est le rendez-vous annuel incontournable du secteur du bâtiment au Maroc. Chaque édition nous permet de présenter nos nouvelles gammes à des milliers de professionnels qualifiés. La qualité des visiteurs est remarquable.',
    rating: 5
  },
  {
    name: 'Fatima Ezzahra Bensouda',
    company: 'Groupe Al Omrane',
    position: 'Directrice Développement',
    quote: 'Exposer au SIB nous a ouvert des opportunités de partenariat que nous n\'aurions pas trouvées ailleurs. En trois jours, nous avons noué des contacts avec des promoteurs immobiliers de toute l\'Afrique du Nord.',
    rating: 5
  },
  {
    name: 'Youssef El Alamy',
    company: 'Saint-Gobain Maroc',
    position: 'Directeur Général',
    quote: 'Le SIB nous offre une vitrine exceptionnelle. Le public est ciblé, professionnel, et les retombées commerciales sont mesurables dès le lendemain du salon. Nous ne manquons aucune édition depuis 2010.',
    rating: 5
  }
];

export const TestimonialsSection: React.FC = () => {
  const { data: supabaseTestimonials, loading } = useSupabaseTestimonials(3);
  
  // Utiliser Supabase si disponible, sinon témoignages par défaut
  const testimonials = supabaseTestimonials?.length > 0 ? supabaseTestimonials : defaultTestimonials;

  return (
    <section className="py-20 bg-gradient-to-br from-sib-primary via-sib-secondary to-sib-accent relative overflow-hidden">
      {/* Pattern Zellige lumineux */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px),
                           repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
            <Quote className="w-6 h-6 text-sib-gold" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Témoignages
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ce que disent nos participants
          </h2>
          
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Découvrez les expériences des professionnels qui ont participé à SIB
          </p>
        </motion.div>

        {/* Grid de témoignages */}
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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
