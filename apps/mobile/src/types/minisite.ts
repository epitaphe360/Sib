export interface MiniSiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export type MiniSiteSectionType =
  | 'hero'
  | 'about'
  | 'products'
  | 'gallery'
  | 'contact'
  | 'news'
  | 'team'
  | 'certifications';

export interface MiniSiteSection {
  id?: string;
  type: MiniSiteSectionType;
  title?: string;
  visible?: boolean;
  order?: number;
  content?: Record<string, unknown>;
}

export interface MiniSiteProduct {
  id: string;
  name: string;
  description: string;
  category?: string;
  images: string[];
  price?: string | number;
  specifications?: string;
  featured?: boolean;
  features?: string[];
}

export interface MiniSiteExhibitor {
  id: string;
  companyName: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  standNumber?: string;
  hallNumber?: string;
  sector?: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    social?: Record<string, string>;
  };
}

export interface MiniSitePublic {
  id: string;
  exhibitorId: string;
  logoUrl?: string;
  published: boolean;
  views: number;
  lastUpdated: string;
  theme: MiniSiteTheme;
  sections: MiniSiteSection[];
}

export interface MiniSitePublicData {
  miniSite: MiniSitePublic;
  exhibitor: MiniSiteExhibitor;
  products: MiniSiteProduct[];
}
