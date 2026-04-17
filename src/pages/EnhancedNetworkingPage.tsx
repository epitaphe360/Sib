import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import {
  Users, Brain, MessageCircle, Calendar, Search, Filter,
  Heart, CheckCircle, Clock, Eye, BarChart3, TrendingUp,
  Handshake, Star, Crown, Shield, QrCode, Settings,
  Network, Zap, Target, Award, Sparkles, Gauge
} from 'lucide-react';
import { useNetworkingStore } from '../store/networkingStore';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { QRCodeGenerator } from '../components/qr/QRCodeGenerator';
import { EnhancedChatInterface } from '../components/chat/EnhancedChatInterface';
import RecommendationList from '../components/networking/RecommendationList';
import { getNetworkingPermissions, getPermissionErrorMessage } from '../lib/networkingPermissions';

type TabType = 'recommendations' | 'connections' | 'messages' | 'qr-access' | 'analytics';

const EnhancedNetworkingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const {
    recommendations,
    isLoading,
    error,
    connections,
    favorites,
    pendingConnections,
    permissions,
    dailyUsage,
    fetchRecommendations,
    updatePermissions,
    getRemainingQuota,
    loadAIInsights,
    aiInsights,
  } = useNetworkingStore();

  const [activeTab, setActiveTab] = useState<TabType>('recommendations');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPermissionUpgrade, setShowPermissionUpgrade] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      updatePermissions();
      fetchRecommendations();
    }
  }, [isAuthenticated, user]);

  // Check if user has access to networking
  useEffect(() => {
    if (user && permissions && !permissions.canAccessNetworking) {
      setShowPermissionUpgrade(true);
    }
  }, [user, permissions]);

  const remaining = getRemainingQuota();

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'partner': return <Star className="h-4 w-4 text-amber-600" />;
      case 'exhibitor': return <Award className="h-4 w-4 text-blue-600" />;
      case 'visitor': return <Users className="h-4 w-4 text-green-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccessLevelColor = (userType: string, userLevel?: string): string => {
    if (userType === 'admin') {return 'from-purple-500 to-indigo-600';}
    if (userType === 'partner') {return 'from-amber-500 to-orange-600';}
    if (userType === 'exhibitor') {return 'from-blue-500 to-cyan-600';}
    if (userType === 'visitor') {
      switch (userLevel) {
        case 'vip': return 'from-purple-500 to-pink-600';
        case 'premium': return 'from-blue-500 to-indigo-600';
        case 'basic': return 'from-green-500 to-emerald-600';
        default: return 'from-gray-400 to-gray-600';
      }
    }
    return 'from-gray-400 to-gray-600';
  };

  const getQuotaPercentage = (used: number, total: number): number => {
    if (total === -1) {return 0;} // Unlimited
    return total > 0 ? (used / total) * 100 : 100;
  };

  const getQuotaColor = (percentage: number): string => {
    if (percentage >= 90) {return 'bg-red-500';}
    if (percentage >= 70) {return 'bg-amber-500';}
    return 'bg-green-500';
  };

  // Permission Upgrade Modal
  if (showPermissionUpgrade && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Network className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Réseautage Premium
            </h2>

            <p className="text-gray-600 mb-6">
              {user.type === 'visitor' && user.profile.passType === 'free'
                ? "Le réseautage n'est pas disponible avec le forfait gratuit. Mettez à niveau pour accéder aux fonctionnalités de networking professionnel."
                : "Votre niveau d'accès actuel ne permet pas d'utiliser toutes les fonctionnalités de réseautage."}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                Recommandations IA personnalisées
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                Chat direct avec les participants
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                Planification de rendez-vous
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                Accès aux événements exclusifs
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Crown className="h-4 w-4 mr-2" />
                Mettre à Niveau Mon Forfait
              </Button>
              <Button variant="ghost" onClick={() => setShowPermissionUpgrade(false)}>
                Continuer en Mode Limité
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion Requise</h2>
          <p className="text-gray-600 mb-4">
            Vous devez être connecté pour accéder aux fonctionnalités de réseautage.
          </p>
          <Button variant="default">Se Connecter</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with User Status */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Network className="h-8 w-8 mr-3 text-blue-600" />
                Réseautage SIB 2026
              </h1>
              <p className="text-lg text-gray-600">
                Connectez-vous avec {recommendations.length} professionnels du secteur du bâtiment
              </p>
            </div>

            {/* User Status Card */}
            {user && (
              <div className="lg:w-80">
                <Card className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${getAccessLevelColor(user.type, user.profile.passType || user.profile.status)}`} />
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profile.avatar} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          {getUserTypeIcon(user.type)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {user.type === 'visitor' ? `Pass ${user.profile.passType || 'gratuit'}` :
                           user.type === 'partner' ? 'Partenaire' :
                           user.type === 'exhibitor' ? 'Exposant' : 'Administrateur'}
                        </p>
                      </div>
                      {permissions?.priorityLevel && (
                        <Badge variant="success" className="text-xs">
                          Priorité {permissions.priorityLevel}
                        </Badge>
                      )}
                    </div>

                    {/* Daily Usage Quotas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Connexions</span>
                        <span className="font-medium">
                          {dailyUsage.connections}/{permissions?.maxConnectionsPerDay === -1 ? 'âˆž' : permissions?.maxConnectionsPerDay}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${getQuotaColor(getQuotaPercentage(dailyUsage.connections, permissions?.maxConnectionsPerDay || 0))}`}
                          style={{ width: `${Math.min(100, getQuotaPercentage(dailyUsage.connections, permissions?.maxConnectionsPerDay || 0))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Messages</span>
                        <span className="font-medium">
                          {dailyUsage.messages}/{permissions?.maxMessagesPerDay === -1 ? 'âˆž' : permissions?.maxMessagesPerDay}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${getQuotaColor(getQuotaPercentage(dailyUsage.messages, permissions?.maxMessagesPerDay || 0))}`}
                          style={{ width: `${Math.min(100, getQuotaPercentage(dailyUsage.messages, permissions?.maxMessagesPerDay || 0))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Rendez-vous</span>
                        <span className="font-medium">
                          {dailyUsage.meetings}/{permissions?.maxMeetingsPerDay === -1 ? 'âˆž' : permissions?.maxMeetingsPerDay}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${getQuotaColor(getQuotaPercentage(dailyUsage.meetings, permissions?.maxMeetingsPerDay || 0))}`}
                          style={{ width: `${Math.min(100, getQuotaPercentage(dailyUsage.meetings, permissions?.maxMeetingsPerDay || 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'recommendations', label: 'Recommandations IA', icon: Brain, count: recommendations.length },
                { id: 'connections', label: 'Mes Connexions', icon: Users, count: connections.length },
                { id: 'messages', label: 'Messages', icon: MessageCircle, count: 3 },
                { id: 'qr-access', label: 'QR & Événements', icon: QrCode },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                {/* AI Insights */}
                {permissions?.canAccessAIRecommendations && (
                  <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                        Insights IA Personnalisés
                      </h3>
                      <Button size="sm" onClick={loadAIInsights} disabled={isLoading}>
                        <Brain className="h-4 w-4 mr-2" />
                        {isLoading ? 'Analyse...' : 'Actualiser'}
                      </Button>
                    </div>

                    {aiInsights ? (
                      <div className="space-y-4">
                        <p className="text-gray-700">{aiInsights.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                            <ul className="space-y-1">
                              {aiInsights.suggestions.map((suggestion) => (
                                <li key={suggestion} className="text-sm text-gray-600 flex items-start">
                                  <Target className="h-3 w-3 mr-2 mt-1 text-blue-500" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Mots-clés Tendance</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiInsights.topKeywords.map((keyword) => (
                                <Badge key={keyword} variant="success" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Button onClick={loadAIInsights} disabled={isLoading}>
                          <Brain className="h-4 w-4 mr-2" />
                          Générer des Insights IA
                        </Button>
                      </div>
                    )}
                  </Card>
                )}

                {/* Recommendations List */}
                <RecommendationList />
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Mes Connexions</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((connectionId) => (
                    <Card key={connectionId} className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>U{connectionId}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Utilisateur {connectionId}</h4>
                          <p className="text-sm text-gray-600">Connecté</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <EnhancedChatInterface />
            )}

            {activeTab === 'qr-access' && (
              <QRCodeGenerator showEvents={true} />
            )}

            {activeTab === 'analytics' && permissions?.canAccessAnalytics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Analytics de Réseautage
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center">
                      <Handshake className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Connexions Totales</p>
                        <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Messages Envoyés</p>
                        <p className="text-2xl font-bold text-gray-900">{dailyUsage.messages}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">RDV Programmés</p>
                        <p className="text-2xl font-bold text-gray-900">{dailyUsage.meetings}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Score Réseau</p>
                        <p className="text-2xl font-bold text-gray-900">92%</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Analytics Chart Placeholder */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Activité de Réseautage</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Graphiques d'analytics à venir</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedNetworkingPage;

