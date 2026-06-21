import { supabase } from '../lib/supabase';

export type ExhibitorLead = {
  id: string;
  visitorUserId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  companyName: string | null;
  scannedAt: string;
};

export async function fetchExhibitorLeads(exhibitorUserId: string): Promise<ExhibitorLead[]> {
  const { data: rows, error } = await supabase
    .from('exhibitor_leads')
    .select('id, visitor_user_id, scanned_at')
    .eq('exhibitor_user_id', exhibitorUserId)
    .order('scanned_at', { ascending: false })
    .limit(100);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  const leads = rows ?? [];
  if (!leads.length) return [];

  const visitorIds = [...new Set(leads.map((r) => r.visitor_user_id as string))];
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, profile')
    .in('id', visitorIds);

  const userMap = new Map(
    (users ?? []).map((u) => [u.id as string, u as { name?: string; email?: string; profile?: { company?: string } }])
  );

  return leads.map((row) => {
    const u = userMap.get(row.visitor_user_id as string);
    return {
      id: row.id as string,
      visitorUserId: row.visitor_user_id as string,
      visitorName: u?.name ?? null,
      visitorEmail: u?.email ?? null,
      companyName: u?.profile?.company ?? null,
      scannedAt: row.scanned_at as string,
    };
  });
}

/** Export CSV des leads pour partage CRM. */
export function buildLeadsCsv(leads: ExhibitorLead[]): string {
  const header = 'Nom,Email,Entreprise,Date scan';
  const rows = leads.map((l) =>
    [l.visitorName, l.visitorEmail, l.companyName, l.scannedAt]
      .map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}
