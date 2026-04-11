import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Video,
  Mic,
  FileText,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface PartnerMedia {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

export default function PartnerMediaLibraryPage() {
  const { user } = useAuthStore();
  const [media, setMedia] = useState<PartnerMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchPartnerMedia();
  }, [user]);

  const fetchPartnerMedia = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('media_contents')
        .select('id, title, description, type, category, thumbnail_url, video_url, duration, status, created_at, approved_at, rejection_reason')
        .eq('created_by_id', user.id)
        .eq('created_by_type', 'partner')
        .order('created_at', { ascending: false })
        .range(0, 49);

      const { data, error } = await query;

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return (
          <Badge variant="warning" className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            En attente de validation
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="success" className="flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        );
      case 'published':
        return (
          <Badge variant="success" className="flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Publié
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="error" className="flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'podcast': return Mic;
      case 'webinar': return Video;
      case 'live': return Video;
      default: return FileText;
    }
  };

  const filteredMedia = media.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const stats = {
    total: media.length,
    pending: media.filter(m => m.status === 'pending_approval').length,
    approved: media.filter(m => m.status === 'approved' || m.status === 'published').length,
    rejected: media.filter(m => m.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            ← Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ma Bibliothèque Médias</h1>
              <p className="mt-2 text-gray-600">
                Gérez vos contenus médias soumis
              </p>
            </div>
            <Link to={ROUTES.PARTNER_MEDIA_UPLOAD}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Upload className="w-4 h-4 mr-2" />
                Soumettre un média
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Video className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approuvés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejetés</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Tous ({stats.total})
          </Button>
          <Button
            variant={filter === 'pending_approval' ? 'default' : 'outline'}
            onClick={() => setFilter('pending_approval')}
          >
            En attente ({stats.pending})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approuvés ({stats.approved})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejetés ({stats.rejected})
          </Button>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'Aucun média' : `Aucun média ${filter === 'pending_approval' ? 'en attente' : filter === 'approved' ? 'approuvé' : 'rejeté'}`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'Commencez par soumettre votre premier contenu média'
                  : 'Aucun contenu dans cette catégorie pour le moment'}
              </p>
              {filter === 'all' && (
                <Link to={ROUTES.PARTNER_MEDIA_UPLOAD}>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Soumettre un média
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => {
              const Icon = getMediaIcon(item.type);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-200">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Type:</span>
                        {item.type}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Soumis le:</span>
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {item.approved_at && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Approuvé le:</span>
                          {new Date(item.approved_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    {/* Rejection reason */}
                    {item.status === 'rejected' && item.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900 mb-1">Raison du rejet:</p>
                            <p className="text-sm text-red-700">{item.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {item.video_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(item.video_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir le média
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
