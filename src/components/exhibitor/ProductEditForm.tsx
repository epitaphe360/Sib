import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  ArrowLeft,
  Tag,
  DollarSign,
  Info
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { Product } from '../../types';
import MultiImageUploader from '../ui/MultiImageUploader';

// Zod validation schema
const productEditSchema = z.object({
  name: z.string()
    .min(2, 'Le nom du produit doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne doit pas dépasser 200 caractères'),
  description: z.string()
    .max(1000, 'La description ne doit pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  category: z.string()
    .min(1, 'La catégorie est requise')
    .max(100, 'La catégorie ne doit pas dépasser 100 caractères'),
  price: z.number()
    .min(0, 'Le prix doit être positif')
    .optional(),
  specifications: z.string()
    .max(1000, 'Les spécifications ne doivent pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  featured: z.boolean().optional()
});

type ProductFormData = z.infer<typeof productEditSchema>;

interface ProductEditFormProps {
  productId?: string;
  exhibitorId: string;
  product?: Product;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductEditForm({
  productId,
  exhibitorId,
  product,
  onSave,
  onCancel
}: ProductEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProductFormData>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      specifications: '',
      price: undefined,
      featured: false
    }
  });

  // Watch form values for preview
  const formValues = watch();

  // Remplir le formulaire avec les données du produit existant
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        specifications: product.specifications || '',
        price: product.price || undefined,
        featured: product.featured || false
      });
      setImages(product.images || []);
    }
  }, [product, reset]);

  const handleImagesUploaded = (urls: string[]) => {
    setImages(urls);
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);

    try {
      // Préparer les données pour l'envoi
      const productData = {
        exhibitorId,
        name: data.name,
        description: data.description || '',
        category: data.category,
        images: images,
        specifications: data.specifications || '',
        price: data.price,
        featured: data.featured || false
      };

      if (productId) {
        // Mise à jour d'un produit existant
        await SupabaseService.updateProduct(productId, productData);
        toast.success('Produit mis à jour avec succès !');
      } else {
        // Création d'un nouveau produit
        await SupabaseService.createProduct(productData);
        toast.success('Produit créé avec succès !');
      }

      onSave();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {productId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleFormSubmit(handleSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>
      
      <form className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations du produit
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Nom du produit"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Description du produit"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <input
                      type="text"
                      {...register('category')}
                      className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="ex: Logiciels, Équipements..."
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (€)
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="ex: 1999.99"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécifications techniques
                  </label>
                  <textarea
                    {...register('specifications')}
                    rows={3}
                    className={`w-full px-3 py-2 border ${errors.specifications ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Dimensions, matériaux, caractéristiques techniques..."
                  />
                  {errors.specifications && (
                    <p className="text-red-500 text-sm mt-1">{errors.specifications.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register('featured')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Produit vedette (mis en avant sur la page d'accueil)
                  </label>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Colonne droite - Images */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Images du produit
              </h3>
              
              <MultiImageUploader
                onImagesUploaded={handleImagesUploaded}
                currentImages={images}
                bucketName="products"
                folderName={exhibitorId}
                label="Images du produit"
                maxSizeMB={5}
                maxImages={8}
              />
              
              <div className="mt-4 flex items-start space-x-2 text-sm text-gray-500">
                <Info className="h-4 w-4 mt-0.5" />
                <p>Les images seront affichées dans l'ordre de téléchargement. La première image sera l'image principale du produit.</p>
              </div>
            </Card>
            
            {/* Aperçu du produit */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Aperçu
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {images?.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={formValues.name || 'Produit'}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/SIB-logo.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Tag className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {formValues.category || 'Catégorie'}
                    </span>
                    {formValues.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Vedette
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {formValues.name || 'Nom du produit'}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {formValues.description || 'Description du produit...'}
                  </p>

                  {formValues.price && (
                    <p className="text-lg font-bold text-blue-600">
                      {formValues.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
