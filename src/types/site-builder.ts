// Site Builder Types

// Generic content type for flexible section content
type SectionContent = Record<string, unknown>;

export interface SiteSection {
  id: string;
  type: 'hero' | 'about' | 'products' | 'contact' | 'gallery' | 'testimonials' | 'video' | 'custom';
  content: SectionContent;
  order: number;
  visible: boolean;
  storage_path?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  googleAnalyticsId: string;
  slug?: string;
}

export interface MiniSite {
  id: string;
  title: string;
  slug: string;
  sections: SiteSection[];
  seo: SEOConfig;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  exhibitorId?: string;
  templateId?: string;
}

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'ecommerce' | 'portfolio' | 'event' | 'landing' | 'startup' | 'agency' | 'product' | 'blog' | 'minimal';
  thumbnail: string;
  sections: SiteSection[];
  premium: boolean;
  popularity: number;
}

// Networking & Matchmaking Types

export interface UserProfile {
  id: string;
  userId: string;
  company: string;
  role: string;
  industry: string;
  interests: string[];
  lookingFor: string[];
  offering: string[];
  location: string;
  linkedin: string;
  bio: string;
}

export interface MatchScore {
  userId: string;
  score: number;
  reasons: string[];
  sharedInterests: string[];
  complementarySkills: string[];
  industryMatch: boolean;
}

export interface NetworkingInteraction {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'view' | 'like' | 'message' | 'meeting' | 'connection';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SpeedNetworkingSession {
  id: string;
  eventId: string;
  name: string;
  description: string;
  startTime: string;
  duration: number; // minutes per meeting
  maxParticipants: number;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed';
  matches: Array<{
    user1: string;
    user2: string;
    startTime: string;
    roomId: string;
  }>;
}

export interface NetworkingRoom {
  id: string;
  name: string;
  sector: string;
  description: string;
  capacity: number;
  participants: string[];
  moderator: string;
  status: 'open' | 'full' | 'closed';
  tags: string[];
}
