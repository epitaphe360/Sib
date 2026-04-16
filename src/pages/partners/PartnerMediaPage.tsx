import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Tv,
  Newspaper,
  Share2,
  Users,
  TrendingUp,
  Award,
  Crown,
  Calendar,
  ExternalLink,
  Upload,
  BarChart3,
  Library,
  Loader2,
  PlusCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

interface MediaMention {
  id: string;
  type: 'tv' | 'press' | 'social' | 'upcoming';
  title: string;
  description?: string;
  mention_date?: string;
  reach?: string;
  sentiment?: string;
  status?: string;
  url?: string;
  duration?: string;
  outlet?: string;
  headline?: string;
  excerpt?: string;
  platform?: string;
  content?: string;
  engagement?: string;
  media?: string;
  topic?: string;
}

export const PartnerMediaPage: React.FC = () => {
  const { user } = useAuthStore();
  const [mentions, setMentions] = useState<MediaMention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentions = async () => {
      if (!user) {return;}
      try {
        // Récupère le partner_id de l'utilisateur connecté
        const { data: partnerData } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!partnerData) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('media_mentions')
          .select('*')
          .eq('partner_id', partnerData.id)
          .order('mention_date', { ascending: false });

        if (!error && data) {setMentions(data as MediaMention[]);}
      } catch {
        // table peut ne pas exister encore — afficher état vide
      } finally {
        setLoading(false);
      }
    };
    fetchMentions();
  }, [user]);

  const tvMentions = mentions.filter((m) => m.type === 'tv');
  const pressMentions = mentions.filter((m) => m.type === 'press');
  const socialMentions = mentions.filter((m) => m.type === 'social');
  const upcomingMentions = mentions.filter((m) => m.type === 'upcoming');

  const overview = {
    totalMentions: tvMentions.length + pressMentions.length + socialMentions.length,
    socialImpressions: socialMentions.reduce((acc, m) => acc + parseInt(m.reach?.replace(/\D/g, '') || '0', 10), 0),
    engagementRate: 0,
    mediaValue: 0,
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive': return 'text-green-600 bg-green-50';
      case 'positive': return 'text-blue-600 bg-blue-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive': return 'Très positif';
      case 'positive': return 'Positif';
      case 'neutral': return 'Neutre';
      case 'negative': return 'Négatif';
      default: return sentiment;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diffusé': return 'text-green-600 bg-green-50';
      case 'Programmé': return 'text-blue-600 bg-blue-50';
      case 'Confirmé': return 'text-purple-600 bg-purple-50';
      case 'En préparation': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Tv className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Médias & Communication
              </h1>
              <p className="text-gray-600">
                Suivez votre couverture médiatique et votre présence dans les médias
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Couverture Médiatique Premium</span>
                <Badge className="bg-blue-100 text-blue-800" size="sm">
                  Temps Réel
                </Badge>
              </div>
              <div className="flex gap-3">
                <Link
                  to={ROUTES.PARTNER_MEDIA_UPLOAD}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Uploader un média
                </Link>
                <Link
                  to={ROUTES.PARTNER_MEDIA_ANALYTICS}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
                <Link
                  to={ROUTES.MEDIA_LIBRARY}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  Bibliothèque
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Newspaper className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{overview.totalMentions}</p>
                  <p className="text-sm text-gray-600">Mentions médias</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{overview.socialImpressions.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Impressions sociales</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{overview.engagementRate}%</p>
                  <p className="text-sm text-gray-600">Taux d'engagement</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{overview.mediaValue.toLocaleString()}€</p>
                  <p className="text-sm text-gray-600">Valeur média</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Television Coverage */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Tv className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Télévision</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : tvMentions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune mention TV enregistrée</div>
            ) : (
              <div className="space-y-4">
                {tvMentions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        {item.status && <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span>}
                      </div>
                      {item.description && <p className="text-gray-600 text-sm mb-2">{item.description}</p>}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {item.mention_date && <span>📅 {item.mention_date}</span>}
                        {item.reach && <span>👥 {item.reach} téléspectateurs</span>}
                        {item.duration && <span>⏱️ {item.duration}</span>}
                      </div>
                    </div>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-600" /></a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Press Coverage */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Newspaper className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Presse Écrite</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>
            ) : pressMentions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune mention presse enregistrée</div>
            ) : (
              <div className="space-y-4">
                {pressMentions.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        {item.outlet && <span className="text-sm text-gray-500">{item.outlet}</span>}
                        {item.sentiment && <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>{getSentimentLabel(item.sentiment)}</span>}
                      </div>
                      {item.mention_date && <span className="text-sm text-gray-500">{item.mention_date}</span>}
                    </div>
                    {item.headline && <h5 className="font-medium text-gray-900 mb-2">{item.headline}</h5>}
                    {item.excerpt && <p className="text-gray-600 text-sm mb-3">{item.excerpt}</p>}
                    <div className="flex items-center justify-between">
                      {item.reach && <span className="text-sm text-gray-500">Bâtimentée estimée: {item.reach}</span>}
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" /></a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Social Media */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Share2 className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Réseaux Sociaux</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-purple-600" /></div>
            ) : socialMentions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune mention sur les réseaux sociaux</div>
            ) : (
              <div className="space-y-4">
                {socialMentions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {item.platform && <span className="font-medium text-gray-900">{item.platform}</span>}
                        {item.sentiment && <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>{getSentimentLabel(item.sentiment)}</span>}
                      </div>
                      {item.content && <p className="text-gray-900 text-sm mb-1">{item.content}</p>}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {item.mention_date && <span>📅 {item.mention_date}</span>}
                        {item.engagement && <span>❤️ {item.engagement}</span>}
                        {item.reach && <span>👁️ {item.reach} impressions</span>}
                      </div>
                    </div>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-600" /></a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Media */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Événements Médiatiques à Venir</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
            ) : upcomingMentions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun événement médiatique planifié</div>
            ) : (
              <div className="space-y-4">
                {upcomingMentions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">{item.title}</span>
                        {item.media && <span className="text-sm text-gray-600">{item.media}</span>}
                        {item.status && <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span>}
                      </div>
                      {item.topic && <p className="text-gray-600 text-sm mb-2">{item.topic}</p>}
                      {item.mention_date && <span className="text-sm text-gray-500">📅 {item.mention_date}</span>}
                    </div>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnerMediaPage;
