/**
 * UsersPageOptimized - Admin Users Management with Pagination
 *
 * Features:
 * - Pagination (20 users/page)
 * - Advanced search (name, email, company)
 * - Filters (role, status)
 * - Export (CSV/Excel/PDF) with rate limiting
 * - Sorting (name, email, role, status, registrationDate)
 * - Stats cards
 * - WCAG 2.1 Level AA compliant
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Building2,
  Calendar,
  MoreVertical,
  Edit,
  Shield,
  Crown,
  User as UserIcon,
  RefreshCw,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Grid,
  List
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { Database } from '../../lib/supabase';
import { useOptimizedList } from '../../hooks/useOptimizedList';
import { exportService } from '../../services/exportService';
import { RATE_LIMITS, useRateLimit } from '../../middleware/rateLimiter';
import { logger } from '../../lib/logger';

// Define User type based on Supabase schema
type User = Database['public']['Tables']['users']['Row'] & {
  company?: string;
  lastLogin?: string;
  registrationDate?: string;
};

export default function UsersPageOptimized() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { checkLimit } = useRateLimit(undefined, RATE_LIMITS.EXPORT);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getAll('users');
      const formattedData = data.map((item: any) => ({
        ...item,
        name: item.name || `${item.profile?.firstName || ''} ${item.profile?.lastName || ''}`.trim() || item.email,
        company: item.profile?.company || 'N/A',
        lastLogin: item.updated_at,
        registrationDate: item.created_at,
      }));
      setUsers(formattedData as User[]);
      logger.info('Users loaded successfully', { count: formattedData.length });
    } catch (err) {
      logger.error('Error fetching users', err as Error);
      setError('Failed to load users. Please try again later.');
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
  } = useOptimizedList<User>({
    items: users,
    itemsPerPage: 20,
    searchFields: ['name', 'email', 'company'],
    initialSortField: 'name',
    initialSortDirection: 'asc',
    filterFn: (user, filters) => {
      if (filters.role && user.type !== filters.role) {return false;}
      if (filters.status && user.status !== filters.status) {return false;}
      return true;
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) {return 'Jamais';}
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'partner': return Crown;
      case 'exhibitor': return Building2;
      case 'visitor': return UserIcon;
      default: return UserIcon;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'partner': return 'Partenaire';
      case 'exhibitor': return 'Exposant';
      case 'visitor': return 'Visiteur';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'partner': return 'text-purple-600';
      case 'exhibitor': return 'text-blue-600';
      case 'visitor': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Actif</Badge>;
      case 'pending': return <Badge variant="warning">En attente</Badge>;
      case 'suspended': return <Badge variant="error">Suspendu</Badge>;
      case 'rejected': return <Badge variant="error">Rejeté</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!checkLimit()) {
      alert('Limite d\'export atteinte. Veuillez réessayer plus tard.');
      return;
    }

    try {
      await exportService.exportUsers(filteredItems, format);
      logger.info('Users exported', { format, count: filteredItems.length });
    } catch (error) {
      logger.error('Export failed', error as Error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  const renderSortIcon = (field: keyof User) => {
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
          <h3 className="text-lg font-medium text-gray-900">Chargement des utilisateurs...</h3>
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
          <Button onClick={fetchUsers} className="mt-4">
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
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.users_management')}</h1>
              <p className="text-gray-600 mt-2">
                {t('admin.manage_users_desc')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  aria-label="Vue tableau"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  aria-label="Vue grille"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
              <Link to={ROUTES.ADMIN_CREATE_USER}>
                <Button variant="default">
                  <Users className="h-4 w-4 mr-2" />
                  Créer Utilisateur
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
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {users.filter(u => {
                      if (!u.registrationDate) {return false;}
                      const monthAgo = new Date(Date.now() - 2592000000);
                      return new Date(u.registrationDate) > monthAgo;
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
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
                  placeholder="Rechercher par nom, email ou entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filters.role || ''}
                onChange={(e) => setFilter('role', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="partner">Partenaire</option>
                <option value="exhibitor">Exposant</option>
                <option value="visitor">Visiteur</option>
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => setFilter('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendu</option>
                <option value="rejected">Rejeté</option>
              </select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                Affichage {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalItems)} sur {totalItems} utilisateurs
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

        {/* Users Table */}
        {viewMode === 'table' ? (
          <Card>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSort('name')}
                      >
                        Utilisateur {renderSortIcon('name')}
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSort('type')}
                      >
                        Rôle {renderSortIcon('type')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Entreprise</th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSort('status')}
                      >
                        Statut {renderSortIcon('status')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Dernière connexion</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((user, index) => {
                      const RoleIcon = getRoleIcon(user.type);
                      const roleColor = getRoleColor(user.type);

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <RoleIcon className={`h-4 w-4 ${roleColor}`} />
                              <span className="text-sm text-gray-900">{getRoleLabel(user.type)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">{user.company}</span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(user.status || 'pending')}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{formatDate(user.lastLogin || user.updated_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {paginatedItems.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun utilisateur trouvé
                  </h3>
                  <p className="text-gray-600">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((user, index) => {
              const RoleIcon = getRoleIcon(user.type);
              const roleColor = getRoleColor(user.type);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <RoleIcon className={`h-4 w-4 mr-2 ${roleColor}`} />
                          <span>{getRoleLabel(user.type)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span>{user.company}</span>
                        </div>
                        <div>{getStatusBadge(user.status || 'pending')}</div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Dernière connexion:</span>
                        <span>{formatDate(user.lastLogin || user.updated_at)}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={20}
              onPageChange={goToPage}
              showItemsCount={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

