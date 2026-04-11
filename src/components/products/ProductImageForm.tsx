import React, { useState, useEffect } from 'react';
import { MultiImageUploader } from '../ui/upload';
import { useTranslation } from '../../hooks/useTranslation';

interface ProductImageFormProps {
  productId: string;
  exhibitorId: string;
  initialImages?: string[];
  onSave: (images: string[]) => Promise<void>;
  onCancel?: () => void;
  maxImages?: number;
}

const ProductImageForm: React.FC<ProductImageFormProps> = ({
  productId,
  exhibitorId,
  initialImages = [],
  onSave,
  onCancel,
  maxImages = 8
}) => {
  const { t } = useTranslation();
  const [images, setImages] = useState<string[]>(initialImages);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleSave = async () => {
    if (images.length === 0) {
      setError(t('products.min_one_image'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(images);
    } catch (err: unknown) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : t('products.error_saving_images'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{t('products.product_images')}</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-4">
          {t('products.upload_images_desc')}
        </p>
        
        <MultiImageUploader
          initialImages={images}
          onImagesUploaded={setImages}
          bucket="products"
          folder={`${exhibitorId}/${productId}`}
          maxImages={maxImages}
          minImages={1}
          maxSizeMB={3}
          layout="grid"
        />
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
            {t('common.cancel')}
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isSaving}
        >
          {isSaving ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default ProductImageForm;
