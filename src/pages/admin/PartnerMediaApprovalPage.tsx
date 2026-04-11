import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Building2,
  Calendar,
  Video,
  Mic,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';
import { getEmbedUrl } from '../../utils/videoUtils';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface PendingMedia {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  created_at: string;
  creator_name: string;
  creator_email: string;
  partner_company: string;
  created_by_id: string;
}

export default function PartnerMediaApprovalPage() {
  const { user } = useAuthStore();
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<PendingMedia | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingMedia();
  }, []);

  const fetchPendingMedia = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_partner_media')
        .select('id, title, description, type, category, thumbnail_url, video_url, duration, created_at, creator_name, creator_email, partner_company, created_by_id')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      setPendingMedia(data || []);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
      toast.error('Erreur lors du chargement des médias en attente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (mediaId: string) => {
    if (!user) return;
    setProcessingId(mediaId);
    
    try {
      const { data, error } = await supabase.rpc('approve_partner_media', {
        media_id: mediaId,
        admin_id: user.id
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Média approuvé avec succès !');
        setPendingMedia(prev => prev.filter(m => m.id !== mediaId));
        setShowPreview(false);
        setSelectedMedia(null);
      } else {
        toast.error(data?.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Erreur approbation:', error);
      toast.error('Erreur lors de l\'approbation du média');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (mediaId: string) => {
    if (!user || !rejectionReason.trim()) {
      toast.error('Veuillez indiquer une raison de rejet');
      return;
    }

    setProcessingId(mediaId);
    
    try {
      const { data, error } = await supabase.rpc('reject_partner_media', {
        media_id: mediaId,
        admin_id: user.id,
        reason: rejectionReason
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Média rejeté');
        setPendingMedia(prev => prev.filter(m => m.id !== mediaId));
        setShowPreview(false);
        setSelectedMedia(null);
        setRejectionReason('');
      } else {
        toast.error(data?.error || 'Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast.error('Erreur lors du rejet du média');
    } finally {
      setProcessingId(null);
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            ← Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Validation Médias Partenaires</h1>
              <p className="mt-2 text-gray-600">
                Approuvez ou rejetez les médias soumis par les partenaires
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{pendingMedia.length}</div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingMedia.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingMedia.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun média en attente</h3>
              <p className="text-gray-600">Tous les médias partenaires ont été traités</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingMedia.map((media) => {
              const Icon = getMediaIcon(media.type);
              return (
                <motion.div
                  key={media.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-200">
                    {media.thumbnail_url ? (
                      <img
                        src={media.thumbnail_url}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="warning">En attente</Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {media.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {media.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        {media.partner_company || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {media.creator_name}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(media.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedMedia(media);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Prévisualiser
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMedia.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedMedia.partner_company}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setSelectedMedia(null);
                      setRejectionReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Video */}
                <div className="mb-6">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {selectedMedia.video_url && getEmbedUrl(selectedMedia.video_url) ? (
                      <iframe
                        src={getEmbedUrl(selectedMedia.video_url)!}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white">
                        <Video className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedMedia.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{selectedMedia.type}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Catégorie:</span>
                      <span className="ml-2 font-medium">{selectedMedia.category}</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du rejet (si applicable)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Expliquez pourquoi ce média est rejeté..."
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreview(false);
                      setSelectedMedia(null);
                      setRejectionReason('');
                    }}
                    disabled={processingId === selectedMedia.id}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleReject(selectedMedia.id)}
                    disabled={processingId === selectedMedia.id || !rejectionReason.trim()}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedMedia.id)}
                    disabled={processingId === selectedMedia.id}
                  >
                    {processingId === selectedMedia.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approuver
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
