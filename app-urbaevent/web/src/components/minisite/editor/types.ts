/**
 * Type definitions for MiniSite Editor
 */

export interface SectionContent {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  description?: string;
  features?: string[];
  products?: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    features: string[];
    price: string;
  }>;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  notificationEmail?: string;
  images?: string[];
  articles?: Array<{
    title: string;
    content: string;
    date: string;
    image?: string;
  }>;
  [key: string]: unknown;
}

export interface Section {
  id: string;
  type: 'hero' | 'about' | 'products' | 'gallery' | 'contact' | 'news';
  title: string;
  content: SectionContent;
  visible: boolean;
  order: number;
}

export interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
}

export interface SectionType {
  type: Section['type'];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}
