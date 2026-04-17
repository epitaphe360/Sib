import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import {
  Activity,
  Search,
  Filter,
  UserCheck,
  UserX,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  MoreVertical,
  Eye,
  Download,
  RefreshCw,
  X,
  ArrowLeft
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useTableFilters } from '../../hooks/useTableFilters';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  metadata: any;
  user_id: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export default function ActivityPage() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getAll('activities');
        // Enrichir les données avec la sévérité calculée
        const enrichedData = (data as ActivityItem[]).map(activity => ({
          ...activity,
          severity: getSeverityFromType(activity.activity_type)
        }));
        setActivities(enrichedData);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again later.');
        toast.error('Erreur lors du chargement des activités');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getSeverityFromType = (type: string): 'info' | 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'security_alert':
      case 'system_error':
        return 'error';
      case 'user_suspension':
      case 'api_rate_limit':
      case 'content_moderation_warning':
        return 'warning';
      case 'exhibitor_validation':
      case 'system_backup_success':
        return 'success';
      default:
        return 'info';
    }
  };

  // Utilisation du hook useTableFilters avec configuration multiple
  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    resetFilters,
    filteredData: filteredActivities,
    getUniqueValues,
    hasActiveFilters
  } = useTableFilters<ActivityItem>({
    data: activities,
    searchKeys: ['description', 'activity_type'],
    filterConfigs: [
      { key: 'activity_type', initialValue: '' },
      { key: 'severity', initialValue: '' }
    ]
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return UserCheck;
      case 'user_logout': return UserX;
      case 'exhibitor_validation': return Building2;
      case 'content_moderation': return FileText;
      case 'security_alert': return Shield;
      case 'system_error': return AlertTriangle;
      default: return Activity;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="error">Erreur</Badge>;
      case 'warning':
        return <Badge variant="warning">Avertissement</Badge>;
      case 'success':
        return <Badge variant="success">Succès</Badge>;
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      user_login: 'Connexion utilisateur',
      user_logout: 'Déconnexion utilisateur',
      exhibitor_validation: 'Validation exposant',
      content_moderation: 'Modération contenu',
      security_alert: 'Alerte sécurité',
      system_error: 'Erreur système',
      user_suspension: 'Suspension utilisateur',
      api_rate_limit: 'Limite API atteinte',
      content_moderation_warning: 'Avertissement modération',
      system_backup_success: 'Sauvegarde réussie'
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journal d'Activité</h1>
              <p className="text-gray-600 mt-2">
                Suivi en temps réel des événements et actions système
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activités</p>
                  <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Succès</p>
                  <p className="text-3xl font-bold text-green-600">
                    {activities.filter(a => a.severity === 'success').length}
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
                  <p className="text-sm font-medium text-gray-600">Avertissements</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {activities.filter(a => a.severity === 'warning').length}
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
                  <p className="text-sm font-medium text-gray-600">Erreurs</p>
                  <p className="text-3xl font-bold text-red-600">
                    {activities.filter(a => a.severity === 'error').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une activité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filters.activity_type || ''}
                    onChange={(e) => updateFilter('activity_type', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Tous les types</option>
                    {getUniqueValues('activity_type').map(type => (
                      <option key={type} value={type}>
                        {getActivityTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Severity Filter */}
              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filters.severity || ''}
                    onChange={(e) => updateFilter('severity', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Toutes les sévérités</option>
                    <option value="info">Info</option>
                    <option value="success">Succès</option>
                    <option value="warning">Avertissement</option>
                    <option value="error">Erreur</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Activities List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Activités récentes ({filteredActivities.length})
            </h2>

            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune activité trouvée</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.activity_type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.severity === 'error' ? 'bg-red-100' :
                        activity.severity === 'warning' ? 'bg-yellow-100' :
                        activity.severity === 'success' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          activity.severity === 'error' ? 'text-red-600' :
                          activity.severity === 'warning' ? 'text-yellow-600' :
                          activity.severity === 'success' ? 'text-green-600' :
                          'text-blue-600'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {getActivityTypeLabel(activity.activity_type)}
                            </p>
                          </div>
                          {getSeverityBadge(activity.severity || 'info')}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(activity.created_at)}
                        </p>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}




