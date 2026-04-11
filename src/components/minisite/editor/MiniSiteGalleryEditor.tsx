import React, { useState, useEffect } from 'react';
import { MultiImageUploader } from '../../ui/upload';

interface MiniSiteGalleryEditorProps {
  exhibitorId: string;
  initialImages?: string[];
  onSave: (images: string[]) => Promise<void>;
  maxImages?: number;
}

const MiniSiteGalleryEditor: React.FC<MiniSiteGalleryEditorProps> = ({
  exhibitorId,
  initialImages = [],
  onSave,
  maxImages = 12
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave(images);
      setSuccess(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde de la galerie');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Galerie d'images</h2>
        
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enregistrement...</span>
            </>
          ) : (
            <span>Enregistrer la galerie</span>
          )}
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-4">
          Téléchargez des photos de vos produits, installations, équipe ou événements.
          Les images seront affichées dans la galerie de votre mini-site.
        </p>
        
        <MultiImageUploader
          initialImages={images}
          onImagesUploaded={setImages}
          bucket="minisite-galleries"
          folder={exhibitorId}
          maxImages={maxImages}
          maxSizeMB={5}
          layout="grid"
        />
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">
          Galerie enregistrée avec succès
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-4">
        <p>
          <strong>Conseils pour une galerie attrayante :</strong>
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Utilisez des images de haute qualité, bien éclairées</li>
          <li>Préférez des photos en paysage ou carrées</li>
          <li>Assurez-vous que les images représentent bien vos produits/services</li>
          <li>Variez les types de contenu pour montrer différents aspects de votre entreprise</li>
          <li>Arrangez les images par glisser-déposer pour optimiser l'ordre d'affichage</li>
        </ul>
      </div>
    </div>
  );
};

export default MiniSiteGalleryEditor;
