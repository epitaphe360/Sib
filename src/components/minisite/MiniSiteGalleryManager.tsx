import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Upload, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Info,
  RefreshCw
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { toast } from 'sonner';

interface MiniSiteGalleryManagerProps {
  exhibitorId: string;
  initialImages: string[];
  onImagesChange: (images: string[]) => void;
}

export default function MiniSiteGalleryManager({ 
  exhibitorId, 
  initialImages, 
  onImagesChange 
}: MiniSiteGalleryManagerProps) {
  const [images, setImages] = useState<string[]>(initialImages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Synchroniser les images avec les props
  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  // Mettre à jour le parent lorsque les images changent
  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setProgress(0);

    try {
      // Note: Les buckets sont créés via les migrations SQL

      const uploadPromises: Promise<string>[] = [];
      
      // Préparer les téléchargements
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast.error(`Le fichier "${file.name}" n'est pas une image.`);
          continue;
        }
        
        // Vérifier la taille du fichier (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`L'image "${file.name}" est trop volumineuse. Taille maximale: 5MB.`);
          continue;
        }
        
        uploadPromises.push(StorageService.uploadImage(
          file, 
          'minisites', 
          `gallery/${exhibitorId}`
        ));
      }

      setProgress(30);
      
      // Télécharger toutes les images
      const newImageUrls = await Promise.all(uploadPromises);
      setProgress(90);
      
      // Ajouter les nouvelles images à la liste existante
      setImages(prev => [...prev, ...newImageUrls]);

      setProgress(100);
      
      toast.success(`${newImageUrls.length} image(s) téléchargée(s) avec succès.`);
      
      // Réinitialiser
      setTimeout(() => {
        setProgress(0);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement des images.');
      setIsLoading(false);
      setProgress(0);
    }
    
    // Réinitialiser l'input file
    e.target.value = '';
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
    
    toast.success('Image supprimée.');
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === images.length - 1)) {
      return;
    }
    
    setImages(prev => {
      const newImages = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Échanger les images
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      
      return newImages;
    });
    
    // Mettre à jour l'index sélectionné si nécessaire
    if (selectedImageIndex === index) {
      setSelectedImageIndex(direction === 'up' ? index - 1 : index + 1);
    } else if (selectedImageIndex === (direction === 'up' ? index - 1 : index + 1)) {
      setSelectedImageIndex(index);
    }
  };

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(selectedImageIndex === index ? null : index);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('minisite.section.gallery_title')}
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {t('minisite.section.gallery_desc')}
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('gallery-file-input')?.click()}
          disabled={isLoading}
          className="w-full py-8 border-dashed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Téléchargement en cours...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Télécharger des images
            </>
          )}
        </Button>
        <input
          type="file"
          id="gallery-file-input"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {/* Barre de progression */}
        {isLoading && (
          <div className="w-full mt-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-600 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {progress}% terminé
            </p>
          </div>
        )}
      </div>
      
      {images.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={`gallery-${imageUrl.slice(-30)}-${index}`}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer
                  ${selectedImageIndex === index ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => handleSelectImage(index)}
              >
                <img
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/siports-logo.jpg';
                  }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {selectedImageIndex !== null && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMoveImage(selectedImageIndex, 'up')}
                  disabled={selectedImageIndex === 0}
                  title="Déplacer vers le haut"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleMoveImage(selectedImageIndex, 'down')}
                  disabled={selectedImageIndex === images.length - 1}
                  title="Déplacer vers le bas"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Image {selectedImageIndex + 1} sur {images.length}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteImage(selectedImageIndex)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title={t('minisite.delete_image')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-start space-x-2 text-sm text-gray-500">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Cliquez sur une image pour la sélectionner, puis utilisez les boutons pour la déplacer ou la supprimer.
              {t('minisite.section.gallery_order')}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {t('minisite.section.gallery_empty')}
          </p>
        </div>
      )}
    </Card>
  );
}
