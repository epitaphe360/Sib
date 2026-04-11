/**
 * Schema de validation et collecte de données pour Mini-Site
 * Assure que toutes les informations requises sont présentes et valides
 */

export interface MiniSiteFormData {
  // Identité
  name: string;
  tagline: string;
  logo: File | string;
  description: string;

  // Thème et couleurs
  theme: 'modern' | 'classic' | 'dark' | 'vibrant';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroImage: File | string;
  heroCTA: string;

  // About Section
  aboutDescription: string;
  aboutImage: File | string;
  aboutHighlights: string[];
  stats: Array<{ label: string; value: string }>;

  // Products Section
  products: MiniSiteProduct[];

  // Gallery
  galleryImages: Array<{ file: File | string; caption: string; category: string }>;

  // Team
  teamMembers: MiniSiteTeamMember[];

  // Certifications
  certifications: MiniSiteCertification[];

  // News/Articles
  articles: MiniSiteArticle[];

  // Contact
  email: string;
  phone: string;
  website: string;
  address: string;

  // Social Media
  social: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

export interface MiniSiteProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  image: File | string;
  features: string[];
  price?: number;
}

export interface MiniSiteTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: File | string;
  specialties: string[];
  email?: string;
  linkedin?: string;
  phone?: string;
}

export interface MiniSiteCertification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  logo: File | string;
  description: string;
  validUntil?: Date;
}

export interface MiniSiteArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: File | string;
  date: Date;
  category: string;
}

/**
 * Règles de validation pour chaque section
 */
export const VALIDATION_RULES = {
  // Fondations
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    error: 'Le nom doit contenir entre 3 et 100 caractères',
  },
  tagline: {
    required: false,
    minLength: 5,
    maxLength: 100,
    error: 'Le slogan doit contenir entre 5 et 100 caractères',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    error: 'Email invalide',
  },
  phone: {
    required: true,
    pattern: /^[\d\s\-\+\(\)]{10,}$/,
    error: 'Numéro de téléphone invalide',
  },
  website: {
    required: false,
    pattern: /^https?:\/\/[^\s]+$/,
    error: 'URL invalide',
  },

  // Description
  description: {
    required: true,
    minLength: 50,
    maxLength: 5000,
    error: 'La description doit contenir entre 50 et 5000 caractères',
  },

  // Images
  logo: {
    required: true,
    maxSize: 500000, // 500KB
    formats: ['image/png', 'image/jpeg'],
    error: 'Logo invalide (PNG ou JPG, max 500KB)',
  },
  heroImage: {
    required: true,
    maxSize: 2000000, // 2MB
    formats: ['image/jpeg', 'image/webp'],
    error: 'Image bannière invalide (JPG ou WebP, max 2MB)',
  },

  // Produits
  products: {
    minCount: 1,
    maxCount: 20,
    error: 'Au moins 1 produit requis (max 20)',
  },
  productName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    error: 'Nom produit invalide (3-100 caractères)',
  },
  productDescription: {
    required: true,
    minLength: 10,
    maxLength: 500,
    error: 'Description produit (10-500 caractères)',
  },

  // Équipe
  teamName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    error: 'Nom invalide',
  },
  teamRole: {
    required: true,
    minLength: 3,
    maxLength: 50,
    error: 'Rôle invalide',
  },
  teamBio: {
    required: true,
    minLength: 20,
    maxLength: 500,
    error: 'Bio (20-500 caractères)',
  },

  // Certifications
  certificationName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    error: 'Nom certification invalide',
  },
};

/**
 * Fonction de validation complète
 */
