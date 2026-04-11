import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, ExternalLink, Sparkles, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { SupabaseService } from '../services/supabaseService';
import { useTranslation } from '../hooks/useTranslation';

interface MiniSitePreview {
  id: string;
  exhibitor_id: string;
  company_name: string;
  logo_url?: string;
  description?: string;
  views: number;
  published: boolean;
  last_updated: string;
}

export default function MiniSiteListPage() {
  const { t } = useTranslation();
  const [miniSites, setMiniSites] = useState<MiniSitePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMiniSites();
  }, []);

  const loadMiniSites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await SupabaseService.getPublishedMiniSites();

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        exhibitor_id: item.exhibitor_id,
        company_name: item.company_name || 'Exposant',
        logo_url: item.logo_url,
        description: item.description,
        views: item.views || 0,
        published: true,
        last_updated: item.last_updated || new Date().toISOString()
      }));

      setMiniSites(formattedData);
    } catch (error) {
      console.error(t('error.generic'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMiniSites = miniSites.filter(site =>
    site.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Building2 className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('minisite.list.title')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              {t('minisite.list.subtitle')}
            </p>
            <Badge className="px-6 py-2 bg-white/20 text-white border-white/30 text-lg">
              <Sparkles className="h-5 w-5 mr-2 inline" />
              {t('exhibitors.count', { count: miniSites.length })}
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('minisite.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Mini-Sites Grid */}
        {filteredMiniSites.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t('minisite.search.not_found')}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? t('minisite.search.no_match')
                : t('minisite.search.no_sites_yet')}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMiniSites.map((site, index) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  {/* Logo */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    {site.logo_url ? (
                      <img
                        src={site.logo_url}
                        alt={site.company_name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-20 w-20 text-gray-300" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {site.company_name}
                      </h3>
                      <Badge className="ml-2 flex-shrink-0 bg-gray-100 text-gray-700 border-gray-300">
                        <Eye className="h-3 w-3 mr-1" />
                        {site.views}
                      </Badge>
                    </div>

                    {site.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {site.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 mb-4">
                      Mis à jour le {new Date(site.last_updated).toLocaleDateString('fr-FR')}
                    </div>

                    <Link to={`/minisite/${site.exhibitor_id}`} className="block">
                      <Button className="w-full group-hover:bg-blue-700 transition-colors">
                        Voir le Mini-Site
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes exposant ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Créez votre mini-site vitrine pour présenter vos produits et services aux visiteurs de SIB 2026.
          </p>
          <Link to="/exhibitor/dashboard">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              <Sparkles className="h-5 w-5 mr-2" />
              Créer mon Mini-Site
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
