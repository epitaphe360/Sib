export type UserType = 'visitor' | 'exhibitor' | 'partner' | 'admin' | 'security';
export type VisitorLevel = 'free' | 'premium' | 'vip' | 'basic';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  type: UserType;
  visitorLevel?: VisitorLevel;
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
  code: string;
  name: string;
  description: string;
  dates: string;
  active?: boolean;
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
}
