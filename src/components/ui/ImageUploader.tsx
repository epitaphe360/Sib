import React, { useState, useRef, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { X, Check, AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
  folderName?: string;
  className?: string;
  label?: string;
  maxSizeMB?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl = '',
  bucketName = 'images',
  folderName = '',
  className = '',
  label,
  maxSizeMB = 5
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour l'aperçu si l'URL de l'image actuelle change
  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError(t('upload.must_be_image'));
      return;
    }

    // Vérifier la taille du fichier
    const maxSize = maxSizeMB * 1024 * 1024; // en octets
    if (file.size > maxSize) {
      setError(`${t('upload.max_size')}: ${maxSizeMB}MB.`);
      return;
    }

    // Créer un aperçu de l'image
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Réinitialiser les états
    setError(null);
    setSuccess(false);
    setIsUploading(true);
    setUploadProgress(0);

    // Simuler un progrès de téléchargement
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10);
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 200);

    try {
      // Note: Les buckets (partner-logos, exhibitor-logos) sont créés via les migrations SQL
      // Pas besoin de les créer dynamiquement via l'API client (causerait une erreur RLS)

      // DEBUG: Vérifier le fichier avant upload
      console.log('🎯 [IMAGE UPLOADER] Avant upload:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket: bucketName,
        folder: folderName
      });

      // Télécharger l'image
      const imageUrl = await StorageService.uploadImage(file, bucketName, folderName);
      
      console.log('✅ [IMAGE UPLOADER] Upload réussi:', imageUrl);
      
      // Mise à jour réussie
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      onImageUploaded(imageUrl);

      // Réinitialiser après quelques secondes
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error('❌ [IMAGE UPLOADER] Erreur:', err);
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
      console.error('Erreur de téléchargement:', err);
    }

    // Nettoyer l'URL de l'objet pour éviter les fuites de mémoire
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('');
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer
          transition-colors duration-200 
          ${previewUrl ? 'border-gray-300 bg-gray-50' : 'border-blue-300 hover:bg-blue-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${success ? 'border-green-300 bg-green-50' : ''}
          min-h-[200px] relative
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {previewUrl ? (
          // Aperçu de l'image
          <div className="relative w-full h-full flex justify-center">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="max-h-[180px] max-w-full object-contain rounded"
            />
            <button aria-label="Close"
              onClick={handleClearImage}
              className="absolute top-0 right-0 bg-red-500 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-red-600 transition-colors"
              title={t('minisite.delete_image')}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          // Zone de glisser-déposer
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner une image</p>
            <p className="text-xs text-gray-400">ou glissez-déposez un fichier image</p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF jusqu'à {maxSizeMB}MB</p>
          </div>
        )}

        {/* Affichage du chargement */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            <div className="mt-2 w-48 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">Téléchargement: {uploadProgress}%</p>
          </div>
        )}

        {/* Message de succès */}
        {success && !isUploading && (
          <div className="mt-2 flex items-center text-green-600">
            <Check size={16} className="mr-1" />
            <span className="text-sm">Image téléchargée avec succès</span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mt-2 flex items-center text-red-600">
            <AlertCircle size={16} className="mr-1" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
