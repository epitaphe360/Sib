import { supabase } from './supabase';

export type CollaboratorContext = {
  collaboratorId: string;
  exhibitorId: string;
  ownerId: string;
  companyName: string;
  standNumber?: string;
  position?: string;
};

export async function fetchCollaboratorContext(userId: string): Promise<CollaboratorContext | null> {
  const { data, error } = await supabase
    .from('stand_collaborators')
    .select('id, owner_id, exhibitor_id, position, exhibitors(company_name, stand_number)')
    .eq('auth_user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return null;

  const exhibitor = data.exhibitors as { company_name?: string; stand_number?: string } | null;

  return {
    collaboratorId: data.id as string,
    exhibitorId: data.exhibitor_id as string,
    ownerId: data.owner_id as string,
    companyName: exhibitor?.company_name ?? '',
    standNumber: exhibitor?.stand_number ?? undefined,
    position: (data.position as string) ?? undefined,
  };
}
