import React, { useState, useEffect } from 'react';
import { X, Upload, Search, Trash2, Grid3x3, List } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ImageLibraryProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

interface Image {
  id: string;
  url: string;
  name: string;
  size: number;
  createdAt: string;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ onSelect, onClose }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_images')
        .select('id, url, name, size, createdAt:created_at')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) {throw error;}
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {return;}

    setUploading(true);
    const uploadedImages: Image[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 5MB`);
          continue;
        }

        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(fileName, file);

        if (uploadError) {throw uploadError;}

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('site-images')
          .getPublicUrl(fileName);

        // Save metadata to database
        const { data: imageData, error: dbError } = await supabase
          .from('site_images')
          .insert([{
            url: urlData.publicUrl,
            name: file.name,
            size: file.size,
            storage_path: fileName
          }])
          .select()
          .single();

        if (dbError) {throw dbError;}
        uploadedImages.push(imageData);
      }

      setImages([...uploadedImages, ...images]);
      toast.success(`${uploadedImages.length} image(s) ajoutée(s)`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: Image) => {
    if (!confirm('Supprimer cette image ?')) {return;}

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('site-images')
        .remove([image.storage_path]);

      if (storageError) {throw storageError;}

      // Delete from database
      const { error: dbError } = await supabase
        .from('site_images')
        .delete()
        .eq('id', image.id);

      if (dbError) {throw dbError;}

      setImages(images.filter(img => img.id !== image.id));
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {return bytes + ' B';}
    if (bytes < 1024 * 1024) {return (bytes / 1024).toFixed(1) + ' KB';}
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Bibliothèque d'images</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('siteBuilder.search_image')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Upload...' : 'Upload'}
            </Button>
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Upload className="w-16 h-16 mb-4 opacity-20" />
              <p>Aucune image. Uploadez-en une !</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image.id)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(image.url);
                        }}
                      >
                        Sélectionner
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs truncate">{image.name}</p>
                    <p className="text-gray-300 text-xs">{formatSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map(image => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image.id)}
                  className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer ${
                    selectedImage === image.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{image.name}</p>
                    <p className="text-sm text-gray-500">{formatSize(image.size)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(image.url);
                      }}
                    >
                      Sélectionner
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
