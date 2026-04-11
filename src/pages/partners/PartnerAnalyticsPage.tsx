import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Handshake,
  Target,
  Calendar,
  Award,
  Download,
  Crown,
  Activity,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';

interface MonthlyData { month: string; appointments: number; connections: number; }

export const PartnerAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [overview, setOverview] = useState({
    profileViews: 0,
    connections: 0,
    appointments: 0,
    messages: 0,
  });

  const { user } = useAuthStore();
  const { dashboard, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    if (user && !dashboard) fetchDashboard();
  }, [user, dashboard, fetchDashboard]);

  useEffect(() => {
    if (dashboard?.stats) {
      setOverview({
        profileViews: dashboard.stats.profileViews || 0,
        connections: dashboard.stats.connections || 0,
        appointments: dashboard.stats.appointments || 0,
        messages: dashboard.stats.messages || 0,
      });
    }
  }, [dashboard]);

  useEffect(() => {
    if (!user) return;
    const loadMonthlyData = async () => {
      setLoading(true);
      try {
        const months: MonthlyData[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const start = d.toISOString();
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
          const monthLabel = d.toLocaleString('fr-FR', { month: 'short' });

          const [aptRes, connRes] = await Promise.all([
            supabase.from('appointments').select('id', { count: 'exact', head: true })
              .or(`exhibitor_id.eq.${user.id},visitor_id.eq.${user.id}`)
              .gte('created_at', start).lt('created_at', end),
            supabase.from('connections').select('id', { count: 'exact', head: true })
              .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
              .gte('created_at', start).lt('created_at', end),
          ]);
          months.push({
            month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
            appointments: aptRes.count || 0,
            connections: connRes.count || 0,
          });
        }
        setMonthlyData(months);
      } catch (err) {
        console.error('Erreur chargement données mensuelles:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMonthlyData();
  }, [user, selectedPeriod]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  const exportAnalytics = () => {
    const data = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      overview,
      monthlyData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-partner-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Rapport d\'analyse exporté avec succès !');
  };

  return (
    <div data-testid="analytics-dashboard" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analytics & ROI
                </h1>
                <p className="text-gray-600">
                  Analysez les performances de votre partenariat SIB
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
                <option value="90d">90 jours</option>
                <option value="1y">1 an</option>
              </select>

              <Button onClick={exportAnalytics} variant="default">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Rapports Détaillés Partenaires</span>
              <Badge className="bg-purple-100 text-purple-800" size="sm">
                Données Temps Réel
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : formatNumber(overview.profileViews)}
              </div>
              <div className="text-gray-600 text-sm">Vues du profil</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Handshake className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : formatNumber(overview.connections)}
              </div>
              <div className="text-gray-600 text-sm">Connexions établies</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : formatNumber(overview.appointments)}
              </div>
              <div className="text-gray-600 text-sm">Rendez-vous programmés</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : formatNumber(overview.messages)}
              </div>
              <div className="text-gray-600 text-sm">Messages (non lus)</div>
            </div>
          </Card>
        </div>

        {/* Performance Chart - données réelles par mois */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Évolution des Performances (6 derniers mois)</h3>
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /><span>Connexions</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /><span>Rendez-vous</span></span>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : (
              <div className="space-y-3">
                {monthlyData.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900 w-12">{month.month}</span>
                    <div className="flex-1 mx-4 flex space-x-6 text-sm">
                      <span className="text-purple-600 font-semibold">{month.connections} connexions</span>
                      <span className="text-orange-600 font-semibold">{month.appointments} RDV</span>
                    </div>
                  </div>
                ))}
                {monthlyData.every(m => m.connections === 0 && m.appointments === 0) && (
                  <p className="text-center text-gray-400 py-4">Aucune activité enregistrée sur cette période.</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques d'Engagement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : formatNumber(overview.profileViews)}
                </div>
                <div className="text-sm text-blue-700">Vues du profil</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Handshake className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : formatNumber(overview.connections)}
                </div>
                <div className="text-sm text-green-700">Connexions</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : formatNumber(overview.appointments)}
                </div>
                <div className="text-sm text-purple-700">Rendez-vous</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : formatNumber(overview.messages)}
                </div>
                <div className="text-sm text-orange-700">Messages non lus</div>
              </div>
            </div>
          </div>
        </Card>

        {/* ROI Analysis */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Récapitulatif de l'Activité
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Connexions totales</h4>
                <p className="text-3xl font-bold text-green-700">
                  {loading ? '...' : formatNumber(overview.connections)}
                </p>
                <p className="text-sm text-green-600 mt-1">Relations établies sur la plateforme</p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Rendez-vous planifiés</h4>
                <p className="text-3xl font-bold text-green-700">
                  {loading ? '...' : formatNumber(overview.appointments)}
                </p>
                <p className="text-sm text-green-600 mt-1">Meetings B2B programmés</p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Visibilité profil</h4>
                <p className="text-3xl font-bold text-green-700">
                  {loading ? '...' : formatNumber(overview.profileViews)}
                </p>
                <p className="text-sm text-green-600 mt-1">Visites de votre profil partenaire</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnerAnalyticsPage;
