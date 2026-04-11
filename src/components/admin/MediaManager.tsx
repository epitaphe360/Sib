import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Trash2,
  RefreshCw,
  Database,
  FileUp,
  HardDrive,
  Image as ImageIcon,
  File,
  User,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { StorageService } from '../../services/storageService';
import { supabase } from '../../lib/supabase';

interface BucketInfo {
  id: string;
  name: string;
  public: boolean;
  created_at: string;
  owner: string;
  size: number;
  file_count: number;
}

interface FileInfo {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export default function MediaManager() {
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [isPublicBucket, setIsPublicBucket] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Charger la liste des buckets au chargement de la page
  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  // Charger les fichiers lorsqu'un bucket est sélectionné
  useEffect(() => {
    if (selectedBucket) {
      fetchFiles(selectedBucket);
    } else {
      setFiles([]);
    }
  }, [selectedBucket]);

  const fetchBuckets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase!.storage.listBuckets();
      if (error) throw error;

      // Enrichir avec des informations supplémentaires
      const enrichedBuckets = await Promise.all(
        (data || []).map(async bucket => {
          try {
            const { data: fileList } = await supabase!.storage.from(bucket.name).list();
            const fileCount = fileList?.length || 0;
            const totalSize = 0;

            // Pour simplifier, nous ne calculons pas la taille réelle de tous les fichiers
            // car cela nécessiterait de nombreuses requêtes pour les gros buckets
            
            return {
              ...bucket,
              file_count: fileCount,
              size: totalSize // Approximatif
            };
          } catch {
            return { ...bucket, file_count: 0, size: 0 };
          }
        })
      );

      setBuckets(enrichedBuckets);
      
