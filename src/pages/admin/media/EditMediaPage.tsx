import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Mic, Film, Radio, Star, MessageCircle, Save, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';
import { mediaService } from '../../../services/mediaService';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { MediaType } from '../../../types/media';

interface Media {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  duration?: number;
  category?: string;
  tags?: string[];
  speakers?: any[];
  status?: 'draft' | 'published' | 'archived';
}

export const EditMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState<Media | null>(null);
  const [formData, setFormData] = useState({
    type: 'webinar' as MediaType,
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    audio_url: '',
    duration: 0,
    category: '',
    tags: '',
    speakers: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const mediaTypes = [
    { value: 'webinar', label: 'Webinaire', icon: Video, color: 'blue' },
    { value: 'podcast', label: 'Podcast SIB Talks', icon: Mic, color: 'purple' },
    { value: 'capsule_inside', label: 'Capsule Inside SIB', icon: Film, color: 'green' },
    { value: 'live_studio', label: 'Live Studio - Meet The Leaders', icon: Radio, color: 'red' },
    { value: 'best_moments', label: 'Best Moments', icon: Star, color: 'yellow' },
    { value: 'testimonial', label: 'Témoignage', icon: MessageCircle, color: 'pink' }
  ];

  const categories = [
    'Business',
    'Innovation',
    'Logistique',
    'Transport',
    'Environnement',
    'Éducation',
    'Technologie',
    'Supply Chain'
  ];

  useEffect(() => {
    loadMedia();
  }, [id]);

  const loadMedia = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, type, title, description, thumbnail_url, video_url, audio_url, duration, category, tags, speakers, status, created_at')
        .eq('id', id)
        .single();

      if (error) throw error;

      setMedia(data);
      setFormData({
        type: data.type || 'webinar',
        title: data.title || '',
        description: data.description || '',
        thumbnail_url: data.thumbnail_url || '',
        video_url: data.video_url || '',
        audio_url: data.audio_url || '',
        duration: data.duration || 0,
        category: data.category || '',
        tags: data.tags?.join(', ') || '',
        speakers: JSON.stringify(data.speakers || []),
        status: data.status || 'draft'
      });
    } catch (error) {
      console.error('Erreur chargement média:', error);
      toast.error('Impossible de charger le média');
      navigate(ROUTES.ADMIN_MEDIA_MANAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;
    if (!formData.title || !formData.type) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      // Parse speakers JSON if provided
      let speakersArray = [];
      if (formData.speakers) {
        try {
          speakersArray = JSON.parse(formData.speakers);
        } catch {
          toast.error('Format JSON des speakers invalide');
          setSubmitting(false);
          return;
        }
      }

      // Parse tags
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];

      const { error } = await supabase
        .from('media_contents')
        .update({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          thumbnail_url: formData.thumbnail_url || null,
          video_url: formData.video_url || null,
          audio_url: formData.audio_url || null,
          duration: formData.duration || null,
          category: formData.category || null,
          tags: tagsArray,
          speakers: speakersArray,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Média mis à jour avec succès !');
      navigate(ROUTES.ADMIN_MEDIA_MANAGE);
    } catch (error) {
      console.error('Erreur modification média:', error);
      toast.error('Erreur lors de la modification du média');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedTypeInfo = mediaTypes.find(t => t.value === formData.type);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement du média...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la gestion des médias
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Modifier le Média</h1>
          <p className="mt-2 text-gray-600">Mettez à jour les informations du média</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type de Média <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mediaTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                    <div className={`text-sm font-medium ${isSelected ? `text-${type.color}-900` : 'text-gray-700'}`}>
                      {type.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Titre du média"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description du média"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Thumbnail
              </label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            {(formData.type === 'webinar' || formData.type === 'capsule_inside' ||
              formData.type === 'live_studio' || formData.type === 'best_moments' ||
              formData.type === 'testimonial') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Vidéo
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}

            {formData.type === 'podcast' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Audio
                </label>
                <input
                  type="url"
                  value={formData.audio_url}
                  onChange={(e) => handleChange('audio_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          {/* Duration and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Sélectionner --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Speakers */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Speakers (JSON)
            </label>
            <textarea
              value={formData.speakers}
              onChange={(e) => handleChange('speakers', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder='[{"name": "John Doe", "title": "CEO"}]'
            />
            <p className="text-xs text-gray-500 mt-1">Format: JSON array</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="text-gray-600 hover:text-gray-900">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Mettre à jour
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMediaPage;
