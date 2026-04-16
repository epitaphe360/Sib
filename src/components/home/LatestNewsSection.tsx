/**
 * Section des dernières actualités sur la HomePage
 * Source hybride : WordPress (transition) puis Supabase
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { useSupabaseArticles } from '../../hooks/useSupabaseContent';
import { useWordPressArticles } from '../../hooks/useWordPressContent';

interface NewsCardProps {
  title: string;
  excerpt: string;
  featuredImage: string | null;
  date: string;
  category: string;
  slug: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  featuredImage,
  date,
  category
}) => {
  const defaultImage = 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?w=800';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group cursor-pointer"
    >
      {/* Bordure colorée marocaine */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-sib-gold to-green-600 rounded-2xl rotate-1 group-hover:rotate-2 transition-transform" />

      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Image avec overlay */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={featuredImage || defaultImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sib-primary/90 via-sib-primary/50 to-transparent" />

          {/* Badge catégorie */}
          <span className="absolute top-4 left-4 bg-sib-gold text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            {category || 'Actualité'}
          </span>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <h3 className="font-bold text-xl mb-3 text-sib-primary group-hover:text-sib-gold transition-colors line-clamp-2">
            {title}
          </h3>

          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {excerpt}
          </p>

          {/* Footer avec date et motifs */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>

            {/* Motifs marocains */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-600 rotate-45" />
              <div className="w-2 h-2 bg-sib-gold rotate-45" />
              <div className="w-2 h-2 bg-green-600 rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const LatestNewsSection: React.FC = () => {
  // Essayer d'abord Supabase, puis WordPress en fallback
  const { data: supabaseArticles, loading: supabaseLoading } = useSupabaseArticles(3);
  const { data: wpArticles, loading: wpLoading } = useWordPressArticles(3);

  // Utiliser Supabase si disponible, sinon WordPress
  const articles = supabaseArticles?.length > 0 ? supabaseArticles : wpArticles;
  const loading = supabaseLoading || wpLoading;

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sib-primary mx-auto" />
            <p className="mt-4 text-slate-600">Chargement des actualités...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null; // Ne rien afficher si pas d'articles
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Pattern Zellige en arrière-plan */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212,175,55,0.3) 35px, rgba(212,175,55,0.3) 70px),
                           repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0,98,51,0.3) 35px, rgba(0,98,51,0.3) 70px)`
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
            <Newspaper className="w-6 h-6 text-sib-gold" />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Actualités SIB
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-sib-primary via-sib-gold to-green-600 bg-clip-text text-transparent">
              Dernières Actualités
            </span>
          </h2>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Restez informé des dernières nouvelles du Salon International du Bâtiment
          </p>
        </motion.div>

        {/* Grid d'articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article: any, index: number) => (
            <motion.div
              key={article.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/news/${article.slug || article.id}`}>
                <NewsCard
                  title={article.title}
                  excerpt={article.excerpt}
                  featuredImage={article.featuredImage || article.featured_image}
                  date={article.date}
                  category={article.categories?.[0] || 'Actualité'}
                  slug={article.slug}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bouton Voir tout */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-sib-primary to-sib-accent text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            <span>Voir toutes les actualités</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
