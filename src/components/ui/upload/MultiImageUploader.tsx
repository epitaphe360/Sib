import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storage/storageService';
import { X, Plus, AlertCircle, Loader2, FileImage, CheckCircle2 } from 'lucide-react';

interface MultiImageUploaderProps {
  initialImages?: string[];
  onImagesUploaded: (imageUrls: string[]) => void;
  bucket?: string;
  folder?: string;
  maxImages?: number;
  className?: string;
  maxSizeMB?: number;
  minImages?: number;
  showCounter?: boolean;
  layout?: 'grid' | 'carousel';
  disabled?: boolean;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  initialImages = [],
  onImagesUploaded,
  bucket = 'images',
  folder = '',
  maxImages = 10,
  className = '',
  maxSizeMB = 5,
  minImages = 0,
  showCounter = true,
  layout = 'grid',
  disabled = false
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Mettre à jour l'état lorsque initialImages change
  useEffect(() => {
    if (JSON.stringify(initialImages) !== JSON.stringify(images)) {
      setImages(initialImages);
    }
  }, [initialImages, images]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {return;}

    const files = e.target.files;
    if (!files || files.length === 0) {return;}

    // Vérifier si on dépasse le nombre max d'images
    if (images.length + files.length > maxImages) {
      setError(`Vous pouvez télécharger au maximum ${maxImages} images`);
      return;
    }

    const fileArray = Array.from(files);

    // Vérification de la taille et du type
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const invalidFiles = fileArray.filter(file => {
      return file.size > maxSizeBytes || !file.type.startsWith('image/');
    });

    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} fichier(s) ne respectent pas les contraintes (taille max: ${maxSizeMB}MB, type: image)`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Note: Les buckets sont créés via les migrations SQL

      // Upload des images avec simulation de progression
      const totalFiles = fileArray.length;
      let completedFiles = 0;

      const updateProgress = () => {
        completedFiles++;
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
      };

      const uploadPromises = fileArray.map(async (file) => {
        const url = await StorageService.uploadImage(file, bucket, folder);
        updateProgress();
        return url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newImageUrls];

      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      setSuccess(true);

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      console.error('Erreur upload multiple:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement des images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async (index: number) => {
    if (disabled) {return;}

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      try {
        const imageToRemove = images[index];

        // Supprimer du stockage
        if (imageToRemove.includes(bucket)) {
          await StorageService.deleteImage(imageToRemove, bucket);
        }

        // Mettre à jour l'état
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesUploaded(updatedImages);

        if (updatedImages.length < minImages) {
          setError(`Vous devez avoir au moins ${minImages} image${minImages > 1 ? 's' : ''}`);
        } else {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
    }
  };

  // Ajout de la fonctionnalité drag and drop pour réorganiser les images
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) {return;}

    const newImages = [...images];
    const draggedImage = newImages[dragIndex];

    // Retirer l'image de sa position d'origine
    newImages.splice(dragIndex, 1);

    // Insérer l'image à sa nouvelle position
    newImages.splice(dropIndex, 0, draggedImage);

    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className={`${className}`}>
      {layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((img, index) => (
            <div
              key={`img-${img.slice(-30)}-${index}`}
              className="relative group aspect-square border rounded-lg overflow-hidden"
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 min-w-[36px] min-h-[36px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 text-xs">
                {index + 1}
              </div>
            </div>
          ))}

          {images.length < maxImages && !disabled && (
            <label className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors aspect-square">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading || disabled}
              />
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <span className="text-sm text-gray-500 block">
                      {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500 block">
                      Ajouter des images
                    </span>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 mb-4">
          {images.map((img, index) => (
            <div
              key={`img-${img.slice(-30)}-${index}`}
              className="relative group flex-shrink-0 w-40 h-40 border rounded-lg overflow-hidden"
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 min-w-[36px] min-h-[36px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 text-xs">
                {index + 1}
              </div>
            </div>
          ))}

          {images.length < maxImages && !disabled && (
            <label className="flex-shrink-0 w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading || disabled}
              />
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <span className="text-sm text-gray-500 block">
                      {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500 block">
                      Ajouter
                    </span>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 flex items-center mt-2">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="text-sm text-green-500 flex items-center mt-2">
          <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>Images mises à jour avec succès</span>
        </div>
      )}

      {showCounter && (
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <FileImage className="h-3 w-3 mr-1" />
          <span>
            {images.length} / {maxImages} images {minImages > 0 ? `(minimum: ${minImages})` : ''}
            {maxSizeMB && ` - max ${maxSizeMB}MB par image`}
          </span>
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;
