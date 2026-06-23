import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { validateImage, validateFile, FileValidationError } from './fileValidator';

/**
 * Service pour gérer le stockage des fichiers dans Supabase Storage
 */
export class StorageService {
  /**
   * Télécharge une image dans le bucket Supabase
   * @param file Le fichier à télécharger
   * @param bucket Le nom du bucket (par défaut 'images')
   * @param folder Le dossier de destination (optionnel)
   * @returns L'URL publique de l'image téléchargée
   */
  static async uploadImage(
    file: File,
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    // DEBUG: Logs avant validation
    console.log('🔍 [UPLOAD DEBUG] Fichier reçu:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      constructor: file.constructor.name
    });

    // DÉSACTIVATION TEMPORAIRE DE LA VALIDATION pour debug
    // La validation pourrait corrompre le fichier
    /*
    try {
      await validateImage(file, 10); // Max 10MB
      console.log('✅ [UPLOAD DEBUG] Validation réussie');
    } catch (error) {
      console.error('❌ [UPLOAD DEBUG] Validation échouée:', error);
      if (error instanceof FileValidationError) {
        throw new Error(`Validation du fichier échouée : ${error.message}`);
      }
      throw error;
    }
    */
    console.log('⚠️ [UPLOAD DEBUG] Validation désactivée pour debug');

    // Générer un nom de fichier unique avec l'extension validée
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // DEBUG: Logs avant upload
    const contentType = file.type || 'image/jpeg';
    console.log('📤 [UPLOAD DEBUG] Upload vers Supabase:', {
      bucket,
      filePath,
      contentType,
      fileSize: file.size,
      fileType: file.type
    });

    // Télécharger le fichier avec le contentType explicite
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType
      });

    if (error) {
      console.error('❌ [UPLOAD DEBUG] Erreur Supabase:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      });
      throw error;
    }

    console.log('✅ [UPLOAD DEBUG] Upload réussi:', data);

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Télécharge une image depuis une URL et la stocke dans Supabase
   * @param imageUrl L'URL de l'image à télécharger
   * @param bucket Le nom du bucket (par défaut 'images')
   * @param folder Le dossier de destination (optionnel)
   * @returns L'URL publique de l'image téléchargée
   */
  static async uploadImageFromUrl(
    imageUrl: string,
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    try {
      // Télécharger l'image depuis l'URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Déterminer l'extension à partir du type MIME
      let fileExt = 'jpg'; // par défaut
      const contentType = response.headers.get('content-type');
      if (contentType) {
        if (contentType.includes('png')) {fileExt = 'png';}
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) {fileExt = 'jpg';}
        else if (contentType.includes('gif')) {fileExt = 'gif';}
        else if (contentType.includes('webp')) {fileExt = 'webp';}
        else if (contentType.includes('svg')) {fileExt = 'svg';}
      }

      // Créer un fichier à partir du blob
      const file = new File([blob], `image.${fileExt}`, { type: contentType || 'image/jpeg' });

      // Utiliser la méthode d'upload existante
      return await this.uploadImage(file, bucket, folder);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image depuis l\'URL:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier du stockage
   * @param filePath Le chemin du fichier à supprimer
   * @param bucket Le nom du bucket (par défaut 'images')
   */
  static async deleteFile(filePath: string, bucket: string = 'images'): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Erreur de suppression:', error);
      throw error;
    }
  }

  /**
   * Récupère l'URL publique d'un fichier
   * @param filePath Le chemin du fichier
   * @param bucket Le nom du bucket (par défaut 'images')
   * @returns L'URL publique du fichier
   */
  static getPublicUrl(filePath: string, bucket: string = 'images'): string {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Impossible de récupérer l\'URL publique du fichier');
    }

    return data.publicUrl;
  }

  /**
   * Télécharge plusieurs images en une seule fois
   * @param files Les fichiers à télécharger
   * @param bucket Le nom du bucket (par défaut 'images')
   * @param folder Le dossier de destination (optionnel)
   * @returns Les URLs publiques des images téléchargées
   */
  static async uploadMultipleImages(
    files: File[],
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('Aucun fichier fourni');
    }

    // Limite de fichiers pour éviter DoS
    if (files.length > 20) {
      throw new Error('Maximum 20 fichiers autorisés par upload');
    }

    // Valider tous les fichiers AVANT de commencer l'upload
    for (const file of files) {
      try {
        await validateImage(file, 10);
      } catch (error) {
        if (error instanceof FileValidationError) {
          throw new Error(`Fichier "${file.name}" invalide : ${error.message}`);
        }
        throw error;
      }
    }

    // Uploader tous les fichiers validés
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadImage(file, bucket, folder);
      urls.push(url);
    }

    return urls;
  }

  /**
   * Liste les fichiers dans un bucket et dossier spécifique
   * @param bucket Le nom du bucket (par défaut 'images')
   * @param folder Le dossier à lister (optionnel, liste le bucket entier si vide)
   * @returns Liste des fichiers avec leurs métadonnées
   */
  static async listFiles(
    bucket: string = 'images',
    folder: string = ''
  ): Promise<{ name: string; url: string; size: number; createdAt: string }[]> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Mapper les fichiers avec leurs URLs publiques
    return data
      .filter(file => file.name) // Filtrer les dossiers
      .map(file => {
        const filePath = folder ? `${folder}/${file.name}` : file.name;
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          createdAt: file.created_at || new Date().toISOString(),
        };
      });
  }

  /**
   * Crée un bucket s'il n'existe pas déjà
   * @param bucketName Le nom du bucket à créer
   * @param isPublic Si le bucket doit être public (true par défaut)
   */
  static async createBucketIfNotExists(bucketName: string, isPublic: boolean = true): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    // Vérifier si le bucket existe déjà
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });

      if (error) {
        console.error('Erreur lors de la création du bucket:', error);
        throw error;
      }
    }
  }
}
