import { supabase } from '../lib/supabase';

export type NetworkingContactProfile = {
  id: string;
  name: string;
  email?: string;
  type?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  standNumber?: string;
  sector?: string;
};

type RpcRow = {
  id: string;
  name: string;
  email?: string | null;
  user_type?: string | null;
  company?: string | null;
  job_title?: string | null;
  phone?: string | null;
  stand_number?: string | null;
  sector?: string | null;
};

function mapRow(row: RpcRow): NetworkingContactProfile {
  return {
    id: row.id,
    name: row.name || 'Contact',
    email: row.email ?? undefined,
    type: row.user_type ?? undefined,
    company: row.company ?? undefined,
    jobTitle: row.job_title ?? undefined,
    phone: row.phone ?? undefined,
    standNumber: row.stand_number ?? undefined,
    sector: row.sector ?? undefined,
  };
}

/** Profils contacts autorisés (RPC — contourne RLS users pour connexions / scans). */
export async function fetchNetworkingContactProfiles(
  userIds: string[],
): Promise<Map<string, NetworkingContactProfile>> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return new Map();

  const { data, error } = await supabase.rpc('get_networking_contact_profiles', { p_ids: ids });
  if (error) {
    console.warn('[contactProfiles] RPC failed', error.message);
    return new Map();
  }

  return new Map((data as RpcRow[] ?? []).map((row) => [row.id, mapRow(row)]));
}

export async function fetchNetworkingContactProfile(
  userId: string,
): Promise<NetworkingContactProfile | null> {
  const map = await fetchNetworkingContactProfiles([userId]);
  return map.get(userId) ?? null;
}
