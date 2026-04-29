/**
 * ExhibitorsPageOptimized - Admin Exhibitors Management with Pagination
 *
 * Features:
 * - Pagination (12 exhibitors/page)
 * - Advanced search (company_name, description, contact)
 * - Filters (category, status, verified)
 * - Export (CSV/Excel/PDF) with rate limiting
 * - Sorting (company_name, category, status, created_at)
 * - Grid/List view toggle
 * - Stats cards
 * - WCAG 2.1 Level AA compliant
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Users,
  Star,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Grid as GridIcon,
  List
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useOptimizedList } from '../../hooks/useOptimizedList';
import { exportService } from '../../services/exportService';
import { RATE_LIMITS, useRateLimit } from '../../middleware/rateLimiter';
import { logger } from '../../lib/logger';
import { toast } from 'sonner';

interface Exhibitor {
  id: string;
  company_name: string;
  category: string;
  description: string;
  verified: boolean;
  contact_info: { name: string; email: string };
  website: string | null;
  employees: number | null;
  founded: number | null;
  location: string | null;
  rating: number | null;
  visitorsCount: number;
  created_at: string;
  status: 'approved' | 'pending' | 'rejected';
  logo?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'construction_industry': 'Industrie du Bâtiment',
  'port-industry': 'Industrie du Bâtiment',
  'bâtiment-industry': 'Industrie du Bâtiment',
  'port-operations': 'Exploitation & Gestion',
  'bâtiment-operations': 'Exploitation & Gestion',
  'institutional': 'Institutionnel',
  'academic': 'Académique',
  'material': 'Matériaux',
  'equipment': 'Équipements',
  'services': 'Services',
  'technology': 'Technologies',
  'N/A': 'Non défini',
};

const getCategoryLabel = (cat: string) => CATEGORY_LABELS[cat] ?? 'Industrie du Bâtiment';

export default function ExhibitorsPageOptimized() {
  const { t } = useTranslation();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { checkLimit } = useRateLimit(undefined, RATE_LIMITS.EXPORT);

  useEffect(() => {
    fetchExhibitors();
  }, []);

  const fetchExhibitors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getAll('exhibitors');
      const formattedData = data.map((item: any) => ({
        ...item,
        company_name: item.company_name || 'N/A',
        category: item.category || 'N/A',
        description: item.description || 'N/A',
        verified: item.verified || false,
        contact_info: item.contact_info || { name: 'N/A', email: 'N/A' },
        visitorsCount: item.visitorsCount || 0,
        status: item.verified ? 'approved' : 'pending',
        logo: item.logo_url || item.logo || undefined,
      }));
      setExhibitors(formattedData as Exhibitor[]);
      logger.info('Exhibitors loaded successfully', { count: formattedData.length });
    } catch (err) {
      logger.error('Error fetching exhibitors', err as Error);
      setError('Failed to load exhibitors. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
  } = useOptimizedList<Exhibitor>({
    items: exhibitors,
    itemsPerPage: 12,
    searchFields: ['company_name', 'description', 'category', 'location'],
    initialSortField: 'company_name',
    initialSortDirection: 'asc',
    filterFn: (exhibitor, filters) => {
      if (filters.category && exhibitor.category !== filters.category) {return false;}
      if (filters.status && exhibitor.status !== filters.status) {return false;}
      if (filters.verified === 'true' && !exhibitor.verified) {return false;}
      if (filters.verified === 'false' && exhibitor.verified) {return false;}
      return true;
    },
  });

  const categories = [
    'Infrastructure BTP',
    'Technologie',
    'Logistique',
    'Data & Analytics',
    'Ingénierie',
    'Sécurité',
    'Environnement'
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Approuvé</Badge>;
      case 'pending':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!checkLimit()) {
      toast.error('Limite d\'export atteinte. Veuillez réessayer plus tard.');
      return;
    }

    try {
      await exportService.exportExhibitors(filteredItems, format);
      logger.info('Exhibitors exported', { format, count: filteredItems.length });
    } catch (error) {
      logger.error('Export failed', error as Error);
      toast.error('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  const renderSortIcon = (field: keyof Exhibitor) => {
    if (sortField !== field) {return null;}
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement des exposants...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchExhibitors} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Exposants</h1>
              <p className="text-gray-600 mt-2">
                Administration et validation des exposants SIB 2026
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  aria-label="Vue grille"
                >
                  <GridIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  aria-label="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Link to={ROUTES.ADMIN_CREATE_EXHIBITOR}>
                <Button variant="default">
                  <Building2 className="h-4 w-4 mr-2" />
                  Ajouter Exposant
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exposants</p>
                  <p className="text-3xl font-bold text-gray-900">{exhibitors.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approuvés</p>
                  <p className="text-3xl font-bold text-green-600">
                    {exhibitors.filter(e => e.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {exhibitors.filter(e => e.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visiteurs Totaux</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {exhibitors.reduce((sum, e) => sum + e.visitorsCount, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, description ou contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filters.category || ''}
                onChange={(e) => setFilter('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{getCategoryLabel(category)}</option>
                ))}
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => setFilter('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="approved">Approuvé</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejeté</option>
              </select>

              <select
                value={filters.verified || ''}
                onChange={(e) => setFilter('verified', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="true">Vérifié uniquement</option>
                <option value="false">Non vérifié</option>
              </select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                Affichage {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalItems)} sur {totalItems} exposants
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Exhibitors Grid or List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((exhibitor, index) => (
              <motion.div
                key={exhibitor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {exhibitor.company_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{getCategoryLabel(exhibitor.category)}</p>
                        {getStatusBadge(exhibitor.status)}
                      </div>
                      <div className="ml-4">
                        {exhibitor.logo ? (
                          <img
                            src={exhibitor.logo}
                            alt={exhibitor.company_name}
                            className="h-16 w-16 rounded-lg object-contain bg-white border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {exhibitor.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{exhibitor.location || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{exhibitor.employees || 'N/A'} employés</span>
                      </div>
                      {exhibitor.rating && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>{exhibitor.rating}/5 ({exhibitor.visitorsCount} visiteurs)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Inscrit le {formatDate(exhibitor.created_at)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSort('company_name')}
                      >
                        Entreprise {renderSortIcon('company_name')}
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSort('category')}
                      >
                        Catégorie {renderSortIcon('category')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Localisation</th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSort('status')}
                      >
                        Statut {renderSortIcon('status')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Visiteurs</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((exhibitor, index) => (
                      <motion.tr
                        key={exhibitor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{exhibitor.company_name}</div>
                              <div className="text-sm text-gray-600">{exhibitor.contact_info.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900">{getCategoryLabel(exhibitor.category)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {exhibitor.location || 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(exhibitor.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            {exhibitor.visitorsCount}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {paginatedItems.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun exposant trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={12}
              onPageChange={goToPage}
              showItemsCount={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

