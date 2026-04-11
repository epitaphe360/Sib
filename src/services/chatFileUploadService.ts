/**
 * Service pour l'upload de fichiers et images dans le chat
 * Gère l'upload, la compression, et la sécurité
 */

import { supabase } from '../lib/supabase';
import { storageService } from './storageService';

export interface FileUploadOptions {
  maxSize?: number; // en bytes (default: 10MB)
  allowedTypes?: string[];
  compress?: boolean;
  generateThumbnail?: boolean;
}

export interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface ChatAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string;
  created_at: string;
}

class ChatFileUploadService {
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  private readonly ALLOWED_ARCHIVE_TYPES = ['application/zip', 'application/x-rar-compressed'];

  /**
   * Upload un fichier pour le chat
   */
  async uploadFile(
    file: File,
    conversationId: string,
    userId: string,
    options?: FileUploadOptions
  ): Promise<UploadedFile | null> {
    try {
      // Validation taille
      const maxSize = options?.maxSize || this.DEFAULT_MAX_SIZE;
      if (file.size > maxSize) {
        throw new Error(`File too large. Max size: ${this.formatSize(maxSize)}`);
      }

      // Validation type
      const allowedTypes = options?.allowedTypes || [
        ...this.ALLOWED_IMAGE_TYPES,
        ...this.ALLOWED_DOCUMENT_TYPES,
        ...this.ALLOWED_ARCHIVE_TYPES,
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type not allowed: ${file.type}`);
      }

      // Compression d'image si activée
      let fileToUpload = file;
      if (options?.compress && this.isImage(file)) {
        fileToUpload = await this.compressImage(file);
      }

      // Upload vers Supabase Storage
      const bucket = 'chat-files';
      const filePath = `${conversationId}/${userId}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Générer thumbnail si image
      let thumbnailUrl: string | undefined;
      if (options?.generateThumbnail && this.isImage(file)) {
        thumbnailUrl = await this.generateThumbnail(file, conversationId, userId);
      }

      return {
        id: uploadData.path,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        thumbnail_url: thumbnailUrl,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur uploadFile:', error);
      throw error;
    }
  }

  /**
   * Créer un attachment de message
   */
  async createMessageAttachment(
    messageId: string,
    uploadedFile: UploadedFile
  ): Promise<ChatAttachment | null> {
    try {
      const { data, error } = await supabase
        .from('message_attachments')
        .insert([{
          message_id: messageId,
          file_url: uploadedFile.url,
          file_name: uploadedFile.name,
          file_size: uploadedFile.size,
          file_type: uploadedFile.type,
          thumbnail_url: uploadedFile.thumbnail_url,
        }])
        .select('id, message_id, file_url, file_name, file_size, file_type, thumbnail_url, created_at')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur createMessageAttachment:', error);
      return null;
    }
  }

  /**
   * Récupérer les attachments d'un message
   */
  async getMessageAttachments(messageId: string): Promise<ChatAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('message_attachments')
        .select('id, message_id, file_url, file_name, file_size, file_type, thumbnail_url, created_at')
        .eq('message_id', messageId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getMessageAttachments:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les fichiers d'une conversation
   */
  async getConversationFiles(conversationId: string): Promise<ChatAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('message_attachments')
        .select(`
          *,
          message:messages!inner(conversation_id)
        `)
        .eq('message.conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getConversationFiles:', error);
      return [];
    }
  }

  /**
   * Supprimer un fichier
   */
  async deleteFile(attachmentId: string): Promise<boolean> {
    try {
      // Récupérer l'attachment pour avoir l'URL
      const { data: attachment, error: fetchError } = await supabase
        .from('message_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;

      // Extraire le path du fichier depuis l'URL
      const url = new URL(attachment.file_url);
      const pathParts = url.pathname.split('/');
      const bucket = pathParts[pathParts.length - 4]; // chat-files
      const filePath = pathParts.slice(-3).join('/'); // conversation/user/file.ext

      // Supprimer du storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) throw storageError;

      // Supprimer l'enregistrement
      const { error: deleteError } = await supabase
        .from('message_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('❌ Erreur deleteFile:', error);
      return false;
    }
  }

  /**
   * Compresser une image
   */
  private async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Limiter les dimensions max
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Générer une miniature
   */
  private async generateThumbnail(
    file: File,
    conversationId: string,
    userId: string
  ): Promise<string | undefined> {
    try {
      const thumbnailFile = await this.compressImage(file, 0.6);

      const bucket = 'chat-thumbnails';
      const filePath = `${conversationId}/${userId}/${Date.now()}-thumb-${file.name}`;

      const { data: uploadData, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, thumbnailFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Erreur generateThumbnail:', error);
      return undefined;
    }
  }

  /**
   * Vérifier si un fichier est une image
   */
  private isImage(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * Formater la taille d'un fichier
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Valider un fichier avant upload
   */
  validateFile(file: File, options?: FileUploadOptions): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options?.allowedTypes || [
      ...this.ALLOWED_IMAGE_TYPES,
      ...this.ALLOWED_DOCUMENT_TYPES,
      ...this.ALLOWED_ARCHIVE_TYPES,
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille max: ${this.formatSize(maxSize)}`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé: ${file.type}`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    conversationId: string,
    userId: string,
    options?: FileUploadOptions
  ): Promise<UploadedFile[]> {
    const uploads = files.map(file =>
      this.uploadFile(file, conversationId, userId, options)
    );

    const results = await Promise.allSettled(uploads);

    return results
      .filter((result): result is PromiseFulfilledResult<UploadedFile | null> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as UploadedFile);
  }
}

export const chatFileUploadService = new ChatFileUploadService();
export default chatFileUploadService;
