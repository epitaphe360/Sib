import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Activity,
  Users,
  MessageCircle,
  Calendar,
  Handshake,
  Award,
  FileText,
  AlertTriangle,
  Crown,
  Clock
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const PartnerActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const activities = [
    {
      id: '1',
      type: 'connection',
      title: t('partner.activity.connection_established', 'Nouvelle connexion établie'),
      description: t('partner.activity.connected_with', 'Vous êtes maintenant connecté avec Bâtiment Solutions Inc.'),
      timestamp: new Date(Date.now() - 3600000),
      icon: Handshake,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      category: 'networking'
    },
    {
      id: '2',
      type: 'message',
      title: t('partner.activity.new_message', 'Nouveau message reçu'),
      description: t('partner.activity.message_from', 'TechMarine Solutions vous a envoyé un message'),
      timestamp: new Date(Date.now() - 7200000),
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      category: 'communication'
    },
    {
      id: '3',
      type: 'event',
      title: t('partner.activity.event_participation', 'Participation à un événement'),
      description: t('partner.activity.participated_in', 'Vous avez participé à la conférence "Digital Transformation in Bâtiments"'),
      timestamp: new Date(Date.now() - 10800000),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      category: 'events'
    },
    {
      id: '4',
      type: 'sponsorship',
      title: t('partner.activity.sponsoring_activated', 'Sponsoring activé'),
      description: t('partner.activity.logo_displayed', "Votre logo est maintenant affiché sur la page d'accueil"),
      timestamp: new Date(Date.now() - 14400000),
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      category: 'sponsorship'
    },
    {
      id: '5',
      type: 'profile_view',
      title: t('partner.activity.profile_viewed', 'Profil consulté'),
      description: t('partner.activity.views_today', "Votre profil a été consulté 15 fois aujourd'hui"),
      timestamp: new Date(Date.now() - 18000000),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      category: 'engagement'
    },
    {
      id: '6',
      type: 'content',
      title: t('partner.activity.content_shared', 'Contenu partagé'),
      description: t('partner.activity.article_shared', 'Votre article "Innovation in Building Technology" a été partagé'),
      timestamp: new Date(Date.now() - 21600000),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      category: 'content'
    },
    {
      id: '7',
      type: 'alert',
      title: t('partner.activity.system_alert', 'Alerte système'),
      description: t('partner.activity.metrics_update', 'Mise à jour de vos métriques de performance disponible'),
      timestamp: new Date(Date.now() - 25200000),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      category: 'system'
    },
    {
      id: '8',
      type: 'meeting',
      title: t('partner.activity.meeting_scheduled', 'Rendez-vous programmé'),
      description: t('partner.activity.meeting_confirmed', 'RDV confirmé avec LogiFlow Systems demain à 14h'),
      timestamp: new Date(Date.now() - 28800000),
      icon: Calendar,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      category: 'meetings'
    }
  ];

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter === 'all') return true;
    return activity.category === selectedFilter;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return t('partner.activity.just_now', "À l'instant");
    if (diffInHours < 24) return t('partner.activity.hours_ago', `Il y a ${diffInHours}h`);

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('partner.activity.days_ago', `Il y a ${diffInDays}j`);

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'connection': return t('partner.activity.type.connection', 'Connexion');
      case 'message': return t('partner.activity.type.message', 'Message');
      case 'event': return t('partner.activity.type.event', 'Événement');
      case 'sponsorship': return t('partner.activity.type.sponsorship', 'Sponsoring');
      case 'profile_view': return t('partner.activity.type.consultation', 'Consultation');
      case 'content': return t('partner.activity.type.content', 'Contenu');
      case 'alert': return t('partner.activity.type.alert', 'Alerte');
      case 'meeting': return t('partner.activity.type.meeting', 'Rendez-vous');
      default: return type;
    }
  };

  const activityStats = {
    total: activities.length,
    today: activities.filter(a => {
      const today = new Date();
      const activityDate = new Date(a.timestamp);
      return activityDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: activities.filter(a => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(a.timestamp) > weekAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('partner.back_to_dashboard', 'Retour au tableau de bord')}
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('partner.activity.title', 'Activité Partenaire')}
                </h1>
                <p className="text-gray-600">
                  {t('partner.activity.subtitle', 'Suivez toutes vos interactions et engagements SIB')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('partner.activity.filter.all', 'Toutes les activités')}</option>
                <option value="networking">{t('partner.activity.filter.networking', 'Réseautage')}</option>
                <option value="communication">{t('partner.activity.filter.communication', 'Communication')}</option>
                <option value="events">{t('partner.activity.filter.events', 'Événements')}</option>
                <option value="sponsorship">{t('partner.activity.filter.sponsorship', 'Sponsoring')}</option>
                <option value="engagement">{t('partner.activity.filter.engagement', 'Engagement')}</option>
                <option value="content">{t('partner.activity.filter.content', 'Contenu')}</option>
                <option value="meetings">{t('partner.activity.filter.meetings', 'Rendez-vous')}</option>
                <option value="system">{t('partner.activity.filter.system', 'Système')}</option>
              </select>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">{t('partner.activity.full_history', 'Historique Complet des Activités')}</span>
              <Badge className="bg-purple-100 text-purple-800" size="sm">
                {t('partner.activity.realtime', 'Temps Réel')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{activityStats.total}</div>
              <div className="text-gray-600">{t('partner.activity.stats.total', 'Activités totales')}</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{activityStats.today}</div>
              <div className="text-gray-600">{t('partner.activity.stats.today', "Aujourd'hui")}</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{activityStats.thisWeek}</div>
              <div className="text-gray-600">{t('partner.activity.stats.this_week', 'Cette semaine')}</div>
            </div>
          </Card>
        </div>

        {/* Activities List */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {t('partner.activity.history', 'Historique des Activités')}
            </h3>

            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const ActivityIcon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-3 rounded-lg ${activity.bgColor}`}>
                      <ActivityIcon className={`h-5 w-5 ${activity.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {activity.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" size="sm">
                            {getActivityTypeLabel(activity.type)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('partner.activity.no_activity', 'Aucune activité trouvée')}
                </h3>
                <p className="text-gray-600">
                  {t('partner.activity.try_filters', 'Essayez de modifier vos filtres de recherche')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default PartnerActivityPage;