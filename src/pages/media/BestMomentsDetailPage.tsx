import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, BookmarkPlus, Eye, Star, Trophy } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VideoStreamPlayer } from '../../components/media/VideoStreamPlayer';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';

interface BestMoment {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url?: string;
  duration?: number;
  category?: string;
  event_name?: string;
  event_date?: string;
  highlight_type?: 'keynote' | 'award' | 'performance' | 'announcement' | 'other';
  views_count?: number;
  likes_count?: number;
  created_at: string;
}

export const BestMomentsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [moment, setMoment] = useState<BestMoment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadMoment();
    }
  }, [id]);

  const loadMoment = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, title, description, content_url:video_url, thumbnail_url, duration, category, event_name, event_date, highlight_type, views_count, likes_count, created_at')
        .eq('id', id)
        .eq('type', 'best_moments')
        .maybeSingle();

      if (error) throw error;
      setMoment(data);
    } catch (error) {
      console.error('Error loading best moment:', error);
      toast.error('Erreur lors du chargement du moment phare');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Like retiré' : 'Merci pour votre like !');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: moment?.title,
        text: moment?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getHighlightIcon = (type?: string) => {
    switch (type) {
      case 'keynote': return '??';
      case 'award': return '??';
      case 'performance': return '?';
      case 'announcement': return '??';
      default: return '?';
    }
  };

  const getHighlightLabel = (type?: string) => {
    switch (type) {
      case 'keynote': return 'Keynote';
      case 'award': return 'Remise de prix';
      case 'performance': return 'Performance';
      case 'announcement': return 'Annonce';
      default: return 'Moment phare';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Moment phare introuvable</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative">
              <Badge 
                variant="default" 
                className="absolute top-4 left-4 z-10 bg-yellow-600"
              >
                {getHighlightIcon(moment.highlight_type)} {getHighlightLabel(moment.highlight_type)}
              </Badge>
              <VideoStreamPlayer
                src={moment.content_url}
                poster={moment.thumbnail_url}
                title={moment.title}
                isLive={false}
              />
            </div>

            {/* Title & Actions */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600 uppercase">Best Moments</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {moment.title}
              </h1>

              {moment.category && (
                <Badge variant="secondary" className="mb-4">{moment.category}</Badge>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Star className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Aimé' : 'J\'aime'}
                  {moment.likes_count && ` (${moment.likes_count})`}
                </Button>
                <Button
                  variant={isSaved ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSave}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  {isSaved ? 'Enregistré' : 'Enregistrer'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {moment.views_count && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {moment.views_count.toLocaleString()} vues
                  </div>
                )}
                {moment.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(moment.duration)}
                  </div>
                )}
                {moment.event_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(moment.event_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Event Context */}
            {moment.event_name && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Événement: {moment.event_name}
                    </h3>
                    {moment.event_date && (
                      <p className="text-sm text-gray-600">
                        {formatDate(moment.event_date)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À propos de ce moment
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {moment.description}
                </p>
              </div>
            </div>

            {/* Context & Highlights */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Points clés
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">?</span>
                  <span>Un moment marquant de {moment.event_name || 'SIB'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">?</span>
                  <span>Revivre l'ambiance et l'énergie de l'événement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">?</span>
                  <span>Les temps forts à ne pas manquer</span>
                </li>
              </ul>
            </div>

            {/* Related Moments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Autres moments phares
              </h2>
              <p className="text-gray-600 text-sm">
                Découvrez d'autres moments exceptionnels...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Type</p>
                  <p className="text-sm text-gray-600">
                    {getHighlightIcon(moment.highlight_type)} {getHighlightLabel(moment.highlight_type)}
                  </p>
                </div>
                {moment.event_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Événement</p>
                    <p className="text-sm text-gray-600">{moment.event_name}</p>
                  </div>
                )}
                {moment.event_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-sm text-gray-600">{formatDate(moment.event_date)}</p>
                  </div>
                )}
                {moment.duration && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Durée</p>
                    <p className="text-sm text-gray-600">{formatDuration(moment.duration)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
              <div className="text-4xl mb-3">??</div>
              <h3 className="text-lg font-semibold mb-2">
                Best Moments
              </h3>
              <p className="text-sm text-yellow-100 mb-4">
                Les moments les plus mémorables de SIB, sélectionnés spécialement pour vous.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{moment.views_count || 0}</div>
                  <div className="text-xs text-yellow-100">Vues</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{moment.likes_count || 0}</div>
                  <div className="text-xs text-yellow-100">Likes</div>
                </div>
              </div>
            </div>

            {/* Browse More */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Plus de moments
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Explorez tous les moments phares de SIB
              </p>
              <Button variant="default" className="w-full" asChild>
                <Link to="/media/best-moments">
                  Voir tous les moments
                </Link>
              </Button>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Ne manquez rien
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Inscrivez-vous pour vivre les prochains moments phares en direct
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/register">
                  S'inscrire à SIB
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BestMomentsDetailPage;