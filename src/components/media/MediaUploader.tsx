import React, { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Video, Music, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { toast } from 'sonner';

interface MediaUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onComplete?: (urls: string[]) => void;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  accept = '*/*',
  maxSize = 100, // 100MB par défaut
  maxFiles = 5,
  onUpload,
  onComplete,
  allowedTypes = ['image', 'video', 'audio', 'document']
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) {return 'image';}
    if (file.type.startsWith('video/')) {return 'video';}
    if (file.type.startsWith('audio/')) {return 'audio';}
    return 'document';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {return <ImageIcon className="h-6 w-6" />;}
    if (type.startsWith('video/')) {return <Video className="h-6 w-6" />;}
    if (type.startsWith('audio/')) {return <Music className="h-6 w-6" />;}
    return <File className="h-6 w-6" />;
  };

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file);

    if (!allowedTypes.includes(fileType)) {
      return `Type de fichier non autorisé: ${fileType}`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `Fichier trop volumineux (max ${maxSize}MB)`;
    }

    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) {return;}

    const newFiles: UploadFile[] = [];
    const fileArray = Array.from(selectedFiles);

    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    for (const file of fileArray) {
      const error = validateFile(file);

      if (error) {
        toast.error(error);
        continue;
      }

      newFiles.push({
        file,
        id: crypto.randomUUID(),
        progress: 0,
        status: 'pending'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    const filesToUpload = files.filter(f => f.status === 'pending');

    if (filesToUpload.length === 0) {
      toast.error('Aucun fichier à uploader');
      return;
    }

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        filesToUpload.find(u => u.id === f.id)
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Call onUpload callback
      await onUpload(filesToUpload.map(f => f.file));

      // Mark as success when callback resolves
      setFiles(prev => prev.map(f =>
        filesToUpload.find(u => u.id === f.id)
          ? { ...f, status: 'success' as const, progress: 100, url: URL.createObjectURL(f.file) }
          : f
      ));

      toast.success('Fichiers uploadés avec succès !');

      // Call onComplete if provided
      const urls = files.filter(f => f.status === 'success' && f.url).map(f => f.url!);
      onComplete?.(urls);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');

      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error' as const, error: 'Upload failed' }
          : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {return bytes + ' B';}
    if (bytes < 1024 * 1024) {return (bytes / 1024).toFixed(1) + ' KB';}
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Glissez vos fichiers ici ou cliquez pour sélectionner
        </p>
        <p className="text-sm text-gray-500">
          {allowedTypes.join(', ')} - Max {maxSize}MB par fichier - Max {maxFiles} fichiers
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              Fichiers sélectionnés ({files.length}/{maxFiles})
            </h3>
            <Button
              variant="default"
              size="sm"
              onClick={handleUpload}
              disabled={files.every(f => f.status !== 'pending')}
            >
              Uploader tout
            </Button>
          </div>

          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-gray-400">
                  {getFileIcon(uploadFile.file.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-2" />
                  )}

                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadFile.error || 'Erreur d\'upload'}
                    </p>
                  )}

                  {uploadFile.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">
                      Uploadé avec succès
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
