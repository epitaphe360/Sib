import { User } from '@/types';

/**
 * Get user display name from various possible fields
 * Priority: firstName+lastName > company > name > email
 */
export function getDisplayName(user: User | null | undefined): string {
  if (!user) return 'Utilisateur';
  
  // Try profile firstName + lastName
  if (user.profile?.firstName || user.profile?.lastName) {
    const firstName = user.profile.firstName || '';
    const lastName = user.profile.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
  }
  
  // Try profile company/companyName
  if (user.profile?.company) return user.profile.company;
  if (user.profile?.companyName) return user.profile.companyName;
  
  // Try user.name
  if (user.name) return user.name;
  
  // Fallback to email
  return user.email || 'Utilisateur';
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) return 'U';
  
  const displayName = getDisplayName(user);
  const parts = displayName.split(' ');
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return displayName.substring(0, 2).toUpperCase();
}

/**
 * Get user company name
 */
export function getUserCompany(user: User | null | undefined): string {
  if (!user) return '';
  
  if (user.profile?.company) return user.profile.company;
  if (user.profile?.companyName) return user.profile.companyName;
  
  return '';
}

/**
 * Get user title/position
 */
export function getUserTitle(user: User | null | undefined): string {
  if (!user) return '';
  
  if (user.profile?.position) return user.profile.position;
  if (user.profile?.title) return user.profile.title;
  
  return '';
}
