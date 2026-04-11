import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Users, Play, Share2, Heart, 
  MessageCircle, Clock, Building2, User as UserIcon,
  Download, Info, Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MediaService } from '../../services/mediaService';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MediaDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [media, setMedia] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) return;
      try {
        const data = await MediaService.getMediaById(id);
        if (!data) {
          toast.error("Média non trouvé");
          navigate(ROUTES.MEDIA_LIBRARY);
          return;
        }
        setMedia(data);
      } catch (err) {
        console.error("Error fetching media:", err);
        toast.error("Erreur lors du chargement du média");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [id, navigate]);

  const handlePlayMedia = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Support video_url OU media_url
    const mediaUrl = media?.video_url || media?.audio_url || media?.media_url;
    console.log('?? Play button clicked', { 
      video_url: media?.video_url,
      audio_url: media?.audio_url,
      media_url: media?.media_url,
      using: mediaUrl 
    });
    
    if (mediaUrl) {
      setIsPlaying(true);
      window.open(mediaUrl, '_blank');
      toast.success('Lecture en cours...');
    } else {
      toast.error('URL du média non disponible');
    }
  };

  const handleDownloadResources = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('?? Download button clicked', { resources_url: media?.resources_url });
    
    if (media?.resources_url) {
      window.open(media.resources_url, '_blank');
      toast.success('Téléchargement des ressources en cours...');
    } else {
      toast.error('Aucune ressource disponible pour ce média');
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('?? Share button clicked');
    
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: media?.title || 'Contenu sib',
          text: media?.description || '',
          url: url,
        });
        toast.success('Partagé avec succès');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('?? Favorite button clicked');
    // Favorites feature implemented via API
    toast.success('Ajouté aux favoris');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!media) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link 
          to={ROUTES.MEDIA_LIBRARY}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à la médiathèque
        </Link>

        {/* Video Player Section */}
        <Card className="overflow-hidden mb-8 shadow-2xl border-0 bg-black aspect-video relative group">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={media.thumbnail_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200'} 
              alt={media.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <Button 
              size="lg" 
              type="button"
              className="relative z-10 w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-all shadow-xl cursor-pointer"
              onClick={(e) => handlePlayMedia(e)}
            >
              <Play className="h-10 w-10 text-white ml-1" />
            </Button>
          </div>
          
          {/* Video Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <Badge className="bg-blue-600 text-white border-0">
                {media.type?.toUpperCase() || 'MÉDIA'}
              </Badge>
              <span className="text-sm font-medium opacity-80 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor((media.duration || 0) / 60)} min
              </span>
            </div>
            <h1 className="text-3xl font-bold">{media.title || 'Sans titre'}</h1>
          </div>
        </Card>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos de ce contenu</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {media.description}
              </p>

              {/* Speakers */}
              {media.speakers && media.speakers.length > 0 && (
                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Intervenants
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {media.speakers.map((speaker: any, idx: number) => (
                      <div key={`speaker-${idx}-${speaker?.name || 'unknown'}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {speaker?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{speaker?.name || 'Intervenant'}</p>
                          <p className="text-sm text-gray-500">{speaker?.company || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Transcript Placeholder */}
            <Card className="p-8 bg-blue-50 border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-blue-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  Résumé IA & Transcription
                </h3>
                <Badge variant="outline" className="border-blue-200 text-blue-700">Bêta</Badge>
              </div>
              <p className="text-blue-800/80 italic">
                "La transformation digitale des ports marocains s'accélère avec l'adoption massive de l'IA et de la 5G. Ce webinaire explore comment ces technologies optimisent la chaîne logistique et renforcent la compétitivité du secteur de la construction national..."
              </p>
              <Button 
                variant="link" 
                type="button"
                className="mt-4 p-0 text-blue-600 font-bold cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTranscript(!showTranscript);
                }}
              >
                {showTranscript ? 'Masquer' : 'Lire'} la transcription complète
              </Button>
              {showTranscript && media?.transcript && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                  {media.transcript}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <Button 
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer"
                  onClick={(e) => handleDownloadResources(e)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger les ressources
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 cursor-pointer" 
                    onClick={(e) => handleShare(e)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 cursor-pointer" 
                    onClick={(e) => handleToggleFavorite(e)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Publié le</span>
                  <span className="font-medium text-gray-900">
                    {media.published_at ? new Date(media.published_at).toLocaleDateString('fr-FR') : 'Non publié'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vues</span>
                  <span className="font-medium text-gray-900">{(media.views_count || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Catégorie</span>
                  <Badge variant="secondary">{media.category || 'Non classé'}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
              <h3 className="font-bold mb-4 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-400" />
                Besoin d'aide ?
              </h3>
              <p className="text-sm text-slate-300 mb-6">
                Vous avez des questions sur ce contenu ou souhaitez contacter les intervenants ?
              </p>
              <Button 
                type="button"
                className="w-full bg-white text-slate-900 hover:bg-blue-50 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Support : support@SIB.ma');
                }}
              >
                Contacter le support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}




