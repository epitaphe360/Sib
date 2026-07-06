import { SALONS, DEFAULT_SALON_ID } from '../data/salons';
import { supabase } from '../lib/supabase';
import { fetchNetworkingContactProfile, fetchNetworkingContactProfiles } from './contactProfiles';

export type VisitorScanEntry = {
  id: string;
  kind: 'networking' | 'stand';
  scannedAt: string;
  salonId?: string;
  salonName?: string;
  salonLabel: string;
  partnerUserId: string;
  partnerName: string;
  partnerEmail?: string;
  partnerType?: string;
  partnerCompany?: string;
  partnerJobTitle?: string;
  status?: string;
};

export type ScannedContactProfile = {
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

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function resolveSalonLabel(salonId?: string, salonName?: string): string {
  if (salonName?.trim()) return salonName.trim();
  const id = salonId ?? DEFAULT_SALON_ID;
  const salon = SALONS.find((s) => s.id === id);
  if (!salon) return 'SIB 2026';
  const place = salon.location ? ` · ${salon.location}` : '';
  return `${salon.name}${place}`;
}

export function buildVisitorScansCsv(entries: VisitorScanEntry[]): string {
  const header = 'Nom,Email,Entreprise,Type scan,Événement,Date,Statut';
  const rows = entries.map((e) =>
    [
      escapeCsv(e.partnerName),
      escapeCsv(e.partnerEmail ?? ''),
      escapeCsv(e.partnerCompany ?? ''),
      escapeCsv(e.kind === 'networking' ? 'Networking' : 'Stand exposant'),
      escapeCsv(e.salonLabel),
      escapeCsv(new Date(e.scannedAt).toISOString()),
      escapeCsv(e.status ?? ''),
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export async function fetchScannedContactProfile(userId: string): Promise<ScannedContactProfile | null> {
  const profile = await fetchNetworkingContactProfile(userId);
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    type: profile.type,
    company: profile.company,
    jobTitle: profile.jobTitle,
    phone: profile.phone,
    standNumber: profile.standNumber,
    sector: profile.sector,
  };
}

export async function fetchVisitorScanHistory(userId: string, limit = 100): Promise<VisitorScanEntry[]> {
  const [connsRes, leadsRes] = await Promise.all([
    supabase
      .from('connections')
      .select('id, requester_id, addressee_id, status, created_at, salon_id, salon_name')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('exhibitor_leads')
      .select('id, exhibitor_user_id, scanned_at, salon_id, salon_name')
      .eq('visitor_user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(limit),
  ]);

  const userIds = new Set<string>();
  for (const c of connsRes.data ?? []) {
    userIds.add(c.requester_id as string);
    userIds.add(c.addressee_id as string);
  }
  for (const l of leadsRes.data ?? []) {
    userIds.add(l.exhibitor_user_id as string);
  }
  userIds.delete(userId);

  const profiles = await fetchNetworkingContactProfiles([...userIds]);

  const entries: VisitorScanEntry[] = [];

  for (const c of connsRes.data ?? []) {
    const otherId = c.requester_id === userId ? c.addressee_id : c.requester_id;
    const profile = profiles.get(otherId as string);
    const salonId = (c.salon_id as string) ?? undefined;
    const salonName = (c.salon_name as string) ?? undefined;
    entries.push({
      id: `conn-${c.id}`,
      kind: 'networking',
      scannedAt: c.created_at as string,
      salonId,
      salonName,
      salonLabel: resolveSalonLabel(salonId, salonName),
      partnerUserId: otherId as string,
      partnerName: profile?.name || 'Contact',
      partnerEmail: profile?.email,
      partnerType: profile?.type,
      partnerCompany: profile?.company,
      partnerJobTitle: profile?.jobTitle,
      status: c.status as string,
    });
  }

  for (const l of leadsRes.data ?? []) {
    const uid = l.exhibitor_user_id as string;
    const profile = profiles.get(uid);
    const salonId = (l.salon_id as string) ?? undefined;
    const salonName = (l.salon_name as string) ?? undefined;
    entries.push({
      id: `lead-${l.id}`,
      kind: 'stand',
      scannedAt: l.scanned_at as string,
      salonId,
      salonName,
      salonLabel: resolveSalonLabel(salonId, salonName),
      partnerUserId: uid,
      partnerName: profile?.name || 'Exposant',
      partnerEmail: profile?.email,
      partnerType: profile?.type ?? 'exhibitor',
      partnerCompany: profile?.company,
      partnerJobTitle: profile?.jobTitle,
      status: 'scanned',
    });
  }

  entries.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  return entries.slice(0, limit);
}

export async function fetchScannerNames(ids: string[]): Promise<Map<string, string>> {
  const profiles = await fetchNetworkingContactProfiles(ids);
  return new Map([...profiles.entries()].map(([id, p]) => [id, p.name]));
}
