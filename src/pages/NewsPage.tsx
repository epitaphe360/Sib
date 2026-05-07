import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { getArticleTranslationKeys } from '../utils/newsTranslations';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Eye,
  ExternalLink,
  Star,
  Tag,
  TrendingUp,
  Globe,
  RefreshCw,
  BookOpen,
  Share2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNewsStore } from '../store/newsStore';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import ArticleCard from '../components/news/ArticleCard';

// Helper function to translate article content
function getTranslatedArticle(article: any, t: any) {
  const keys = getArticleTranslationKeys(article.id);
  if (keys) {
    return {
      ...article,
      title: t(keys.titleKey),
      excerpt: t(keys.excerptKey),
      content: t(keys.contentKey)
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
    getFilteredArticles
  } = useNewsStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNews(true);
  }, [fetchNews]);

  const filteredArticles = getFilteredArticles().map(a => getTranslatedArticle(a, t));

  const formatDate = (date: Date) => {
    const currentLang = document.documentElement.lang || 'fr';
    const locale = currentLang === 'en' ? 'en-GB' : 'fr-FR';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} ${t('pages.news.min_read')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Événement': 'bg-blue-100 text-blue-800',
      'Innovation': 'bg-purple-100 text-purple-800',
      'Partenariat': 'bg-green-100 text-green-800',
      'Durabilité': 'bg-emerald-100 text-emerald-800',
      'Formation': 'bg-orange-100 text-orange-800',
      'Commerce': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleRefreshFromOfficialSite = async () => {
    try {
      toast.loading(t('common.loading'), { id: 'sync-articles' });
      const result = await fetchFromOfficialSite();

      if (result && result.success) {
        const { inserted, updated, total } = result.stats;
        toast.success(
          `✅ ${inserted} ${t('common.new')}, ${updated} ${t('common.updated')} / ${total}`,
          { id: 'sync-articles', duration: 5000 }
        );
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Actualités du Bâtiment SIB
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Restez informé des dernières nouvelles du secteur du bâtiment et des actualités SIB 2026
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les actualités..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>

              <Button
                variant="outline"
                onClick={handleRefreshFromOfficialSite}
                disabled={isLoading}
                title={t('ui.sync_official')}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualiser
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory(CONFIG.defaults.category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === CONFIG.defaults.category
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && !selectedCategory && !searchTerm && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              À la Une
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.slice(0, 2).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  featured={true}
                  index={index}
                  getCategoryColor={getCategoryColor}
                  formatDate={formatDate}
                  formatReadTime={formatReadTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory || searchTerm ? 'Résultats' : 'Toutes les Actualités'}
              ({filteredArticles.length}/{totalArticles || filteredArticles.length})
            </h2>

            {(selectedCategory || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategory(CONFIG.defaults.category);
                  setSearchTerm(CONFIG.defaults.searchTerm);
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune actualité trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button variant="default" onClick={() => {
                setCategory(CONFIG.defaults.category);
                setSearchTerm(CONFIG.defaults.searchTerm);
              }}>
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
                <div className="mt-8 flex justify-center">
                  <Button onClick={loadMoreNews} disabled={isLoading}>
                    {isLoading ? 'Chargement...' : 'Charger plus'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Restez informé des actualités SIB
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Recevez les dernières nouvelles du secteur du bâtiment et les actualités
                exclusives de SIB 2026 directement dans votre boîte mail
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input type="email"
                  placeholder="votre@email.com"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                 aria-label="votre@email.com" />
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.preventDefault();
                    const emailInput = e.currentTarget.parentElement?.querySelector('input[type="email"]') as HTMLInputElement;
                    const email = emailInput?.value;

                    if (!email) {
                      toast.error('Veuillez saisir votre adresse email');
                      return;
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      toast.error('Veuillez saisir une adresse email valide');
                      return;
                    }
                    toast.success(`Inscription newsletter réussie !\nEmail: ${email}`);
                    emailInput.value = '';
                  }}
                >
                  S'abonner
                </Button>
              </div>

              <p className="text-xs text-blue-200 mt-4">
                Newsletter hebdomadaire • Désabonnement facile • Données protégées
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                Sujets Tendance
              </h3>

              <div className="flex flex-wrap gap-2">
                {[
                  'Digitalisation bâtiment',
                  'Bâtiments durables',
                  'Intelligence artificielle',
                  'Automatisation',
                  'BIM & PropTech',
                  'Énergies renouvelables',
                  'Formation BTP',
                  'Partenariats internationaux'
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSearchTerm(topic)}
                    className="px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    #{topic}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {articles.length}
              </div>
              <div className="text-sm text-gray-600">{t('admin.total_articles')}</div>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t('common.total')} {t('common.views')}</div>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Catégories</div>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {articles.filter(a => a.source === 'sibs').length}
              </div>
              <div className="text-sm text-gray-600">Sources Officielles</div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

