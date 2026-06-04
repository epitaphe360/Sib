import type { UserType } from '../types';

export type RoleRouteGroup = 'visitor' | 'exhibitor' | 'partner' | 'staff';

export function getRoleGroup(type?: UserType | string | null): RoleRouteGroup {
  switch (type) {
    case 'exhibitor':
      return 'exhibitor';
    case 'partner':
      return 'partner';
    case 'admin':
    case 'security':
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
    case 'partner':
      return '/(partner)/(tabs)';
    case 'staff':
      return type === 'security' ? '/(staff)/scanner' : '/(staff)/(tabs)';
    default:
      return '/(visitor)/(tabs)';
  }
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
};
