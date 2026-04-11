import React, { useState, useRef, useEffect } from 'react';
import { StorageService } from '../../../services/storage/storageService';
import { X, Check, AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
  maxSizeMB?: number;
  acceptedTypes?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'free';
  showPreview?: boolean;
  disableDelete?: boolean;
  hideControls?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImageUrl,
  onImageUploaded,
  bucket = 'images',
  folder = '',
  className = '',
  maxSizeMB = 5,
  acceptedTypes = 'image/*',
  aspectRatio = 'free',
  showPreview = true,
  disableDelete = false,
  hideControls = false
}) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour l'état lorsque la prop initialImageUrl change
  useEffect(() => {
    if (initialImageUrl !== undefined && initialImageUrl !== imageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl, imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Vérification de la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`La taille du fichier dépasse la limite de ${maxSizeMB}MB`);
      return;
    }
    
    // Vérification du type
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Upload de l'image
      const url = await StorageService.uploadImage(file, bucket, folder);
      
      // Si un fichier précédent existait, le supprimer
      if (imageUrl && imageUrl.includes(bucket) && imageUrl !== initialImageUrl) {
        try {
          await StorageService.deleteImage(imageUrl, bucket);
        } catch (err) {
          console.warn('Impossible de supprimer l\'ancienne image', err);
        }
      }
      
      setImageUrl(url);
      onImageUploaded(url);
      setSuccess(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: unknown) {
      console.error('Erreur upload:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = async () => {
    if (disableDelete) return;
    
    if (imageUrl && window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      setIsUploading(true);
      try {
        if (imageUrl.includes(bucket)) {
          await StorageService.deleteImage(imageUrl, bucket);
        }
        setImageUrl('');
        onImageUploaded('');
        setSuccess(true);
        
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Déterminer les classes CSS pour le ratio d'aspect
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'landscape': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      default: return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept={acceptedTypes}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {imageUrl && showPreview ? (
        <div className={`relative group ${getAspectRatioClass()}`}>
          <img
            src={imageUrl}
            alt="Image téléchargée"
            className={`w-full h-full rounded-lg object-cover ${getAspectRatioClass()}`}
          />
          {!hideControls && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </button>
                {!disableDelete && (
                  <button aria-label="Close"
                    type="button"
                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${getAspectRatioClass()}`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Cliquez ou glissez une image ici</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à {maxSizeMB}MB</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <span className="text-sm text-gray-600">Téléchargement en cours...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-2 text-sm text-green-500 flex items-center">
          <Check className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{imageUrl ? 'Image téléchargée avec succès' : 'Image supprimée avec succès'}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
