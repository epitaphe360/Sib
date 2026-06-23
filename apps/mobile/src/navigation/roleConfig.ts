import { isCollaboratorUser } from '../lib/collaboratorRole';
import type { AppUser, UserType } from '../types';

export type RoleRouteGroup = 'visitor' | 'exhibitor' | 'staff' | 'service_client';

export function getRoleGroup(type?: UserType | string | null): RoleRouteGroup {
  switch (type) {
    case 'exhibitor':
      return 'exhibitor';
    case 'partner':
      // Pas d'espace partenaire sur mobile — même parcours que visiteur
      return 'visitor';
    case 'admin':
    case 'security':
      return 'staff';
    case 'service_client':
      return 'service_client';
    case 'marketing':
      return 'staff';
    default:
      return 'visitor';
  }
}

export function getHomePath(type?: UserType | string | null): string {
  const group = getRoleGroup(type);
  switch (group) {
    case 'exhibitor':
      return '/(exhibitor)/(tabs)';
    case 'staff':
      return type === 'security' ? '/(staff)/(tabs)/scanner' : '/(staff)/(tabs)';
    case 'service_client':
      return '/(service-client)/(tabs)';
    default:
      return '/(visitor)/(tabs)';
  }
}

/** Route d'accueil selon le profil complet (collaborateur → badge visiteur). */
export function getHomePathForUser(user: AppUser): string {
  if (isCollaboratorUser(user)) {
    return '/(visitor)/(tabs)/badge';
  }
  return getHomePath(user.type);
}

/** Groupe de navigation effectif (collaborateur exposant → parcours visiteur). */
export function getRouteGroupForUser(user: AppUser): RoleRouteGroup {
  if (isCollaboratorUser(user)) return 'visitor';
  return getRoleGroup(user.type);
}

export function isRoleAllowed(
  userType: UserType | string | undefined,
  allowed: UserType[] | RoleRouteGroup
): boolean {
  if (Array.isArray(allowed)) {
    return allowed.includes(userType as UserType);
  }
  return getRoleGroup(userType) === allowed;
}

export const ROLE_LABELS: Record<UserType, string> = {
  visitor: 'Visiteur',
  exhibitor: 'Exposant',
  partner: 'Partenaire',
  admin: 'Organisation',
  security: 'Sécurité',
  service_client: 'Service Clientèle',
};
