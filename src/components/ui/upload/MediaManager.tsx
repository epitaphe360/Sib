import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../../../services/storage/storageService';
import { 
  FilePlus, 
  FileText, 
  FileImage, 
  File as FileIcon, 
  Download, 
  Loader2, 
  Search, 
  Trash2, 
  Upload,
  FolderPlus,
  GridIcon,
  List
} from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  type: 'image' | 'document' | 'other';
}

interface MediaManagerProps {
  bucket?: string;
  folder?: string;
  className?: string;
  onSelect?: (url: string) => void;
  maxSelections?: number;
  showUploadButton?: boolean;
  viewType?: 'list' | 'grid';
  allowDelete?: boolean;
  allowFolderCreation?: boolean;
  filters?: {
    images?: boolean;
    documents?: boolean;
    other?: boolean;
  };
}

const MediaManager: React.FC<MediaManagerProps> = ({
  bucket = 'media',
  folder = '',
  className = '',
  onSelect,
  maxSelections = 1,
  showUploadButton = true,
  viewType: initialViewType = 'grid',
  allowDelete = true,
  allowFolderCreation = false,
  filters = { images: true, documents: true, other: true }
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>(initialViewType);
  const [currentFolder, setCurrentFolder] = useState<string>(folder);
  const [activeFilters, setActiveFilters] = useState(filters);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: Les buckets sont créés via les migrations SQL
      
      // Charger les fichiers
      const fileList = await StorageService.listFiles(bucket, currentFolder);
      
      // Convertir en format MediaFile avec type de fichier
      const mediaFiles: MediaFile[] = fileList.map(file => {
        let type: 'image' | 'document' | 'other' = 'other';
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) {
          type = 'image';
        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension || '')) {
          type = 'document';
        }
        
        return {
          ...file,
          type
        };
      });
      
      setFiles(mediaFiles);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des fichiers:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  }, [bucket, currentFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const fileArray = Array.from(files);
      
      // Télécharger chaque fichier
      const uploadPromises = fileArray.map(file => 
        StorageService.uploadImage(file, bucket, currentFolder)
      );
      
      await Promise.all(uploadPromises);
      
      // Recharger la liste des fichiers
      await loadFiles();
    } catch (err: unknown) {
      console.error('Erreur lors du téléchargement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement des fichiers');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (file: MediaFile) => {
    if (!allowDelete) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${file.name}" ?`)) {
      try {
        await StorageService.deleteImage(file.url, bucket);
        await loadFiles();
      } catch (err: unknown) {
        console.error('Erreur lors de la suppression:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleFileSelect = (file: MediaFile) => {
    if (!onSelect) return;
    
    // Si le fichier est déjà sélectionné, le désélectionner
    if (selectedFiles.includes(file.url)) {
      setSelectedFiles(prev => prev.filter(url => url !== file.url));
    } 
    // Sinon, l'ajouter aux sélections (si possible)
    else {
      if (maxSelections === 1) {
        // Mode sélection unique
        setSelectedFiles([file.url]);
        onSelect(file.url);
      } else if (selectedFiles.length < maxSelections) {
        // Mode sélection multiple (dans la limite)
        const newSelection = [...selectedFiles, file.url];
        setSelectedFiles(newSelection);
        onSelect(newSelection.join(','));
      }
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Nom du dossier:');
    if (folderName && folderName.trim() !== '') {
      const newFolder = currentFolder 
        ? `${currentFolder}/${folderName.trim()}`
        : folderName.trim();
      
      setCurrentFolder(newFolder);
    }
  };

  const handleNavigateUp = () => {
    if (!currentFolder) return;
    
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: MediaFile) => {
    switch (file.type) {
      case 'image':
        return <FileImage className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  // Filtrer les fichiers en fonction de la recherche et des filtres actifs
  const filteredFiles = files.filter(file => {
    // Filtrer par type de fichier
    if (file.type === 'image' && !activeFilters.images) return false;
    if (file.type === 'document' && !activeFilters.documents) return false;
    if (file.type === 'other' && !activeFilters.other) return false;
    
    // Filtrer par recherche
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {/* Barre d'outils */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <button 
              type="button"
              onClick={handleNavigateUp}
              className="text-gray-600 hover:text-gray-900 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded"
            >
              &#8592; Retour
            </button>
          )}
          <div className="text-sm font-medium">
            {currentFolder ? `/${currentFolder}` : '/'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('ui.search')}
              className="pl-8 pr-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setViewType('grid')}
              className={`p-1.5 ${viewType === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewType('list')}
              className={`p-1.5 ${viewType === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          {showUploadButton && (
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <span>Télécharger</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          )}
          
          {allowFolderCreation && (
            <button
              type="button"
              onClick={handleCreateFolder}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Nouveau dossier</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveFilters(prev => ({ ...prev, images: !prev.images }))}
          className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${activeFilters.images ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          <FileImage className="h-3 w-3" />
          <span>Images</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilters(prev => ({ ...prev, documents: !prev.documents }))}
          className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${activeFilters.documents ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          <FileText className="h-3 w-3" />
          <span>Documents</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilters(prev => ({ ...prev, other: !prev.other }))}
          className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${activeFilters.other ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
        >
          <FileIcon className="h-3 w-3" />
          <span>Autres</span>
        </button>
      </div>
      
      {/* Contenu */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-gray-50 text-gray-500 p-8 rounded-md text-center">
          <FilePlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p>Aucun fichier trouvé dans ce dossier</p>
          <p className="text-sm mt-1">Téléchargez vos premiers fichiers ou changez les filtres</p>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map(file => (
            <div 
              key={file.url}
              className={`border rounded-md overflow-hidden hover:shadow-md transition-shadow relative group ${selectedFiles.includes(file.url) ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleFileSelect(file)}
            >
              {file.type === 'image' ? (
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-50">
                  {getFileIcon(file)}
                </div>
              )}
              
              <div className="p-2 text-xs truncate">{file.name}</div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <a 
                  href={file.url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-blue-500 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-blue-600"
                >
                  <Download className="h-3 w-3" />
                </a>
                
                {allowDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDelete(file);
                    }}
                    className="bg-red-500 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map(file => (
                <tr 
                  key={file.url}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedFiles.includes(file.url) ? 'bg-blue-50' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end gap-1">
                      <a 
                        href={file.url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-blue-500 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-blue-600"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                      
                      {allowDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDelete(file);
                          }}
                          className="bg-red-500 text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Téléchargement en cours */}
      {uploading && (
        <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-md text-sm flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Téléchargement en cours...</span>
        </div>
      )}
      
      {/* Compteur de sélection (si mode multi-sélection) */}
      {maxSelections > 1 && (
        <div className="mt-4 text-xs text-gray-500">
          {selectedFiles.length} sur {maxSelections} fichiers sélectionnés
        </div>
      )}
    </div>
  );
};

export default MediaManager;
