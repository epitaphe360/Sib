import React, { useState } from 'react';
import { X, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SEOConfig } from '../../types/site-builder';

interface SEOEditorProps {
  config: SEOConfig;
  onSave: (config: SEOConfig) => void;
  onClose: () => void;
}

export const SEOEditor: React.FC<SEOEditorProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<SEOConfig>(config);
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setLocalConfig({
        ...localConfig,
        keywords: [...localConfig.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setLocalConfig({
      ...localConfig,
      keywords: localConfig.keywords.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    onSave(localConfig);
  };

  const previewTitle = localConfig.title || 'Titre de la page';
  const previewDescription = localConfig.description || 'Description de la page qui apparaîtra dans les résultats de recherche...';
  const previewUrl = localConfig.slug ? `SIB.com/${localConfig.slug}` : 'SIB.com/votre-page';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold">Configuration SEO</h2>
            <p className="text-sm text-gray-500">Optimisez votre visibilité dans les moteurs de recherche</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic SEO */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Titre de la page <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localConfig.title}
                  onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                  placeholder="ex: Votre Entreprise - Solutions Innovantes"
                  maxLength={60}
                  className="w-full border rounded-lg px-4 py-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Recommandé: 50-60 caractères</span>
                  <span className={localConfig.title.length > 60 ? 'text-red-500' : ''}>
                    {localConfig.title.length}/60
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={localConfig.description}
                  onChange={(e) => setLocalConfig({ ...localConfig, description: e.target.value })}
                  placeholder="Description concise et attractive de votre page..."
                  rows={3}
                  maxLength={160}
                  className="w-full border rounded-lg px-4 py-2 resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Recommandé: 150-160 caractères</span>
                  <span className={localConfig.description.length > 160 ? 'text-red-500' : ''}>
                    {localConfig.description.length}/160
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL (slug)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">SIB.com/</span>
                  <input
                    type="text"
                    value={localConfig.slug}
                    onChange={(e) => setLocalConfig({ ...localConfig, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="votre-page"
                    className="flex-1 border rounded-lg px-4 py-2"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez des tirets pour séparer les mots
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mots-clés</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="Ajouter un mot-clé..."
                  className="flex-1 border rounded-lg px-4 py-2"
                />
                <Button onClick={handleAddKeyword}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localConfig.keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(index)}
                      className="hover:bg-blue-200 rounded-full p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Open Graph */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Open Graph (Réseaux sociaux)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image de partage
                </label>
                <input
                  type="text"
                  value={localConfig.ogImage}
                  onChange={(e) => setLocalConfig({ ...localConfig, ogImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommandé: 1200x630px, format JPG ou PNG
                </p>
                {localConfig.ogImage && (
                  <div className="mt-3 border rounded-lg p-2">
                    <img
                      src={localConfig.ogImage}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Analytics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Google Analytics</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                ID de suivi
              </label>
              <input
                type="text"
                value={localConfig.googleAnalyticsId}
                onChange={(e) => setLocalConfig({ ...localConfig, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX ou UA-XXXXXXXXX-X"
                className="w-full border rounded-lg px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvez votre ID dans votre compte Google Analytics
              </p>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Aperçu Google</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">{previewUrl}</div>
                <div className="text-xl text-blue-600 hover:underline cursor-pointer">
                  {previewTitle}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {previewDescription}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils SEO</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Utilisez des mots-clés pertinents dans le titre et la description</li>
              <li>• Le titre doit être unique et accrocheur</li>
              <li>• La description doit inciter au clic</li>
              <li>• Choisissez 5-10 mots-clés principaux</li>
              <li>• Utilisez une image de haute qualité pour le partage social</li>
              <li>• Testez votre site avec Google Search Console</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};
