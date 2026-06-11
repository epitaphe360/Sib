/**
 * Dernières actualités — Design Master
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { useSupabaseArticles } from '../../hooks/useSupabaseContent';
import { useWordPressArticles } from '../../hooks/useWordPressContent';
import { useTranslation } from '../../hooks/useTranslation';
import { DM } from '../../design/designMasterTokens';
import { SIB_PHOTOS_CDN } from '../../config/sibMaRemoteUrls';

interface NewsCardProps {
  title: string;
  excerpt: string;
  featuredImage: string | null;
  date: string;
  category: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, excerpt, featuredImage, date, category }) => {
  const { t } = useTranslation();
  const defaultImage = SIB_PHOTOS_CDN.conferences;

  return (
    <motion.div
      whileHover={{ scale: DM.hoverScale }}
      transition={DM.spring}
      className="group h-full dm-glass-light rounded-[32px] overflow-hidden border border-[#001A3D]/08 shadow-[0_8px_32px_rgba(0,26,61,0.08)]"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={featuredImage || defaultImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${DM.navy}CC, transparent 60%)`,
          }}
        />
        <span
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: DM.orange }}
        >
          {category || t('home.latest_news.default_category')}
        </span>
      </div>

      <div className="p-6">
        <h3
          className="font-black text-lg mb-3 line-clamp-2 tracking-tight group-hover:opacity-80 transition-opacity"
          style={{ color: DM.navy }}
        >
          {title}
        </h3>
        <p className="text-[#001A3D]/60 text-sm mb-4 line-clamp-3 leading-relaxed">{excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-[#001A3D]/45 pt-4 border-t border-[#001A3D]/08">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const LatestNewsSection: React.FC = () => {
  const { t } = useTranslation();
  const { data: supabaseArticles, loading: supabaseLoading } = useSupabaseArticles(3);
  const { data: wpArticles, loading: wpLoading } = useWordPressArticles(3);

  const articles = supabaseArticles?.length > 0 ? supabaseArticles : wpArticles;
  const loading = supabaseLoading || wpLoading;

  if (loading) {
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: '#ECECE8' }}>
        <div className="max-w-container mx-auto px-6 lg:px-8 text-center">
          <div
            className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent mx-auto"
            style={{ borderColor: `${DM.orange}44`, borderTopColor: DM.orange }}
          />
          <p className="mt-4 text-[#001A3D]/55 text-sm">{t('home.latest_news.loading')}</p>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: '#ECECE8' }}>
      <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-5"
            style={{ backgroundColor: `${DM.navy}10`, color: DM.navy }}
          >
            <Newspaper className="h-3.5 w-3.5" style={{ color: DM.orange }} />
            {t('home.latest_news.kicker')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4" style={{ color: DM.navy }}>
            {t('home.latest_news.title')}
          </h2>
          <p className="text-[#001A3D]/65 max-w-2xl mx-auto">{t('home.latest_news.desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {articles.map((article: { id?: string; slug?: string; title: string; excerpt: string; featuredImage?: string; featured_image?: string; date: string; categories?: string[] }, index: number) => (
            <motion.div
              key={article.id || index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...DM.springSoft, delay: index * 0.08 }}
            >
              <Link to={`/news/${article.slug || article.id}`} className="block h-full">
                <NewsCard
                  title={article.title}
                  excerpt={article.excerpt}
                  featuredImage={article.featuredImage || article.featured_image || null}
                  date={article.date}
                  category={article.categories?.[0] || t('home.latest_news.default_category')}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: DM.navy }}
          >
            {t('home.latest_news.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
