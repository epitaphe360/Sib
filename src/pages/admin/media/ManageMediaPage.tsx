import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, MoreVertical, 
  Video, Mic, Film, Radio, Star, MessageCircle, Check, X 
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../../hooks/useTranslation';

interface Media {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category?: string;
  views_count?: number;
  is_published?: boolean;
  created_at: string;
  published_date?: string;
}

type FilterType = 'all' | 'webinar' | 'podcast' | 'capsule_inside' | 'live_studio' | 'best_moments' | 'testimonial';

export const ManageMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [media, searchQuery, filterType, filterStatus]);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, type, title, description, thumbnail_url, category, views_count, status, is_published, created_at, published_date:published_at')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...media];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => 
        filterStatus === 'published' ? m.is_published : !m.is_published
      );
    }

    setFilteredMedia(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
      const { error } = await supabase
        .from('media_contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Média supprimé avec succès');
      loadMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_contents')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Média dépublié' : 'Média publié');
      loadMedia();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <Video className="h-5 w-5 text-blue-600" />;
      case 'podcast': return <Mic className="h-5 w-5 text-purple-600" />;
      case 'capsule_inside': return <Film className="h-5 w-5 text-green-600" />;
      case 'live_studio': return <Radio className="h-5 w-5 text-red-600" />;
      case 'best_moments': return <Star className="h-5 w-5 text-yellow-600" />;
      case 'testimonial': return <MessageCircle className="h-5 w-5 text-pink-600" />;
      default: return <Video className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMediaTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      webinar: 'Webinaire',
      podcast: 'Podcast',
      capsule_inside: 'Capsule Inside',
      live_studio: 'Live Studio',
      best_moments: 'Best Moments',
      testimonial: 'Témoignage'
    };
    return labels[type] || type;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Médias</h1>
              <p className="text-gray-600 mt-2">
                {filteredMedia.length} média{filteredMedia.length > 1 ? 's' : ''} trouvé{filteredMedia.length > 1 ? 's' : ''}
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/media/create">
                <Plus className="h-4 w-4 mr-2" />
                Créer un média
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un média..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="webinar">Webinaires</option>
                <option value="podcast">Podcasts</option>
                <option value="capsule_inside">Capsules Inside</option>
                <option value="live_studio">Live Studio</option>
                <option value="best_moments">Best Moments</option>
                <option value="testimonial">Témoignages</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({media.length})
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'published'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Publiés ({media.filter(m => m.is_published).length})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'draft'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Brouillons ({media.filter(m => !m.is_published).length})
            </button>
          </div>
        </div>

        {/* Media List */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Video className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun média trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier média
            </p>
            <Button asChild>
              <Link to="/admin/media/create">
                <Plus className="h-4 w-4 mr-2" />
                Créer un média
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {getMediaIcon(item.type)}
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={item.is_published ? 'default' : 'secondary'}
                      className={item.is_published ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {item.is_published ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary">
                      {getMediaTypeLabel(item.type)}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    {getMediaIcon(item.type)}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(item.created_at)}</span>
                    {item.views_count && (
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views_count}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/media/${item.type}/${item.id}`)}
                        title={t('common.view')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.ADMIN_MEDIA_EDIT.replace(':id', item.id))}
                        title={t('common.edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        title={t('common.delete')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(item.id, item.is_published || false)}
                    >
                      {item.is_published ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Dépublier
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Publier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
