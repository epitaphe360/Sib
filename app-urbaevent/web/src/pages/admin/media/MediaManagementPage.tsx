import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, Eye, EyeOff, TrendingUp, Plus, Radio, Mic, Video as VideoIcon, Award, Users, Pencil, Trash2, ExternalLink, Globe, GlobeLock } from 'lucide-react';
import { mediaService } from '../../../services/mediaService';
import type { MediaContent, MediaType } from '../../../types/media';
import { ROUTES } from '../../../lib/routes';
import { useMediaVisibilityStore } from '../../../store/mediaVisibilityStore';

export const MediaManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const { mediaVisible: showContent, toggleMediaVisible: toggleShowContent } = useMediaVisibilityStore();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalViews: 0
  });

  useEffect(() => {
    loadMedia();
    loadStats();
  }, [filter, selectedType]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getMedia({
        status: filter === 'all' ? undefined : filter,
        type: selectedType === 'all' ? undefined : selectedType
      });
      setMedia(data);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const globalStats = await mediaService.getGlobalMediaStats();
      setStats(globalStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      // Initialiser avec des valeurs par défaut en cas d'erreur
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalViews: 0
      });
    }
  };

  const handleApprove = async (mediaId: string) => {
    try {
      await mediaService.updateMedia(mediaId, { status: 'published' });
      await loadMedia();
      await loadStats();
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };

  const handleReject = async (mediaId: string) => {
    try {
      await mediaService.updateMedia(mediaId, { status: 'rejected' } as any);
      await loadMedia();
      await loadStats();
    } catch (error) {
      console.error('Erreur rejet:', error);
    }
  };

  const handleUnpublish = async (mediaId: string) => {
    try {
      await mediaService.updateMedia(mediaId, { status: 'draft' });
      await loadMedia();
      await loadStats();
    } catch (error) {
      console.error('Erreur dépublication:', error);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (confirm(t('admin.confirm_delete_media'))) {
      try {
        await mediaService.deleteMedia(mediaId);
        await loadMedia();
        await loadStats();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back_to_dashboard')}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.media_management_title')}</h1>
              <p className="mt-2 text-gray-600">{t('admin.media_management_desc')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleShowContent()}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all ${
                  showContent
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                {showContent ? (
                  <>
                    <EyeOff className="w-5 h-5" />
                    Masquer le contenu
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Afficher le contenu
                  </>
                )}
              </button>
              <Link to={ROUTES.ADMIN_MEDIA_CREATE}>
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all">
                  <Plus className="w-5 h-5" />
                  {t('admin.new_media')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contenu masquable */}
        {showContent && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.total_media')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Play className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.pending')}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.approved')}</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.rejected')}</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Type Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Type de Média</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'all'
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Play className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xs font-semibold text-gray-900">Tous</div>
              <div className="text-xs text-gray-500">{media.length}</div>
            </button>
            <button
              onClick={() => setSelectedType('webinar')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'webinar'
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Radio className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xs font-semibold text-gray-900">Webinaires</div>
              <div className="text-xs text-gray-500">{media.filter(m => m.type === 'webinar').length}</div>
            </button>
            <button
              onClick={() => setSelectedType('podcast')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'podcast'
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mic className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-xs font-semibold text-gray-900">Podcasts</div>
              <div className="text-xs text-gray-500">{media.filter(m => m.type === 'podcast').length}</div>
            </button>
            <button
              onClick={() => setSelectedType('capsule_inside')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'capsule_inside'
                  ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <VideoIcon className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xs font-semibold text-gray-900">Inside</div>
              <div className="text-xs text-gray-500">{media.filter(m => m.type === 'capsule_inside').length}</div>
            </button>
            <button
              onClick={() => setSelectedType('live_studio')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'live_studio'
                  ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-xs font-semibold text-gray-900">Live Studio</div>
              <div className="text-xs text-gray-500">{media.filter(m => m.type === 'live_studio').length}</div>
            </button>
            <button
              onClick={() => setSelectedType('best_moments')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'best_moments'
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Award className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-xs font-semibold text-gray-900">Best Moments</div>
              <div className="text-xs text-gray-500">{media.filter(m => m.type === 'best_moments').length}</div>
            </button>
            <button
              onClick={() => setSelectedType('testimonial')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === 'testimonial'
                  ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-500 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
              <div className="text-xs font-semibold text-gray-900">Témoignages</div>
              <div className="text-xs text-gray-500">{media.filter(m => m.type === 'testimonial').length}</div>
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? t('common.all') : status === 'pending' ? t('admin.status_pending') : status === 'approved' ? t('admin.approved') : t('admin.rejected')}
              </button>
            ))}
          </div>
        </div>

        {/* Media List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('admin.loading')}</p>
          </div>
        ) : media.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.no_media_found')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {media.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'published' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'published' ? t('admin.status_published') : item.status === 'pending' ? t('admin.status_pending') : t('admin.status_rejected')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.view_count || 0} vues
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {item.like_count || 0} likes
                      </span>
                      <span>Durée: {item.duration || 0} min</span>
                      <span>Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0 lg:flex-col xl:flex-row items-start lg:items-end xl:items-center">
                    {/* Voir */}
                    <button
                      onClick={() => navigate(ROUTES.MEDIA_DETAIL.replace(':id', item.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Voir
                    </button>
                    {/* Modifier */}
                    <button
                      onClick={() => navigate(ROUTES.ADMIN_MEDIA_EDIT.replace(':id', item.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    {/* Publier */}
                    {item.status !== 'published' && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Publier
                      </button>
                    )}
                    {/* Dépublier */}
                    {item.status === 'published' && (
                      <button
                        onClick={() => handleUnpublish(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <GlobeLock className="w-3.5 h-3.5" />
                        Dépublier
                      </button>
                    )}
                    {/* Approuver / Rejeter contextuel */}
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleReject(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rejeter
                      </button>
                    )}
                    {item.status === 'rejected' && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approuver
                      </button>
                    )}
                    {/* Supprimer */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaManagementPage;



