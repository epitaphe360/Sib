import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { getArticleTranslationKeys } from '../utils/newsTranslations';
import {
  Search,
  Filter,
  Eye,
  Tag,
  TrendingUp,
  Globe,
  RefreshCw,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNewsStore } from '../store/newsStore';
import { CONFIG } from '../lib/config';
import ArticleCard from '../components/news/ArticleCard';
import { SmartImage } from '../components/ui/SmartImage';
import { IMAGES } from '../lib/images';

function getTranslatedArticle(article: any, t: any) {
  const keys = getArticleTranslationKeys(article.id);
  if (keys) {
    return {
      ...article,
      title: t(keys.titleKey),
      excerpt: t(keys.excerptKey),
      content: t(keys.contentKey),
    };
  }
  return article;
}

export default function NewsPage() {
  const { t } = useTranslation();
  const {
    articles,
    featuredArticles,
    categories,
    totalArticles,
    hasMore,
    isLoading,
    selectedCategory,
    searchTerm,
    fetchNews,
    loadMoreNews,
    fetchFromOfficialSite,
    setCategory,
    setSearchTerm,
    getFilteredArticles,
  } = useNewsStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNews(true);
  }, [fetchNews]);

  const filteredArticles = getFilteredArticles().map((a) => getTranslatedArticle(a, t));

  const formatDate = (date: Date) => {
    const currentLang = document.documentElement.lang || 'fr';
    const locale = currentLang === 'en' ? 'en-GB' : 'fr-FR';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatReadTime = (minutes: number) => `${minutes} ${t('pages.news.min_read')}`;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Événement': 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      'Innovation': 'bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-300',
      'Partenariat': 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300',
      'Durabilité': 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300',
      'Formation': 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300',
      'Commerce': 'bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300',
    };
    return colors[category] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  };

  const handleRefreshFromOfficialSite = async () => {
    try {
      toast.loading(t('common.loading'), { id: 'sync-articles' });
      const result = await fetchFromOfficialSite();
      if (result && result.success) {
        const { inserted, updated, total } = result.stats;
        toast.success(`${inserted} ${t('common.new')}, ${updated} ${t('common.updated')} / ${total}`, {
          id: 'sync-articles',
          duration: 5000,
        });
      } else {
        toast.success(t('common.update_success'), { id: 'sync-articles' });
      }
    } catch (error: unknown) {
      console.error('Error syncing articles:', error);
      toast.error(
        `Erreur lors de la synchronisation : ${error instanceof Error ? error.message : String(error) || 'Erreur inconnue'}`,
        { id: 'sync-articles' }
      );
    }
  };

  const trending = [
    'Digitalisation bâtiment',
    'Bâtiments durables',
    'Intelligence artificielle',
    'Automatisation',
    'BIM & PropTech',
    'Énergies renouvelables',
    'Formation BTP',
    'Partenariats internationaux',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-20">
        <div className="absolute inset-0 -z-10">
          <SmartImage
            source={IMAGES.events.conference}
            aspect="auto"
            rounded="none"
            priority
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/92 via-primary-900/88 to-primary-900/95" />
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        </div>

        <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                Actualités SIB
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
            >
              Actualités du Bâtiment
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-base lg:text-lg text-white/75 leading-relaxed"
            >
              Restez informé des dernières nouvelles du secteur du bâtiment et des actualités SIB 2026.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-container mx-auto px-6 lg:px-8 py-12">
        {/* Search & filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher dans les actualités..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtres
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefreshFromOfficialSite}
              disabled={isLoading}
              title={t('ui.sync_official')}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-5 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory(CONFIG.defaults.category)}
                className={`h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === CONFIG.defaults.category
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-600'
                }`}
              >
                Toutes les catégories
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setCategory(category)}
                  className={`h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Featured */}
        {featuredArticles.length > 0 && !selectedCategory && !searchTerm && (
          <div className="mb-12">
            <div className="sib-kicker mb-3">À la Une</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
              Articles vedettes
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredArticles.slice(0, 2).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  featured
                  index={index}
                  getCategoryColor={getCategoryColor}
                  formatDate={formatDate}
                  formatReadTime={formatReadTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {selectedCategory || searchTerm ? 'Résultats' : 'Toutes les Actualités'}
              <span className="ml-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                ({filteredArticles.length}/{totalArticles || filteredArticles.length})
              </span>
            </h2>

            {(selectedCategory || searchTerm) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCategory(CONFIG.defaults.category);
                  setSearchTerm(CONFIG.defaults.searchTerm);
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                    <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800" />
                    <div className="p-6">
                      <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-2" />
                      <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-4 w-2/3" />
                      <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <Search className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                Aucune actualité trouvée
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Essayez de modifier vos critères de recherche.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setCategory(CONFIG.defaults.category);
                  setSearchTerm(CONFIG.defaults.searchTerm);
                }}
              >
                Voir toutes les actualités
              </Button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    featured={false}
                    index={index}
                    getCategoryColor={getCategoryColor}
                    formatDate={formatDate}
                    formatReadTime={formatReadTime}
                  />
                ))}
              </div>
              {hasMore && !selectedCategory && !searchTerm && (
                <div className="mt-10 flex justify-center">
                  <Button variant="primary" size="lg" onClick={loadMoreNews} disabled={isLoading}>
                    {isLoading ? 'Chargement...' : 'Charger plus'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mt-16 relative overflow-hidden rounded-2xl p-10 lg:p-14 bg-gradient-to-br from-primary-900 to-primary-700 border border-primary-800"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto text-white">
            <div className="sib-kicker mb-4 justify-center !text-accent-500">Newsletter</div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 tracking-tight">
              Restez informé des actualités SIB
            </h3>
            <p className="text-white/80 mb-8 leading-relaxed">
              Recevez les dernières nouvelles du secteur du bâtiment et les actualités
              exclusives de SIB 2026 directement dans votre boîte mail.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const emailInput = e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement;
                const email = emailInput?.value;
                if (!email) {
                  toast.error('Veuillez saisir votre adresse email');
                  return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  toast.error('Veuillez saisir une adresse email valide');
                  return;
                }
                toast.success(`Inscription réussie ! Email: ${email}`);
                emailInput.value = '';
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="votre@email.com"
                aria-label="email"
                required
                className="flex-1 h-12 px-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
              />
              <Button type="submit" variant="accent" size="lg">
                S'abonner
              </Button>
            </form>

            <p className="text-xs text-white/60 mt-4">
              Newsletter hebdomadaire · Désabonnement facile · Données protégées
            </p>
          </div>
        </motion.div>

        {/* Trending topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-7">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-5 flex items-center tracking-tight">
              <TrendingUp className="h-4 w-4 mr-2 text-accent-500" />
              Sujets Tendance
            </h3>
            <div className="flex flex-wrap gap-2">
              {trending.map((topic) => (
                <button
                  type="button"
                  key={topic}
                  onClick={() => setSearchTerm(topic)}
                  className="h-9 px-4 rounded-full text-xs font-semibold bg-neutral-50 hover:bg-primary-50 dark:bg-neutral-800 dark:hover:bg-primary-900/30 text-neutral-700 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-300 transition-all border border-neutral-200 dark:border-neutral-700 hover:border-primary-600"
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: BookOpen, value: articles.length, label: t('admin.total_articles') },
            {
              icon: Eye,
              value: articles.reduce((sum, a) => sum + a.views, 0).toLocaleString(),
              label: `${t('common.total')} ${t('common.views')}`,
            },
            { icon: Tag, value: categories.length, label: 'Catégories' },
            {
              icon: Globe,
              value: articles.filter((a) => a.source === 'sibs').length,
              label: 'Sources Officielles',
            },
          ].map(({ icon: Icon, value, label }, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-11 w-11 mx-auto mb-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {value}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wide font-medium">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
