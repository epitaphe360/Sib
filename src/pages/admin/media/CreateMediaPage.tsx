import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Mic, Film, Radio, Star, MessageCircle, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';
import { mediaService } from '../../../services/mediaService';
import { toast } from 'sonner';
import { useTranslation } from '../../../hooks/useTranslation';
import type { MediaType } from '../../../types/media';

export const CreateMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
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
    { value: 'podcast', label: 'Podcast sib Talks', icon: Mic, color: 'purple' },
    { value: 'capsule_inside', label: 'Capsule Inside sib', icon: Film, color: 'green' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Parse speakers JSON if provided
      let speakersArray = [];
      if (formData.speakers) {
        try {
          speakersArray = JSON.parse(formData.speakers);
        } catch {
          toast.error('Format JSON des speakers invalide');
          setLoading(false);
          return;
        }
      }

      // Parse tags
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];

      await mediaService.createMedia({
        type: formData.type,
        title: formData.title,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url || undefined,
        video_url: formData.video_url || undefined,
        audio_url: formData.audio_url || undefined,
        duration: formData.duration || undefined,
        category: formData.category || undefined,
        tags: tagsArray,
        speakers: speakersArray,
        status: formData.status
      });

      toast.success('Média créé avec succès !');
      navigate(ROUTES.ADMIN_MEDIA_MANAGE);
    } catch (error) {
      console.error('Erreur création média:', error);
      toast.error('Erreur lors de la création du média');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedTypeInfo = mediaTypes.find(t => t.value === formData.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la gestion des médias
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Créer un Nouveau Média</h1>
          <p className="mt-2 text-gray-600">Ajoutez du contenu webinaire, podcast, capsule vidéo, etc.</p>
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
              placeholder={t('admin_media.create_title_example')}
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
              placeholder={t('admin_media.create_description_placeholder')}
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
                  placeholder="https://..."
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

          {/* Duration & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée (secondes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('admin_media.duration_example')}
                min="0"
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
                <option value="">Sélectionner...</option>
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
              placeholder={t('admin_media.tags_example')}
            />
          </div>

          {/* Speakers (JSON) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Speakers (Format JSON)
            </label>
            <textarea
              value={formData.speakers}
              onChange={(e) => handleChange('speakers', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder='[{"name": "John Doe", "title": "CEO", "company": "Example Corp", "photo_url": "https://..."}]'
            />
            <p className="mt-1 text-xs text-gray-500">Format: Array JSON avec name, title, company, photo_url</p>
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

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Création...' : 'Créer le Média'}
            </button>
            <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="flex-1">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <X className="w-5 h-5" />
                Annuler
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMediaPage;