export function validateMiniSiteForm(data: Partial<MiniSiteFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validation fondations
  if (!data.name?.trim()) {
    errors.name = VALIDATION_RULES.name.error;
  } else if (data.name.length < 3) {
    errors.name = VALIDATION_RULES.name.error;
  }

  if (!data.email?.trim()) {
    errors.email = 'Email requis';
  } else if (!VALIDATION_RULES.email.pattern.test(data.email)) {
    errors.email = VALIDATION_RULES.email.error;
  }

  if (!data.phone?.trim()) {
    errors.phone = 'Téléphone requis';
  } else if (!VALIDATION_RULES.phone.pattern.test(data.phone)) {
    errors.phone = VALIDATION_RULES.phone.error;
  }

  // Validation description
  if (!data.description?.trim()) {
    errors.description = 'Description requise';
  } else if (data.description.length < 50) {
    errors.description = VALIDATION_RULES.description.error;
  }

  // Validation produits
  if (!data.products || data.products.length === 0) {
    errors.products = 'Au moins 1 produit requis';
  }

  data.products?.forEach((product, index) => {
    if (!product.name?.trim()) {
      errors[`product_${index}_name`] = 'Nom produit requis';
    }
    if (!product.description?.trim()) {
      errors[`product_${index}_description`] = 'Description produit requise';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Fonction pour valider les images
 */
export function validateImage(
  file: File,
  maxSize: number = 2000000,
  allowedFormats: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { isValid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Fichier trop volumineux (max ${maxSize / 1000000}MB)`,
    };
  }

  if (!allowedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: `Format non supporté. Formats acceptés: ${allowedFormats.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Fonction pour générer un formulaire vide
 */
export function getEmptyMiniSiteForm(): Partial<MiniSiteFormData> {
  return {
    name: '',
    tagline: '',
    description: '',
    theme: 'modern',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    accentColor: '#10B981',
    heroTitle: '',
    heroSubtitle: '',
    heroCTA: 'En savoir plus',
    aboutDescription: '',
    aboutHighlights: [],
    stats: [],
    products: [],
    galleryImages: [],
    teamMembers: [],
    certifications: [],
    articles: [],
    email: '',
    phone: '',
    website: '',
    address: '',
    social: {},
  };
}

/**
 * Calcul du pourcentage de remplissage
 */
export function calculateCompletion(data: Partial<MiniSiteFormData>): number {
  const totalFields = 20;
  let filledFields = 0;

  if (data.name?.trim()) filledFields++;
  if (data.logo) filledFields++;
  if (data.description?.trim()) filledFields++;
  if (data.heroTitle?.trim()) filledFields++;
  if (data.heroImage) filledFields++;
  if (data.aboutDescription?.trim()) filledFields++;
  if (data.products && data.products.length > 0) filledFields += 2;
  if (data.galleryImages && data.galleryImages.length > 0) filledFields++;
  if (data.teamMembers && data.teamMembers.length > 0) filledFields++;
  if (data.certifications && data.certifications.length > 0) filledFields++;
  if (data.articles && data.articles.length > 0) filledFields++;
  if (data.email?.trim()) filledFields++;
  if (data.phone?.trim()) filledFields++;
  if (data.social && Object.keys(data.social).some(k => data.social![k as keyof typeof data.social])) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
}

/**
 * Prioriser les sections à remplir
 */
export function getPrioritizedSections(data: Partial<MiniSiteFormData>): {
  priority: 'high' | 'medium' | 'low';
  section: string;
  complete: boolean;
}[] {
  return [
    {
      priority: 'high',
      section: 'Logo',
      complete: !!data.logo,
    },
    {
      priority: 'high',
      section: 'Description',
      complete: !!data.description?.trim(),
    },
    {
      priority: 'high',
      section: 'Produits',
      complete: (data.products?.length ?? 0) > 0,
    },
    {
      priority: 'high',
      section: 'Contact',
      complete: !!data.email?.trim() && !!data.phone?.trim(),
    },
    {
      priority: 'medium',
      section: 'Bannière (Hero)',
      complete: !!data.heroImage,
    },
    {
      priority: 'medium',
      section: 'Galerie',
      complete: (data.galleryImages?.length ?? 0) > 0,
    },
    {
      priority: 'medium',
      section: 'Équipe',
      complete: (data.teamMembers?.length ?? 0) > 0,
    },
    {
      priority: 'low',
      section: 'Actualités',
      complete: (data.articles?.length ?? 0) > 0,
    },
    {
      priority: 'low',
      section: 'Certifications',
      complete: (data.certifications?.length ?? 0) > 0,
    },
  ];
}
