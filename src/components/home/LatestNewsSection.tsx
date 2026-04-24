/**
 * SIB 2026 — LatestNewsSection
 * Dernieres actualites — cartes epurees, photos 4K, typographie soignee.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useSupabaseArticles } from '../../hooks/useSupabaseContent';
import { useWordPressArticles } from '../../hooks/useWordPressContent';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { IMAGES } from '../../lib/images';

interface NewsCardProps {
  title: string;
  excerpt: string;
  featuredImage: string | null;
  date: string;
  category: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, excerpt, featuredImage, date, category }) => {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image */}
      <div className="relative overflow-hidden">
        <SmartImage
          source={featuredImage || IMAGES.business.meeting}
          aspect="16/9"
          rounded="none"
          zoom
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300 border border-white/50 shadow-sm">
          {category || 'Actualité'}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-3 leading-snug tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-5 flex-grow leading-relaxed">
          {excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium transition-transform group-hover:translate-x-1">
            Lire <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};

export const LatestNewsSection: React.FC = () => {
  const { data: supabaseArticles, loading: supabaseLoading } = useSupabaseArticles(3);
  const { data: wpArticles, loading: wpLoading } = useWordPressArticles(3);

  const articles = supabaseArticles?.length > 0 ? supabaseArticles : wpArticles;
  const loading = supabaseLoading || wpLoading;

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-neutral-950">
        <div className="max-w-container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-5/6" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2 mt-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <section className="relative py-20 lg:py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="sib-kicker mb-4 justify-center">Actualités SIB</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            Dernières <span className="sib-text-gradient">actualités</span>
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Restez informé des dernières nouvelles du Salon International du Bâtiment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {articles.map((article: any, index: number) => (
            <motion.div
              key={article.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Link to={`/news/${article.slug || article.id}`} className="block h-full">
                <NewsCard
                  title={article.title}
                  excerpt={article.excerpt}
                  featuredImage={article.featuredImage || article.featured_image}
                  date={article.date}
                  category={article.categories?.[0] || 'Actualité'}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/news">
            <Button variant="primary" size="lg" className="group">
              Voir toutes les actualités
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