      // Si aucun bucket n'est sélectionné et qu'il y a des buckets, sélectionner le premier
      if (!selectedBucket && enrichedBuckets.length > 0) {
        setSelectedBucket(enrichedBuckets[0].name);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des buckets:', error);
      toast.error('Erreur lors du chargement des buckets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBucket]);

  const fetchFiles = async (bucketName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase!.storage.from(bucketName).list();
      if (error) throw error;

      // Enrichir les fichiers avec des métadonnées (si disponibles)
      const enrichedFiles = await Promise.all(
        (data || []).filter(item => !item.id.endsWith('/')).map(async file => {
          try {
            const { data: publicUrl } = supabase!.storage.from(bucketName).getPublicUrl(file.name);
            return {
              ...file,
              publicUrl: publicUrl.publicUrl,
              metadata: {
                size: 0, // Nous ne pouvons pas facilement obtenir la taille via l'API
                mimetype: file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') ? 'image/jpeg' :
                          file.name.endsWith('.png') ? 'image/png' :
                          file.name.endsWith('.gif') ? 'image/gif' :
                          file.name.endsWith('.pdf') ? 'application/pdf' :
                          'application/octet-stream'
              }
            };
          } catch {
            return {
              ...file,
              publicUrl: '',
              metadata: { size: 0, mimetype: 'unknown' }
            };
          }
        })
      );

      setFiles(enrichedFiles);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      toast.error('Veuillez saisir un nom de bucket');
      return;
    }

    setIsCreatingBucket(true);
    try {
      // Note: Les buckets ne peuvent pas être créés via l'API client à cause des policies RLS
      // Ils doivent être créés via les migrations SQL dans Supabase
      toast.error('Les buckets doivent être créés via SQL dans Supabase (voir migrations/)');
      console.warn('Création de bucket désactivée - utiliser les migrations SQL à la place');
      // await StorageService.createBucketIfNotExists(newBucketName, isPublicBucket);
      setNewBucketName('');
      // fetchBuckets(); // Pas besoin car rien n'a été créé
    } catch (error) {
      console.error('Erreur lors de la création du bucket:', error);
      toast.error('Erreur lors de la création du bucket');
    } finally {
      setIsCreatingBucket(false);
    }
  };

  const handleDeleteBucket = async (bucketName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le bucket "${bucketName}" et tous ses fichiers ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const { error } = await supabase!.storage.emptyBucket(bucketName);
      if (error) throw error;

      const { error: deleteBucketError } = await supabase!.storage.deleteBucket(bucketName);
      if (deleteBucketError) throw deleteBucketError;

      toast.success(`Bucket "${bucketName}" supprimé avec succès`);
      if (selectedBucket === bucketName) {
        setSelectedBucket(null);
      }
      fetchBuckets();
    } catch (error) {
      console.error('Erreur lors de la suppression du bucket:', error);
      toast.error('Erreur lors de la suppression du bucket');
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!selectedBucket) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${fileName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const { error } = await supabase!.storage.from(selectedBucket).remove([fileName]);
      if (error) throw error;

      toast.success(`Fichier "${fileName}" supprimé avec succès`);
      fetchFiles(selectedBucket);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      toast.error('Erreur lors de la suppression du fichier');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBucket) {
      toast.error('Veuillez sélectionner un bucket');
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const uploadPromises = Array.from(files).map(file => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        return supabase!.storage.from(selectedBucket).upload(fileName, file);
      });

      const results = await Promise.all(uploadPromises);
      const errors = results.filter(r => r.error).map(r => r.error);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (errors.length > 0) {
        console.error('Erreurs lors du téléchargement:', errors);
        toast.error(`${errors.length} erreur(s) lors du téléchargement`);
      } else {
        toast.success(`${files.length} fichier(s) téléchargé(s) avec succès`);
      }

      // Rafraîchir la liste des fichiers
      fetchFiles(selectedBucket);

      // Réinitialiser
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Réinitialiser l'input file
    e.target.value = '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBucketIcon = (name: string) => {
    if (name.includes('avatar')) return <User className="h-5 w-5" />;
    if (name.includes('product')) return <Database className="h-5 w-5" />;
    if (name.includes('exhibitor') || name.includes('company')) return <Building className="h-5 w-5" />;
    if (name.includes('image') || name.includes('gallery')) return <ImageIcon className="h-5 w-5" />;
    return <HardDrive className="h-5 w-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestionnaire de médias
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Liste des buckets */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Buckets de stockage
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={fetchBuckets}
                disabled={isLoading}
                title="Rafraîchir"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="space-y-1 mb-4">
              {buckets.map(bucket => (
                <div 
                  key={bucket.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                    ${selectedBucket === bucket.name ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedBucket(bucket.name)}
                >
                  <div className="flex items-center space-x-2">
                    {getBucketIcon(bucket.name)}
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {bucket.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {bucket.file_count} fichier(s)
                  </div>
                </div>
              ))}
              
              {buckets.length === 0 && !isLoading && (
                <div className="text-sm text-gray-500 p-2">
                  Aucun bucket trouvé
                </div>
              )}
              
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            
            {/* Création de bucket */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Créer un nouveau bucket
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newBucketName}
                  onChange={e => setNewBucketName(e.target.value)}
                  placeholder="Nom du bucket"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="public-bucket"
                    checked={isPublicBucket}
                    onChange={e => setIsPublicBucket(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="public-bucket" className="ml-2 block text-sm text-gray-700">
                    Bucket public
                  </label>
                </div>
                
                <Button
                  onClick={handleCreateBucket}
                  disabled={isCreatingBucket || !newBucketName.trim()}
                  className="w-full text-sm"
                >
                  {isCreatingBucket ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Créer le bucket
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Contenu principal - Fichiers */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                {selectedBucket ? `Fichiers dans "${selectedBucket}"` : 'Sélectionnez un bucket'}
              </h2>
              
              <div className="flex items-center space-x-2">
                {selectedBucket && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => fetchFiles(selectedBucket)}
                      disabled={isLoading}
                      title="Rafraîchir"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading}
                      className="flex items-center"
                    >
                      {isUploading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileUp className="h-4 w-4 mr-2" />
                      )}
                      Télécharger
                    </Button>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteBucket(selectedBucket)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer le bucket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Barre de progression */}
            {isUploading && (
              <div className="w-full mb-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress}% terminé
                </p>
              </div>
            )}
            
            {/* Tableau des fichiers */}
            {selectedBucket ? (
              <>
                {files.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fichier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date de création
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {files.map(file => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {file.metadata?.mimetype?.startsWith('image/') ? (
                                  <ImageIcon className="h-5 w-5 text-blue-500 mr-3" />
                                ) : (
                                  <File className="h-5 w-5 text-gray-500 mr-3" />
                                )}
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  {file.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {file.metadata?.mimetype || 'unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(file.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <a
                                  href={(file as any).publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Voir
                                </a>
                                <button
                                  onClick={() => handleDeleteFile(file.name)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {isLoading ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                        <p className="text-gray-500">Chargement des fichiers...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileUp className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-4">Aucun fichier dans ce bucket</p>
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Télécharger un fichier
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <HardDrive className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  Sélectionnez un bucket pour voir ses fichiers
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
