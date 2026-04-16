import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import {
  Info,
  File,
  Link as LinkIcon
} from 'lucide-react';
import ImageUploader from '../ui/ImageUploader';

interface MiniSiteHeroEditorProps {
  exhibitorId: string;
  initialData: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  }) => void;
}

export default function MiniSiteHeroEditor({
  exhibitorId,
  initialData,
  onDataChange
}: MiniSiteHeroEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    ctaText: '',
    ctaLink: ''
  });

  // Synchroniser les données avec les props
  useEffect(() => {
    setFormData(initialData || {
      title: '',
      subtitle: '',
      description: '',
      backgroundImage: '',
      ctaText: '',
      ctaLink: ''
    });
  }, [initialData]);

  // Mettre à jour le parent lorsque les données changent
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBackgroundImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, backgroundImage: url }));
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Section d'en-tête (Hero)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Formulaire */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre principal
            </label>
            <input type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Solutions innovantes pour les bâtiments"
             aria-label="ex: Solutions innovantes pour les bâtiments" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-titre
            </label>
            <input type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Leader dans l'optimisation des opérations BTP"
             aria-label="ex: Leader dans l" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez brièvement votre entreprise et ses activités..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte du bouton d'action
              </label>
              <div className="flex items-center">
                <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                  <File className="h-5 w-5 text-gray-500" />
                </div>
                <input type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Découvrir nos solutions"
                 aria-label="ex: Découvrir nos solutions" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien du bouton
              </label>
              <div className="flex items-center">
                <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                  <LinkIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input type="text"
                  name="ctaLink"
                  value={formData.ctaLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('minisite.hero.cta_placeholder')}
                 aria-label={t('minisite.hero.cta_placeholder')} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <ImageUploader
              onImageUploaded={handleBackgroundImageUploaded}
              currentImageUrl={formData.backgroundImage}
              bucketName="minisites"
              folderName={`hero/${exhibitorId}`}
              label="Image d'arrière-plan"
              maxSizeMB={5}
            />

            <p className="text-sm text-gray-500 mt-2 flex items-start">
              <Info className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>
                Utilisez une image de haute qualité avec un format paysage (16:9 ou 21:9).
                Taille recommandée : 1920x1080px.
              </span>
            </p>
          </div>
        </div>

        {/* Colonne droite - Aperçu */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Aperçu
          </h3>

          <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
            {/* Arrière-plan */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: formData.backgroundImage
                  ? `url(${formData.backgroundImage})`
                  : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
              }}
            >
              {/* Overlay sombre pour la lisibilité */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Contenu */}
            <div className="relative h-full p-6 flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-white mb-2">
                {formData.title || 'Titre principal'}
              </h1>

              <h2 className="text-lg text-white opacity-90 mb-4">
                {formData.subtitle || 'Sous-titre'}
              </h2>

              <p className="text-sm text-white opacity-80 mb-6 line-clamp-2">
                {formData.description || 'Description de votre entreprise et de ses activités...'}
              </p>

              <div>
                <span className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm">
                  {formData.ctaText || 'Bouton d\'action'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Conseils pour une section d'en-tête efficace
            </h3>

            <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>Utilisez un titre court et percutant qui reflète votre activité principale</li>
              <li>Le sous-titre doit compléter le titre et apporter une précision</li>
              <li>{t('minisite.hero.tips.image')}</li>
              <li>Préférez une image professionnelle de haute qualité</li>
              <li>{t('minisite.hero.tips.cta')}</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}


