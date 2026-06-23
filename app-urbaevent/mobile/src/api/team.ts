import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseError';

export type StandCollaborator = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  position: string | null;
  status: string;
  tempPassword: string | null;
  badgeGenerated: boolean;
  createdAt: string;
};

export type OwnerContext = {
  ownerId: string;
  entityId: string;
  companyName: string;
  standNumber?: string;
  ownerType: 'exhibitor';
};

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export async function fetchOwnerContext(userId: string): Promise<OwnerContext | null> {
  const { data } = await supabase
    .from('exhibitors')
    .select('id, company_name, stand_number')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return null;
  return {
    ownerId: userId,
    entityId: data.id as string,
    companyName: (data.company_name as string) ?? '',
    standNumber: (data.stand_number as string) ?? undefined,
    ownerType: 'exhibitor',
  };
}

export async function fetchCollaborators(ownerId: string): Promise<StandCollaborator[]> {
  const { data, error } = await supabase
    .from('stand_collaborators')
    .select('id, first_name, last_name, email, phone, position, status, temp_password, badge_generated, created_at')
    .eq('owner_id', ownerId)
    .neq('status', 'inactive')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? null,
    position: (row.position as string) ?? null,
    status: (row.status as string) ?? 'active',
    tempPassword: (row.temp_password as string) ?? null,
    badgeGenerated: Boolean(row.badge_generated),
    createdAt: row.created_at as string,
  }));
}

export async function createCollaborator(params: {
  context: OwnerContext;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
}): Promise<{ collaborator: StandCollaborator; tempPassword: string }> {
  const emailLower = params.email.toLowerCase().trim();
  const tempPassword = generatePassword();

  const { data: existing } = await supabase
    .from('stand_collaborators')
    .select('id')
    .eq('email', emailLower)
    .maybeSingle();

  if (existing) throw new Error('Cet email est déjà utilisé');

  let authUserId: string | null = null;
  const { data: authData, error: authError } = await supabase.functions.invoke('create-collaborator-account', {
    body: {
      email: emailLower,
      password: tempPassword,
      first_name: params.firstName,
      last_name: params.lastName,
      company_name: params.context.companyName,
      stand_number: params.context.standNumber ?? '',
      owner_id: params.context.ownerId,
      exhibitor_id: params.context.entityId,
    },
  });

  if (authError) {
    throw new Error(
      supabaseErrorMessage(authError, 'Impossible de créer le compte collaborateur. Vérifiez que la fonction est déployée.')
    );
  }
  if (authData?.error) {
    throw new Error(String(authData.error));
  }
  if (authData?.user_id) {
    authUserId = authData.user_id as string;
  }

  const insertPayload: Record<string, unknown> = {
    owner_id: params.context.ownerId,
    owner_type: params.context.ownerType,
    exhibitor_id: params.context.entityId,
    first_name: params.firstName,
    last_name: params.lastName,
    email: emailLower,
    phone: params.phone?.trim() || null,
    position: params.position?.trim() || 'Exposant',
    auth_user_id: authUserId,
    temp_password: tempPassword,
    status: 'active',
    badge_generated: false,
  };

  const { data, error } = await supabase
    .from('stand_collaborators')
    .insert(insertPayload)
    .select('id, first_name, last_name, email, phone, position, status, temp_password, badge_generated, created_at')
    .single();

  if (error) {
    throw new Error(supabaseErrorMessage(error, 'Impossible de créer le collaborateur'));
  }

  let badgeGenerated = Boolean(data.badge_generated);

  if (authUserId) {
    const { error: badgeError } = await supabase.rpc('upsert_user_badge', {
      p_user_id: authUserId,
      p_user_type: 'exhibitor',
      p_user_level: null,
      p_full_name: `${params.firstName} ${params.lastName}`.trim(),
      p_company_name: params.context.companyName,
      p_position: params.position?.trim() || 'Collaborateur',
      p_email: emailLower,
      p_phone: params.phone?.trim() || null,
      p_avatar_url: null,
      p_stand_number: params.context.standNumber ?? null,
    });
    if (badgeError) {
      throw new Error(supabaseErrorMessage(badgeError, 'Collaborateur créé mais badge QR non généré'));
    }
    await supabase.from('stand_collaborators').update({ badge_generated: true }).eq('id', data.id);
    badgeGenerated = true;
  } else {
    throw new Error('Compte collaborateur non créé — vérifiez que create-collaborator-account est déployée');
  }

  return {
    tempPassword,
    collaborator: {
      id: data.id as string,
      firstName: data.first_name as string,
      lastName: data.last_name as string,
      email: data.email as string,
      phone: (data.phone as string) ?? null,
      position: (data.position as string) ?? null,
      status: (data.status as string) ?? 'active',
      tempPassword: (data.temp_password as string) ?? tempPassword,
      badgeGenerated,
      createdAt: data.created_at as string,
    },
  };
}

export async function deactivateCollaborator(id: string): Promise<void> {
  const { error } = await supabase.from('stand_collaborators').update({ status: 'inactive' }).eq('id', id);
  if (error) throw error;
}
