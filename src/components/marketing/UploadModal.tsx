import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import type { UploadableMediaType, UploadFormData } from './types';

interface UploadModalProps {
  initialType?: UploadableMediaType;
  onUpload: (type: UploadableMediaType, data: UploadFormData) => Promise<boolean>;
  onClose: () => void;
}

/**
 * Modal permettant d'ajouter un nouveau média (webinaire, podcast, capsule, etc.).
 * Gère son propre état de formulaire.
 */
export default function UploadModal({ initialType = 'webinar', onUpload, onClose }: UploadModalProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<UploadableMediaType>(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    url: '',
    category: 'Technologie',
  });

  const typeOptions: { value: UploadableMediaType; label: string; icon: typeof Video }[] = [
    { value: 'webinar', label: t('marketing.filters.webinars'), icon: Video },
    { value: 'capsule_inside', label: t('marketing.filters.capsules'), icon: Video },
    { value: 'podcast', label: t('marketing.filters.podcasts'), icon: Mic },
    { value: 'live_studio', label: t('marketing.filters.live_studio'), icon: Video },
    { value: 'best_moments', label: t('marketing.filters.best_moments'), icon: Video },
    { value: 'testimonial', label: t('marketing.filters.testimonial'), icon: Video },
  ];

  const categories = [
    'Technologie', 'Business', 'Leadership', 'Innovation',
    'Environnement', 'Réglementation', 'Témoignage', 'Formation',
    'Événement', 'Société', 'Finance',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast.error('Titre et URL requis');
      return;
    }
    setSubmitting(true);
    const ok = await onUpload(selectedType, formData);
    setSubmitting(false);
    if (ok) onClose();
  };

  const update = (field: keyof UploadFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">{t('marketing.media.add_media')}</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('marketing.media.type')}
              </label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={selectedType === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(opt.value)}
                  >
                    <opt.icon className="h-4 w-4 mr-1" />
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('marketing.media.title')} *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('marketing.media.description')}
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('marketing.media.video_url')} *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.url}
                onChange={(e) => update('url', e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('marketing.articles.category')}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                <Upload className="h-4 w-4 mr-2" />
                {submitting ? t('actions.loading') : t('actions.add')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('actions.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
