import type { AppUser } from '../types';

export function isCollaboratorUser(user: AppUser | null | undefined): boolean {
  if (!user) return false;
  return user.profile?.role === 'collaborator';
}
