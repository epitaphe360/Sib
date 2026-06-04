import { supabase } from '../lib/supabase';

export interface ExhibitorStand {
  id: string;
  companyName: string;
  standNumber?: string;
  hallNumber?: string;
  sector?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  isPublished?: boolean;
  logoUrl?: string;
}

export interface MiniSiteSummary {
  id: string;
  title?: string;
  isPublished: boolean;
  primaryColor?: string;
}

export async function fetchExhibitorStand(userId: string): Promise<ExhibitorStand | null> {
  const { data, error } = await supabase
    .from('exhibitors')
    .select('id, company_name, stand_number, hall_number, sector, description, is_published, logo_url, contact_email, contact_phone')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    companyName: data.company_name,
    standNumber: data.stand_number ?? undefined,
    hallNumber: data.hall_number ?? undefined,
    sector: data.sector ?? undefined,
    description: data.description ?? undefined,
    contactEmail: data.contact_email ?? undefined,
    contactPhone: data.contact_phone ?? undefined,
    isPublished: data.is_published ?? false,
    logoUrl: data.logo_url ?? undefined,
  };
}

export async function updateExhibitorStandLite(
  exhibitorId: string,
  patch: { description?: string; contactEmail?: string; contactPhone?: string }
): Promise<void> {
  const { error } = await supabase
    .from('exhibitors')
    .update({
      description: patch.description,
      contact_email: patch.contactEmail,
      contact_phone: patch.contactPhone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', exhibitorId);
  if (error) throw error;
}

export async function fetchMiniSite(userId: string): Promise<MiniSiteSummary | null> {
  const { data, error } = await supabase
    .from('mini_sites')
    .select('id, title, is_published, primary_color')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') return null;
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id,
    title: data.title ?? undefined,
    isPublished: data.is_published ?? false,
    primaryColor: data.primary_color ?? undefined,
  };
}

export async function toggleMiniSitePublish(siteId: string, published: boolean): Promise<void> {
  const { error } = await supabase
    .from('mini_sites')
    .update({ is_published: published, updated_at: new Date().toISOString() })
    .eq('id', siteId);
  if (error) throw error;
}
