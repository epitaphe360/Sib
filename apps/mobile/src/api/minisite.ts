import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseError';

export interface ExhibitorStand {
  id: string;
  companyName: string;
  standNumber?: string;
  hallNumber?: string;
  sector?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  social?: Record<string, string>;
  isPublished?: boolean;
  logoUrl?: string;
}

export interface MiniSiteSummary {
  id: string;
  title?: string;
  isPublished: boolean;
  primaryColor?: string;
}

type ExhibitorRow = Record<string, unknown>;

const EXHIBITOR_SELECT =
  'id, company_name, stand_number, hall_number, sector, description, logo_url, contact_info, website, is_published';

const MINI_SITE_SELECT = 'id, published, theme, custom_colors';

function parseContactInfo(raw: unknown): {
  email?: string;
  phone?: string;
  address?: string;
  social?: Record<string, string>;
} {
  if (!raw || typeof raw !== 'object') return {};
  const c = raw as Record<string, unknown>;
  const socialRaw = c.social;
  const social =
    socialRaw && typeof socialRaw === 'object'
      ? Object.fromEntries(
          Object.entries(socialRaw as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0,
          ),
        )
      : undefined;
  return {
    email: typeof c.email === 'string' ? c.email : undefined,
    phone: typeof c.phone === 'string' ? c.phone : undefined,
    address: typeof c.address === 'string' ? c.address : undefined,
    social,
  };
}

function mapExhibitorRow(data: ExhibitorRow): ExhibitorStand {
  const contact = parseContactInfo(data.contact_info);
  return {
    id: data.id as string,
    companyName: (data.company_name as string) ?? 'Exposant',
    standNumber: (data.stand_number as string) ?? undefined,
    hallNumber: (data.hall_number as string) ?? undefined,
    sector: (data.sector as string) ?? undefined,
    description: (data.description as string) ?? undefined,
    website: (data.website as string) ?? undefined,
    contactEmail: contact.email ?? (data.contact_email as string | undefined),
    contactPhone: contact.phone ?? (data.contact_phone as string | undefined),
    contactAddress: contact.address,
    social: contact.social,
    isPublished: Boolean(data.is_published ?? data.published),
    logoUrl: (data.logo_url as string) ?? undefined,
  };
}

export async function fetchExhibitorStand(userId: string): Promise<ExhibitorStand | null> {
  const { data, error } = await supabase
    .from('exhibitors')
    .select(EXHIBITOR_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(supabaseErrorMessage(error, 'Impossible de charger le stand'));
  if (!data) return null;
  return mapExhibitorRow(data as ExhibitorRow);
}

export async function ensureExhibitorStand(
  userId: string,
  defaults?: { companyName?: string; email?: string }
): Promise<ExhibitorStand> {
  const existing = await fetchExhibitorStand(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('exhibitors')
    .insert({
      user_id: userId,
      company_name: defaults?.companyName ?? 'Mon stand SIB',
      category: 'materials',
      sector: 'BTP',
      description: '',
      contact_info: defaults?.email ? { email: defaults.email } : {},
    })
    .select(EXHIBITOR_SELECT)
    .single();

  if (error) throw new Error(supabaseErrorMessage(error, 'Impossible de créer le stand exposant'));
  return mapExhibitorRow(data as ExhibitorRow);
}

export async function updateExhibitorStandLite(
  exhibitorId: string,
  patch: { description?: string; contactEmail?: string; contactPhone?: string }
): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from('exhibitors')
    .select('contact_info')
    .eq('id', exhibitorId)
    .single();

  if (readError) throw new Error(supabaseErrorMessage(readError, 'Stand introuvable'));

  const prev =
    row?.contact_info && typeof row.contact_info === 'object'
      ? (row.contact_info as Record<string, unknown>)
      : {};

  const contact_info: Record<string, unknown> = { ...prev };
  if (patch.contactEmail !== undefined) contact_info.email = patch.contactEmail.trim() || null;
  if (patch.contactPhone !== undefined) contact_info.phone = patch.contactPhone.trim() || null;

  const updatePayload: Record<string, unknown> = {
    contact_info,
    updated_at: new Date().toISOString(),
  };
  if (patch.description !== undefined) updatePayload.description = patch.description;

  const { error } = await supabase.from('exhibitors').update(updatePayload).eq('id', exhibitorId);
  if (error) throw new Error(supabaseErrorMessage(error, 'Sauvegarde impossible'));

  if (patch.description !== undefined) {
    await syncMiniSiteDescription(exhibitorId, patch.description);
  }
}

async function syncMiniSiteDescription(exhibitorId: string, description: string): Promise<void> {
  const { data: site, error } = await supabase
    .from('mini_sites')
    .select('id, sections')
    .eq('exhibitor_id', exhibitorId)
    .maybeSingle();

  if (error || !site?.id || !Array.isArray(site.sections)) return;

  let changed = false;
  const sections = site.sections.map((raw) => {
    if (!raw || typeof raw !== 'object') return raw;
    const section = { ...(raw as Record<string, unknown>) };
    const type = section.type;
    const content =
      section.content && typeof section.content === 'object'
        ? { ...(section.content as Record<string, unknown>) }
        : {};

    if (type === 'hero' || type === 'about') {
      if (type === 'hero') {
        content.subtitle = description;
        content.description = description;
      } else {
        content.description = description;
        content.text = description;
      }
      section.content = content;
      changed = true;
    }
    return section;
  });

  if (!changed) return;

  await supabase
    .from('mini_sites')
    .update({ sections, updated_at: new Date().toISOString() })
    .eq('id', site.id);
}

export async function fetchMiniSite(userId: string): Promise<MiniSiteSummary | null> {
  const stand = await fetchExhibitorStand(userId);
  if (!stand) return null;

  const { data, error } = await supabase
    .from('mini_sites')
    .select(MINI_SITE_SELECT)
    .eq('exhibitor_id', stand.id)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') return null;
    throw new Error(supabaseErrorMessage(error, 'Impossible de charger le mini-site'));
  }
  if (!data) return null;

  const row = data as ExhibitorRow;
  const theme = row.theme && typeof row.theme === 'object' ? (row.theme as Record<string, unknown>) : {};
  const custom = row.custom_colors && typeof row.custom_colors === 'object'
    ? (row.custom_colors as Record<string, unknown>)
    : {};
  return {
    id: row.id as string,
    title: (theme.title as string) ?? (theme.name as string) ?? undefined,
    isPublished: Boolean(row.published ?? row.is_published),
    primaryColor: (custom.primary as string) ?? (custom.primaryColor as string) ?? (theme.primaryColor as string) ?? undefined,
  };
}

export async function toggleMiniSitePublish(siteId: string, published: boolean): Promise<void> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    published,
  };

  const { error } = await supabase.from('mini_sites').update(payload).eq('id', siteId);
  if (error) throw new Error(supabaseErrorMessage(error, 'Publication impossible'));
}
