/**
 * Service de validation robuste pour les fichiers uploadés
 * Prévient : DoS, malware, spoofing d'extension
 */

/**
 * Magic bytes (signatures de fichiers)
 * Utilisé pour vérifier le VRAI type de fichier (pas juste l'extension)
 */
const FILE_SIGNATURES = {
  // Images
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG EXIF
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG Canon
    [0xFF, 0xD8, 0xFF, 0xE3], // JPEG Samsung
    [0xFF, 0xD8, 0xFF, 0xE8]  // JPEG SPIFF
  ],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // + WEBP à l'offset 8
  'image/bmp': [[0x42, 0x4D]],

  // Documents
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],

  // Vidéos
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70]
  ]
};

/**
 * Tailles maximales par type de fichier (en bytes)
 */
const MAX_FILE_SIZES = {
  'image/jpeg': 10 * 1024 * 1024,  // 10MB
  'image/png': 10 * 1024 * 1024,   // 10MB
  'image/gif': 5 * 1024 * 1024,    // 5MB
  'image/webp': 10 * 1024 * 1024,  // 10MB
  'image/bmp': 20 * 1024 * 1024,   // 20MB (non compressé)
  'application/pdf': 25 * 1024 * 1024,  // 25MB
  'video/mp4': 100 * 1024 * 1024,  // 100MB
  'default': 10 * 1024 * 1024      // 10MB par défaut
};

/**
 * Types de fichiers autorisés
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'application/pdf',
  'video/mp4'
];

/**
 * Erreurs de validation
 */
export class FileValidationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * Lire les premiers bytes d'un fichier
 */
async function readFileBytes(file: File, length: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      resolve(Array.from(bytes));
    };

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));

    // Lire seulement les premiers bytes
    const blob = file.slice(0, length);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Vérifier la signature (magic bytes) d'un fichier
 */
async function verifyFileSignature(file: File): Promise<string | null> {
  try {
    // Lire les 12 premiers bytes (suffisant pour la plupart des signatures)
    const bytes = await readFileBytes(file, 12);

    // Vérifier chaque type de fichier
    for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
      for (const signature of signatures) {
        // Vérifier si les bytes correspondent
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }

        if (matches) {
          // Pour WebP, vérifier aussi "WEBP" à l'offset 8
          if (mimeType === 'image/webp') {
            if (bytes[8] === 0x57 && bytes[9] === 0x45 &&
                bytes[10] === 0x42 && bytes[11] === 0x50) {
              return mimeType;
            }
          } else {
            return mimeType;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Erreur vérification signature:', error);
    return null;
  }
}

/**
 * Interface pour les options de validation
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  checkMagicBytes?: boolean;
}

/**
 * Valider un fichier uploadé
 *
 * @param file - Fichier à valider
 * @param options - Options de validation
 * @returns Promise<true> si valide
 * @throws FileValidationError si invalide
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<true> {

  const {
    maxSize,
    allowedTypes = ALLOWED_MIME_TYPES,
    checkMagicBytes = true
  } = options;

  // 1. Vérifier que le fichier existe
  if (!file) {
    throw new FileValidationError('NO_FILE', 'Aucun fichier fourni');
  }

  // 2. Vérifier la taille du fichier
  const maxAllowedSize = maxSize || MAX_FILE_SIZES[file.type] || MAX_FILE_SIZES.default;

  if (file.size > maxAllowedSize) {
    const maxSizeMB = (maxAllowedSize / (1024 * 1024)).toFixed(1);
    throw new FileValidationError(
      'FILE_TOO_LARGE',
      `Le fichier est trop volumineux. Taille maximale : ${maxSizeMB}MB`
    );
  }

  if (file.size === 0) {
    throw new FileValidationError('FILE_EMPTY', 'Le fichier est vide');
  }

  // 3. Vérifier le type MIME déclaré
  if (!allowedTypes.includes(file.type)) {
    throw new FileValidationError(
      'INVALID_TYPE',
      `Type de fichier non autorisé : ${file.type}. Types autorisés : ${allowedTypes.join(', ')}`
    );
  }

  // 4. Vérifier les magic bytes (CRITIQUE pour sécurité)
  if (checkMagicBytes) {
    const realMimeType = await verifyFileSignature(file);

    if (!realMimeType) {
      throw new FileValidationError(
        'INVALID_SIGNATURE',
        'Le fichier ne correspond pas à un format reconnu. Fichier corrompu ou dangereux.'
      );
    }

    // Le type réel doit correspondre au type déclaré (ou être compatible)
    if (realMimeType !== file.type) {
      // Exception : JPEG peut avoir plusieurs sous-types
      const jpegTypes = ['image/jpeg', 'image/jpg'];
      const isJpegCompatible = jpegTypes.includes(realMimeType) && jpegTypes.includes(file.type);

      if (!isJpegCompatible) {
        throw new FileValidationError(
          'TYPE_MISMATCH',
          `Le fichier prétend être ${file.type} mais est en réalité ${realMimeType}. ` +
          `Possible tentative de spoofing d'extension.`
        );
      }
    }
  }

  // 5. Vérifier le nom du fichier (pas de caractères dangereux)
  // eslint-disable-next-line no-control-regex
  const dangerousChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (dangerousChars.test(file.name)) {
    throw new FileValidationError(
      'INVALID_FILENAME',
      'Le nom du fichier contient des caractères invalides'
    );
  }

  // 6. Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions: { [key: string]: string[] } = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/bmp': ['bmp'],
    'application/pdf': ['pdf'],
    'video/mp4': ['mp4']
  };

  const allowedExtensions = validExtensions[file.type];
  if (allowedExtensions && extension && !allowedExtensions.includes(extension)) {
    throw new FileValidationError(
      'INVALID_EXTENSION',
      `Extension de fichier invalide. Attendu : ${allowedExtensions.join(', ')}`
    );
  }

  return true;
}

/**
 * Valider plusieurs fichiers
 */
export async function validateFiles(
  files: File[],
  options: FileValidationOptions = {}
): Promise<true> {
  if (!files || files.length === 0) {
    throw new FileValidationError('NO_FILES', 'Aucun fichier fourni');
  }

  // Valider chaque fichier
  for (const file of files) {
    await validateFile(file, options);
  }

  return true;
}

/**
 * Valider une image spécifiquement
 */
export async function validateImage(file: File, maxSizeMB: number = 10): Promise<true> {
  return validateFile(file, {
    maxSize: maxSizeMB * 1024 * 1024,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ],
    checkMagicBytes: true
  });
}

/**
 * Valider un PDF
 */
export async function validatePDF(file: File, maxSizeMB: number = 25): Promise<true> {
  return validateFile(file, {
    maxSize: maxSizeMB * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    checkMagicBytes: true
  });
}

/**
 * Valider une vidéo
 */
export async function validateVideo(file: File, maxSizeMB: number = 100): Promise<true> {
  return validateFile(file, {
    maxSize: maxSizeMB * 1024 * 1024,
    allowedTypes: ['video/mp4'],
    checkMagicBytes: true
  });
}

export default {
  validateFile,
  validateFiles,
  validateImage,
  validatePDF,
  validateVideo,
  FileValidationError
};
