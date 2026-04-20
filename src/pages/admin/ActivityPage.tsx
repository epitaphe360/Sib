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
import { useTableFilters } from '../../hooks/useTableFilters';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

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
        if (!supabase) throw new Error('Supabase non configuré');

        // Construire un journal d'activité synthétique depuis les vraies tables
        const [usersRes, appointmentsRes, paymentsRes, eventsRes] = await Promise.allSettled([
          supabase
            .from('users')
            .select('id, name, email, type, status, created_at')
            .order('created_at', { ascending: false })
            .limit(30),
          supabase
            .from('appointments')
            .select('id, exhibitor_id, visitor_id, status, created_at, meeting_type')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('payment_requests')
            .select('id, user_id, amount, currency, status, created_at')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('events')
            .select('id, title, event_date, created_at')
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        const synthetic: ActivityItem[] = [];

        // Inscriptions utilisateurs
        if (usersRes.status === 'fulfilled' && usersRes.value.data) {
          usersRes.value.data.forEach((u) => {
            synthetic.push({
              id: `user-${u.id}`,
              user_id: u.id,
              activity_type: 'user_registration',
              description: `Nouvelle inscription : ${u.name || u.email} (${u.type})`,
              created_at: u.created_at,
              metadata: {},
              severity: u.status === 'active' ? 'success' : 'info',
            });
          });
        }

        // Rendez-vous
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data) {
          appointmentsRes.value.data.forEach((a) => {
            synthetic.push({
              id: `appt-${a.id}`,
              user_id: a.visitor_id || '',
              activity_type: 'appointment_created',
              description: `Rendez-vous ${a.meeting_type || ''} — statut : ${a.status}`,
              created_at: a.created_at,
              metadata: {},
              severity: a.status === 'cancelled' ? 'warning' : 'info',
            });
          });
        }

        // Paiements
        if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) {
          paymentsRes.value.data.forEach((p) => {
            synthetic.push({
              id: `pay-${p.id}`,
              user_id: p.user_id || '',
              activity_type: p.status === 'approved' ? 'payment_approved' : p.status === 'rejected' ? 'payment_rejected' : 'payment_pending',
              description: `Paiement ${p.amount} ${p.currency} — ${p.status}`,
              created_at: p.created_at,
              metadata: {},
              severity: p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'error' : 'warning',
            });
          });
        }

        // Événements créés
        if (eventsRes.status === 'fulfilled' && eventsRes.value.data) {
          eventsRes.value.data.forEach((e) => {
            synthetic.push({
              id: `evt-${e.id}`,
              user_id: '',
              activity_type: 'event_created',
              description: `Événement créé : ${e.title}`,
              created_at: e.created_at,
              metadata: {},
              severity: 'info',
            });
          });
        }

        // Tenter aussi la vraie table activities (non bloquant)
        try {
          const { data: realActivities } = await supabase
            .from('activities')
            .select('id, user_id, activity_type, description, is_public, created_at')
            .order('created_at', { ascending: false })
            .limit(50);
          if (realActivities && realActivities.length > 0) {
            realActivities.forEach((a) => {
              synthetic.push({
                ...a,
                metadata: {},
                severity: getSeverityFromType(a.activity_type),
              });
            });
          }
        } catch {
          // table peut ne pas exister, non bloquant
        }

        // Trier par date décroissante
        synthetic.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setActivities(synthetic);
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
      case 'payment_rejected':
        return 'error';
      case 'user_suspension':
      case 'api_rate_limit':
      case 'content_moderation_warning':
      case 'payment_pending':
        return 'warning';
      case 'exhibitor_validation':
      case 'system_backup_success':
      case 'payment_approved':
      case 'user_registration':
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
      case 'user_registration': return Users;
      case 'exhibitor_validation': return Building2;
      case 'content_moderation': return FileText;
      case 'security_alert': return Shield;
      case 'system_error': return AlertTriangle;
      case 'appointment_created': return Calendar;
      case 'payment_approved': return UserCheck;
      case 'payment_rejected': return UserX;
      case 'payment_pending': return AlertTriangle;
      case 'event_created': return Calendar;
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
      system_backup_success: 'Sauvegarde réussie',
      user_registration: 'Inscription utilisateur',
      appointment_created: 'Rendez-vous créé',
      payment_approved: 'Paiement approuvé',
      payment_rejected: 'Paiement refusé',
      payment_pending: 'Paiement en attente',
      event_created: 'Événement créé',
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




