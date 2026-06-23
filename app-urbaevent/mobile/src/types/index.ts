export type UserType = 'visitor' | 'exhibitor' | 'partner' | 'admin' | 'security' | 'service_client';
export type VisitorLevel = 'free' | 'premium' | 'vip' | 'basic';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  type: UserType;
  visitorLevel?: VisitorLevel;
  partnerTier?: string;
  status?: string;
  profile?: Record<string, unknown>;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeCode: string;
  userType: string;
  userLevel?: string;
  fullName: string;
  companyName?: string;
  email: string;
  accessLevel: string;
  validFrom: Date;
  validUntil: Date;
  status: string;
}

export interface Exhibitor {
  id: string;
  userId?: string;
  companyName: string;
  sector: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  standNumber?: string;
  hallNumber?: string;
  logoUrl?: string;
  featured?: boolean;
}

export interface Salon {
  id: string;
  slug?: string;
  code: string;
  name: string;
  description: string;
  dates: string;
  active?: boolean;
  location?: string;
}

export interface SalonEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  capacity?: number;
  registered: number;
  featured: boolean;
  speakerName?: string;
  speakerTitle?: string;
  salonId?: string;
}

export type EventRegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  status: EventRegistrationStatus;
  createdAt: string;
  event?: SalonEvent;
}

export interface Gate {
  id: string;
  name: string;
  zone: string;
  location?: string;
  active: boolean;
}

export interface ZoneCapacity {
  zone: string;
  label: string;
  current: number;
  max: number;
  lastUpdated: string;
}

export interface RgpdConsent {
  accepted: boolean;
  date: string;
  version: string;
}
