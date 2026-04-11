import React, { useState } from 'react';
import { ImageUploader } from '../../ui/upload';

interface ExhibitorProfileImageFormProps {
  initialLogoUrl?: string;
  exhibitorId: string;
  onSave: (logoUrl: string) => Promise<void>;
  onCancel?: () => void;
}

const ExhibitorProfileImageForm: React.FC<ExhibitorProfileImageFormProps> = ({
  initialLogoUrl,
  exhibitorId,
  onSave,
  onCancel
}) => {
  const [logoUrl, setLogoUrl] = useState<string>(initialLogoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!logoUrl) {
      setError('Veuillez télécharger un logo pour votre entreprise');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(logoUrl);
    } catch (err: unknown) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du logo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Logo de l'entreprise</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-4">
          Téléchargez le logo de votre entreprise. Il sera affiché sur votre profil,
          dans les résultats de recherche et sur votre mini-site.
        </p>
        
        <ImageUploader
          initialImageUrl={initialLogoUrl}
          onImageUploaded={setLogoUrl}
          bucket="exhibitor-logos"
          folder={exhibitorId}
          aspectRatio="square"
          maxSizeMB={2}
          className="w-full max-w-xs mx-auto"
        />
        
        <div className="mt-4 text-sm text-gray-500">
          Format recommandé : PNG ou JPG, carré, minimum 500x500 pixels
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            Annuler
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isSaving}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default ExhibitorProfileImageForm;
