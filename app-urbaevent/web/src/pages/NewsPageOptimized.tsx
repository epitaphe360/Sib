/**
 * NewsPageOptimized - News & Articles with Pagination
 *
 * Features:
 * - Pagination (9 articles/page)
 * - Search by title, excerpt, content
 * - Category filters
 * - Featured articles section
 * - Article card grid
 * - Sync from official SIB site
 * - WCAG 2.1 Level AA compliant
 */

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
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useNewsStore } from '../store/newsStore';
import { useOptimizedList } from '../hooks/useOptimizedList';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { logger } from '../lib/logger';

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

export default function NewsPageOptimized() {
  const { t } = useTranslation();
  const {
    articles,
    featuredArticles,
    categories,
    totalArticles,
    hasMore,
    isLoading,
    selectedCategory,
    setCategory,
    fetchNews,
    loadMoreNews,
    fetchFromOfficialSite,
  } = useNewsStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNews(true);
  }, [fetchNews]);

  // Translate articles
  const translatedArticles = articles.map(a => getTranslatedArticle(a, t));

  const {
    paginatedItems,
    filteredItems,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    sortField,
    sortDirection,
    toggleSort,
  } = useOptimizedList<any>({
    items: translatedArticles,
    itemsPerPage: 9,
    searchFields: ['title', 'excerpt', 'content', 'author'],
    initialSortField: 'publishedAt',
    initialSortDirection: 'desc',
    filterFn: (article, filters) => {
      if (filters.category && filters.category !== 'all' && article.category !== filters.category) {return false;}
      if (filters.featured === 'true' && !article.featured) {return false;}
      return true;
    },
  });

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
      toast.loading('Synchronisation en cours...', { id: 'sync-articles' });
      const result = await fetchFromOfficialSite();

      if (result && result.success) {
        const { inserted, updated, total } = result.stats;
        toast.success(
          `✅ Synchronisation réussie ! ${inserted} nouveaux articles, ${updated} mis à jour sur ${total} trouvés`,
          { id: 'sync-articles', duration: 5000 }
        );
        logger.info('Articles synced from official site', { inserted, updated, total });
      } else {
        toast.success('Articles actualisés', { id: 'sync-articles' });
      }
    } catch (error: unknown) {
      logger.error('Error syncing articles', error as Error);
      toast.error(
        `Erreur lors de la synchronisation : ${error instanceof Error ? error.message : String(error) || 'Erreur inconnue'}`,
        { id: 'sync-articles' }
      );
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {return null;}
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                title="Synchroniser avec le site officiel SIB"
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
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setFilter('category', 'all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !filters.category || filters.category === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter('category', cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.category === cat
                        ? getCategoryColor(cat)
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featured === 'true'}
                    onChange={(e) => setFilter('featured', e.target.checked ? 'true' : '')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Articles en vedette uniquement</span>
                </label>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Réinitialiser
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Articles</p>
                  <p className="text-3xl font-bold text-gray-900">{totalArticles || totalItems}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Vedette</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {articles.filter(a => a.featured).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des articles...</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedItems.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/news/${article.id}`}>
                    <Card hover className="h-full">
                    {article.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          loading="lazy"
                        />
                        {article.featured && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getCategoryColor(article.category)}>
                          <Tag className="h-3 w-3 mr-1" />
                          {article.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(new Date(article.publishedAt))}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatReadTime(article.readTime || 5)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {hasMore && !searchQuery && !filters.category && (
              <div className="mt-8 flex justify-center">
                <Button onClick={loadMoreNews} disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={9}
              onPageChange={goToPage}
              showItemsCount={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
