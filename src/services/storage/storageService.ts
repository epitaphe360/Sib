import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface FileMetadata {
  publicUrl?: string;
  path?: string;
  name?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Service pour gérer le stockage des fichiers avec Supabase Storage
 */
export class StorageService {
  /**
   * Télécharge une image vers Supabase Storage
   * @param file Le fichier image à télécharger
   * @param bucket Le bucket de stockage (default: 'images')
   * @param folder Le dossier optionnel dans le bucket
   * @returns URL publique de l'image téléchargée
   */
  static async uploadImage(
    file: File,
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Générer un nom de fichier unique avec UUID
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${uuidv4()}.${fileExt}`;

    // Télécharger le fichier avec contentType explicite
    const { error } = await supabase!.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw error;
    }

    // Obtenir l'URL publique
    const { data: publicUrlData } = supabase!.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  /**
   * Télécharge plusieurs images et retourne leurs URLs
   * @param files Liste de fichiers à télécharger
   * @param bucket Le bucket de stockage
   * @param folder Le dossier optionnel dans le bucket
   * @returns Liste des URLs publiques
   */
  static async uploadMultipleImages(
    files: File[],
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, bucket, folder)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Supprime une image du stockage
   * @param url URL publique de l'image à supprimer
   * @param bucket Le bucket de stockage
   * @returns true si la suppression a réussi
   */
  static async deleteImage(url: string, bucket: string = 'images'): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Extraire le chemin du fichier de l'URL
    const urlParts = url.split(`${bucket}/`);
    if (urlParts.length < 2) {
      throw new Error('URL invalide pour la suppression');
    }
    
    const filePath = urlParts[1];
    
    const { error } = await supabase!.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      throw error;
    }

    return true;
  }

  /**
   * Crée un bucket s'il n'existe pas déjà
   * @param bucketName Nom du bucket à créer
   * @param isPublic Si le bucket doit être public
   * @returns true si le bucket a été créé ou existe déjà
   */
  static async createBucketIfNotExists(
    bucketName: string,
    isPublic: boolean = true
  ): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Vérifier si le bucket existe déjà
    const { data: buckets } = await supabase!.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      const { error } = await supabase!.storage.createBucket(bucketName, {
        public: isPublic
      });

      if (error) {
        console.error('Erreur lors de la création du bucket:', error);
        throw error;
      }
    }

    return true;
  }

  /**
   * Vérifie l'existence d'un bucket
   * @param bucketName Nom du bucket à vérifier
   * @returns true si le bucket existe
   */
  static async bucketExists(bucketName: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    const { data: buckets } = await supabase!.storage.listBuckets();
    return buckets?.some(b => b.name === bucketName) || false;
  }

  /**
   * Liste tous les fichiers dans un bucket ou dossier
   * @param bucket Le nom du bucket
   * @param folder Le dossier optionnel dans le bucket
   * @returns Liste des fichiers
   */
  static async listFiles(
    bucket: string, 
    folder: string = ''
  ): Promise<{ name: string; url: string; size: number; createdAt: string }[]> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    const { data, error } = await supabase!.storage
      .from(bucket)
      .list(folder, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Erreur lors de la liste des fichiers:', error);
      throw error;
    }

    return data.map(file => {
      const { data: urlData } = supabase!.storage
        .from(bucket)
        .getPublicUrl(`${folder ? folder + '/' : ''}${file.name}`);
      
      return {
        name: file.name,
        url: urlData.publicUrl,
        size: file.metadata.size,
        createdAt: file.created_at
      };
    });
  }

  /**
   * Récupère les métadonnées d'un fichier
   * @param bucket Le nom du bucket
   * @param filePath Le chemin du fichier dans le bucket
   * @returns Les métadonnées du fichier
   */
  static async getFileMetadata(bucket: string, filePath: string): Promise<FileMetadata> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
      throw error;
    }
  }

  /**
   * Déplace un fichier d'un emplacement à un autre
   * @param bucket Le nom du bucket
   * @param oldPath L'ancien chemin du fichier
   * @param newPath Le nouveau chemin du fichier
   * @returns true si le déplacement a réussi
   */
  static async moveFile(bucket: string, oldPath: string, newPath: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Copier le fichier vers la nouvelle destination
    const { error: copyError } = await supabase!.storage
      .from(bucket)
      .copy(oldPath, newPath);

    if (copyError) {
      console.error('Erreur lors de la copie du fichier:', copyError);
      throw copyError;
    }

    // Supprimer l'ancien fichier
    const { error: removeError } = await supabase!.storage
      .from(bucket)
      .remove([oldPath]);

    if (removeError) {
      console.error('Erreur lors de la suppression de l\'ancien fichier:', removeError);
      throw removeError;
    }

    return true;
  }
}

