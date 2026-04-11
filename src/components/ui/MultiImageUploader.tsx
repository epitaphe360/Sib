import React, { useState, useRef } from 'react';
import { StorageService } from '../../services/storageService';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface MultiImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  bucketName?: string;
  folderName?: string;
  className?: string;
  label?: string;
  maxSizeMB?: number;
  maxImages?: number;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  onImagesUploaded,
  currentImages = [],
  bucketName = 'images',
  folderName = '',
  className = '',
  label,
  maxSizeMB = 5,
  maxImages = 10
}) => {
  const { t } = useTranslation();
  const [images, setImages] = useState<string[]>(currentImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier le nombre maximum d'images
    if (images.length + files.length > maxImages) {
      setError(t('upload.max_images_error', { max: maxImages }));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Note: Les buckets sont créés via les migrations SQL

      const uploadPromises: Promise<string>[] = [];
      
      // Vérifier chaque fichier avant de le télécharger
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          throw new Error(t('upload.file_not_image', { name: file.name }));
        }
        
        // Vérifier la taille du fichier
        const maxSize = maxSizeMB * 1024 * 1024; // en octets
        if (file.size > maxSize) {
          throw new Error(t('upload.image_too_large', { name: file.name, max: maxSizeMB }));
        }
        
        uploadPromises.push(StorageService.uploadImage(file, bucketName, folderName));
      }
      
      // Télécharger toutes les images en parallèle
      const newImageUrls = await Promise.all(uploadPromises);
      
      // Ajouter les nouvelles images à la liste existante
      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('upload.upload_error'));
      console.error('Erreur de téléchargement:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      <div className="border-2 border-gray-300 rounded-lg p-4">
        {/* Grille d'images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((imageUrl, index) => (
            <div key={`img-${imageUrl.slice(-30)}-${index}`} className="relative group aspect-square">
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                title={t('minisite.delete_image')}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          {/* Bouton d'ajout */}
          {images.length < maxImages && (
            <div
              onClick={handleAddClick}
              className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center 
                         bg-gray-50 hover:bg-gray-100 cursor-pointer aspect-square transition-colors"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>
          )}
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mt-2 flex items-center text-red-600">
            <AlertCircle size={16} className="mr-1" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Info sur le nombre d'images */}
        <div className="text-xs text-gray-500 mt-2">
          {t('upload.images_count', { current: images.length, max: maxImages, size: maxSizeMB })}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MultiImageUploader;
