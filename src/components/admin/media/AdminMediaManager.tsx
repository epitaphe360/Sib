import React, { useState } from 'react';
import { MediaManager } from '../../ui/upload';

interface AdminMediaManagerProps {
  onImageSelect?: (url: string) => void;
  onClose?: () => void;
  title?: string;
  showUploadButton?: boolean;
  maxSelections?: number;
}

const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  onImageSelect,
  onClose,
  title = "Gestionnaire de médias",
  showUploadButton = true,
  maxSelections = 1
}) => {
  const [selectedBucket, setSelectedBucket] = useState<string>('media');
  
  const buckets = [
    { id: 'media', name: 'Médias généraux' },
    { id: 'products', name: 'Produits' },
    { id: 'exhibitors', name: 'Exposants' },
    { id: 'minisite-galleries', name: 'Galeries mini-sites' },
    { id: 'events', name: 'Événements' },
    { id: 'news', name: 'Actualités' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full mx-auto">
      <div className="bg-gray-100 px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un bucket
          </label>
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            {buckets.map(bucket => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name}
              </option>
            ))}
          </select>
        </div>
        
        <MediaManager
          bucket={selectedBucket}
          onSelect={onImageSelect}
          showUploadButton={showUploadButton}
          maxSelections={maxSelections}
          allowDelete={true}
          allowFolderCreation={true}
          viewType="grid"
          className="h-[60vh] overflow-auto"
        />
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-500">
        Les fichiers téléchargés sont stockés dans Supabase Storage. 
        Veillez à respecter les droits d'auteur et à n'utiliser que des images dont vous possédez les droits.
      </div>
    </div>
  );
};

export default AdminMediaManager;
