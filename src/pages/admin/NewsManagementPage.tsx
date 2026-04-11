import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search, Filter, Calendar, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { useNewsStore } from '../../store/newsStore';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';

export default function NewsManagementPage() {
  const { t } = useTranslation();
  const { articles, fetchNews, deleteNewsArticle, isLoading } = useNewsStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(t('common.delete_confirm', { name: title }))) {
      try {
        await deleteNewsArticle(id);
        
        // Supprimer immédiatement du state local
        setArticles(articles.filter(a => a.id !== id));
        
        toast.success(t('common.delete_success'));
        // Ensuite faire un refresh complet
        setTimeout(() => fetchNews(), 500);
      } catch (error) {
        toast.error(t('common.delete_error'));
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(articles.map(a => a.category)));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back_to_dashboard')}
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.news_management')}</h1>
              <p className="mt-2 text-gray-600">{t('admin.manage_news_desc')}</p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_NEWS}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-5 w-5 mr-2" />
                {t('admin.new_article')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.total_articles')}</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('common.published')}</p>
                <p className="text-2xl font-bold text-green-600">{articles.filter(a => a.featured).length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('common.categories')}</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.this_month')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {articles.filter(a => {
                    const articleDate = new Date(a.publishedAt);
                    const now = new Date();
                    return articleDate.getMonth() === now.getMonth() && 
                           articleDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.search_article')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('admin.all_categories')}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Articles List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="p-12 text-center">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('admin.no_articles_found')}</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? t('admin.no_articles_criteria') 
                : t('admin.create_first_article')}
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <Link to={ROUTES.ADMIN_CREATE_NEWS}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.create_article')}
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
                        {article.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            ⭐ {t('admin.featured')}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.author}
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          {article.category}
                        </Badge>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {article.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link to={`${ROUTES.NEWS}/${article.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.ADMIN_CREATE_NEWS}?edit=${article.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article.id, article.title)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
