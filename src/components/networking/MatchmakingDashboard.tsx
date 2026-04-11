import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, MessageCircle, Handshake, TrendingUp, Calendar, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ROUTES } from '../../lib/routes';
import { MatchmakingService } from '../../services/matchmaking';
import useAuthStore from '../../store/authStore';
import { useNetworkingStore } from '../../store/networkingStore';
import type { MatchScore } from '../../types/site-builder';
import { useTranslation } from '../../hooks/useTranslation';

export const MatchmakingDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { connections } = useNetworkingStore();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<MatchScore[]>([]);
  const [networkStrength, setNetworkStrength] = useState(0);
  const [filters, setFilters] = useState({
    industry: '',
    interests: [] as string[],
    location: '',
    minScore: 0
  });
  const [loading, setLoading] = useState(true);

  // Vérification du niveau d'accès (Réseautage IA réservé aux comptes Premium/VIP)
  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);

  useEffect(() => {
    if (user && !isFreeVisitor) {
      loadRecommendations();
      loadNetworkStrength();
    } else if (user && isFreeVisitor) {
      setLoading(false);
    }
  }, [user, isFreeVisitor]);

  if (isFreeVisitor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="bg-purple-100 p-6 rounded-full mb-6">
          <Lock className="h-16 w-16 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('visitor.premium_feature')}</h2>
        <p className="text-gray-600 text-lg max-w-md mb-8">
          {t('networking.ai_reserved_premium')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate(ROUTES.VISITOR_UPGRADE)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            {t('visitor.upgrade_level')}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl border-2"
          >
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const recs = await MatchmakingService.getRecommendations(user.id, 20);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNetworkStrength = async () => {
    if (!user) return;

    try {
      const strength = await MatchmakingService.calculateNetworkStrength(user.id);
      setNetworkStrength(strength);
    } catch (error) {
      console.error('Error calculating network strength:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('networking.excellent_match');
    if (score >= 60) return t('networking.good_match');
    if (score >= 40) return t('networking.potential_match');
    return t('networking.low_match');
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;

    try {
      await MatchmakingService.sendConnectionRequest(user.id, targetUserId);
      toast.success('Demande de connexion envoyée !');
      loadRecommendations(); // Refresh recommendations
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
      console.error('Connection error:', error);
    }
  };

  const handleMessage = (_targetUserId: string, _targetName: string) => {
    if (!user) return;
    navigate(`/messages?userId=${_targetUserId}`);
  };

  const handleLike = async (targetUserId: string) => {
    if (!user) return;

    try {
      await MatchmakingService.likeProfile(user.id, targetUserId);
      toast.success('Profil ajouté aux favoris !');
      loadRecommendations(); // Refresh recommendations
    } catch (error) {
      toast.error('Erreur lors de l\'ajout aux favoris');
      console.error('Like error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎯 Matchmaking Intelligent</h1>
        <p className="text-gray-600">
          Découvrez les professionnels les plus pertinents pour votre réseau
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Recommandations</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{networkStrength}%</div>
              <div className="text-sm text-gray-600">Force réseau</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${networkStrength}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Handshake className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {recommendations.filter(r => r.score >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Matches excellents</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{connections.length}</div>
              <div className="text-sm text-gray-600">Interactions/semaine</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">🤝 Recommandations personnalisées</h2>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Aucune recommandation pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">
              Complétez votre profil pour obtenir de meilleures recommandations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 10).map((match, index) => (
              <div
                key={match.userId}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {match.userId.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold mb-1">
                          Professionnel #{index + 1}
                        </h3>
                        <p className="text-gray-600">Secteur du sport</p>
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${getScoreColor(match.score)}`}>
                          <Star className="w-4 h-4" />
                          {match.score}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getScoreLabel(match.score)}
                        </div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">
                        Pourquoi ce match ?
                      </h4>
                      <ul className="space-y-1">
                        {match.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shared Interests */}
                    {match.sharedInterests.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">
                          Intérêts communs:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.sharedInterests.map(interest => (
                            <Badge key={interest} className="bg-blue-100 text-blue-800">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Complementary Skills */}
                    {match.complementarySkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">
                          Compétences complémentaires:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.complementarySkills.map(skill => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConnect(match.userId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Handshake className="w-4 h-4" />
                        Connecter
                      </button>
                      <button
                        onClick={() => handleMessage(match.userId, `Professionnel #${index + 1}`)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => handleLike(match.userId)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Ajouter aux favoris"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Conseils pour optimiser vos matchs</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Complétez votre profil avec vos centres d'intérêt et compétences</li>
          <li>• Soyez actif: plus vous interagissez, meilleurs sont les matchs</li>
          <li>• Rejoignez des salles de networking thématiques</li>
          <li>• Participez aux sessions de speed networking</li>
          <li>• Partagez votre expertise dans votre secteur</li>
        </ul>
      </div>
    </div>
  );
};
