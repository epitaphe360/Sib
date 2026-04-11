import { PartnerTier } from '../config/partnerTiers';

/**
 * Types pour le système partenaire
 */

export interface PartnerProfile {
  id: string;
  userId: string;
  organizationName: string;
  tier: PartnerTier;
  website?: string;
  description?: string;
  logo?: string;
  industry?: string;
  country?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Quotas actuels
  currentUsage: {
    appointments: number;
    eventRegistrations: number;
    mediaUploads: number;
    teamMembers: number;
    standsUsed: number;
    promotionalEmails: number;
    showcaseProducts: number;
    leadExports: number;
  };

  // Statut
  status: 'active' | 'pending' | 'suspended' | 'expired';
  validFrom: Date;
  validUntil: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerStats {
  totalAppointments: number;
  totalEventRegistrations: number;
  totalMediaViews: number;
  totalLeads: number;
  profileViews: number;
  productViews: number;
  standVisits: number;
}

export interface PartnerTeamMember {
  id: string;
  partnerId: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
  status: 'active' | 'pending' | 'inactive';
  createdAt: Date;
}

export interface PartnerMediaFile {
  id: string;
  partnerId: string;
  userId: string;
  name: string;
  type: 'video' | 'brochure' | 'presentation' | 'image' | 'document';
  url: string;
  size: number; // bytes
  mimeType: string;
  thumbnail?: string;
  views: number;
  downloads: number;
  status: 'active' | 'pending' | 'rejected';
  createdAt: Date;
}

export interface PartnerProduct {
  id: string;
  partnerId: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  price?: number;
  currency?: string;
  specifications?: Record<string, string>;
  brochureUrl?: string;
  videoUrl?: string;
  views: number;
  leads: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerLead {
  id: string;
  partnerId: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany?: string;
  visitorPhone?: string;
  source: 'appointment' | 'product_view' | 'stand_visit' | 'event' | 'contact_form';
  sourceId?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  rating?: number; // 1-5 stars
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerAnalytics {
  partnerId: string;
  period: 'day' | 'week' | 'month' | 'all';
  startDate: Date;
  endDate: Date;

  metrics: {
    profileViews: number;
    profileViewsChange: number; // % change vs previous period
    standVisits: number;
    standVisitsChange: number;
    appointments: number;
    appointmentsChange: number;
    leads: number;
    leadsChange: number;
    productViews: number;
    productViewsChange: number;
    mediaDownloads: number;
    mediaDownloadsChange: number;
    conversionRate: number; // leads/visitors %
  };

  topProducts: Array<{
    productId: string;
    productName: string;
    views: number;
    leads: number;
  }>;

  topVisitors: Array<{
    visitorId: string;
    visitorName: string;
    interactions: number;
    lastInteraction: Date;
  }>;

  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
}

export interface PartnerNotification {
  id: string;
  partnerId: string;
  type: 'appointment' | 'lead' | 'event' | 'system' | 'quota';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
}

export interface PartnerUpgradeRequest {
  id: string;
  partnerId: string;
  currentTier: PartnerTier;
  targetTier: PartnerTier;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal' | 'cmi' | 'wire_transfer';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentDetails?: Record<string, any>;
  requestedAt: Date;
  processedAt?: Date;
  notes?: string;
}

export interface PartnerQuotaCheck {
  partnerId: string;
  tier: PartnerTier;
  quotaType: string;
  limit: number;
  current: number;
  remaining: number;
  isUnlimited: boolean;
  isReached: boolean;
  percentage: number; // 0-100
}
