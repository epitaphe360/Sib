import { supabase } from '../lib/supabase';
import type {
  MiniSiteExhibitor,
  MiniSiteProduct,
  MiniSitePublic,
  MiniSitePublicData,
  MiniSiteSection,
  MiniSiteTheme,
} from '../types/minisite';

const DEFAULT_THEME: MiniSiteTheme = {
  primaryColor: '#1B365D',
  secondaryColor: '#2E5984',
  accentColor: '#5E8FBE',
  fontFamily: 'Inter',
};

type MiniSiteRow = Record<string, unknown>;
type ExhibitorRow = Record<string, unknown>;
type ProductRow = Record<string, unknown>;

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function asBool(v: unknown): boolean {
  return v === true;
}

function parseTheme(row: MiniSiteRow): MiniSiteTheme {
  const custom = row.custom_colors;
  if (custom && typeof custom === 'object') {
    const c = custom as Record<string, unknown>;
    return {
      primaryColor: asString(c.primary) ?? asString(c.primaryColor) ?? DEFAULT_THEME.primaryColor,
      secondaryColor: asString(c.secondary) ?? asString(c.secondaryColor) ?? DEFAULT_THEME.secondaryColor,
      accentColor: asString(c.accent) ?? asString(c.accentColor) ?? DEFAULT_THEME.accentColor,
      fontFamily: asString(c.fontFamily) ?? DEFAULT_THEME.fontFamily,
    };
  }
  const primary = asString(row.primary_color);
  if (primary) {
    return { ...DEFAULT_THEME, primaryColor: primary, accentColor: primary };
  }
  const theme = row.theme;
  if (theme && typeof theme === 'object') {
    const t = theme as Record<string, unknown>;
    return {
      primaryColor: asString(t.primaryColor) ?? DEFAULT_THEME.primaryColor,
      secondaryColor: asString(t.secondaryColor) ?? DEFAULT_THEME.secondaryColor,
      accentColor: asString(t.accentColor) ?? DEFAULT_THEME.accentColor,
      fontFamily: asString(t.fontFamily) ?? DEFAULT_THEME.fontFamily,
    };
  }
  return DEFAULT_THEME;
}

function parseSections(raw: unknown): MiniSiteSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === 'object')
    .map((s) => {
      const row = s as Record<string, unknown>;
      return {
        id: asString(row.id),
        type: asString(row.type) as MiniSiteSection['type'],
        title: asString(row.title),
        visible: row.visible !== false,
        order: typeof row.order === 'number' ? row.order : 0,
        content: row.content && typeof row.content === 'object' ? (row.content as Record<string, unknown>) : {},
      };
    })
    .filter((s) => s.type)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function mapMiniSiteRow(row: MiniSiteRow): MiniSitePublic {
  const published = asBool(row.published) || asBool(row.is_published);
  return {
    id: asString(row.id) ?? `default-${asString(row.exhibitor_id)}`,
    exhibitorId: asString(row.exhibitor_id) ?? '',
    logoUrl: asString(row.logo_url),
    published,
    views: typeof row.view_count === 'number' ? row.view_count : typeof row.views === 'number' ? row.views : 0,
    lastUpdated: asString(row.updated_at) ?? asString(row.created_at) ?? new Date().toISOString(),
    theme: parseTheme(row),
    sections: parseSections(row.sections),
  };
}

function mapExhibitorRow(row: ExhibitorRow): MiniSiteExhibitor {
  const contact = row.contact_info && typeof row.contact_info === 'object'
    ? (row.contact_info as Record<string, unknown>)
    : {};
  const social = contact.social && typeof contact.social === 'object'
    ? (contact.social as Record<string, string>)
    : {};

  return {
    id: asString(row.id) ?? '',
    companyName: asString(row.company_name) ?? 'Exposant',
    logoUrl: asString(row.logo_url),
    description: asString(row.description),
    website: asString(row.website),
    standNumber: asString(row.stand_number),
    hallNumber: asString(row.hall_number),
    sector: asString(row.sector),
    contactInfo: {
      email: asString(contact.email) ?? asString(row.contact_email),
      phone: asString(contact.phone) ?? asString(row.contact_phone),
      address: asString(contact.address),
      social,
    },
  };
}

function mapProductRow(row: ProductRow): MiniSiteProduct {
  const images = Array.isArray(row.images) ? row.images.filter((i) => typeof i === 'string') as string[] : [];
  const features = Array.isArray(row.features) ? row.features.filter((f) => typeof f === 'string') as string[] : [];
  return {
    id: asString(row.id) ?? '',
    name: asString(row.name) ?? 'Produit',
    description: asString(row.description) ?? '',
    category: asString(row.category),
    images,
    price: row.price as string | number | undefined,
    specifications: asString(row.specifications),
    featured: row.featured === true,
    features,
  };
}

async function resolveExhibitorIds(exhibitorId: string): Promise<string[]> {
  const ids = new Set<string>([exhibitorId]);
  const { data: byId } = await supabase
    .from('exhibitors')
    .select('id, user_id')
    .eq('id', exhibitorId)
    .maybeSingle();
  if (byId?.user_id) ids.add(byId.user_id);
  if (byId?.id) ids.add(byId.id);

  const { data: byUser } = await supabase
    .from('exhibitors')
    .select('id, user_id')
    .eq('user_id', exhibitorId)
    .maybeSingle();
  if (byUser?.id) ids.add(byUser.id);
  if (byUser?.user_id) ids.add(byUser.user_id);

  return [...ids];
}

async function fetchMiniSiteRow(exhibitorId: string): Promise<MiniSiteRow | null> {
  const ids = await resolveExhibitorIds(exhibitorId);
  for (const id of ids) {
    const { data, error } = await supabase.from('mini_sites').select('*').eq('exhibitor_id', id).maybeSingle();
    if (error && error.code !== '42P01') throw error;
    if (data) return data as MiniSiteRow;
  }
  return null;
}

async function fetchExhibitorRow(exhibitorId: string): Promise<ExhibitorRow | null> {
  const { data: byId } = await supabase
    .from('exhibitors')
    .select('id, company_name, logo_url, description, website, contact_info, stand_number, hall_number, sector')
    .eq('id', exhibitorId)
    .maybeSingle();
  if (byId) return byId as ExhibitorRow;

  const { data: byUser } = await supabase
    .from('exhibitors')
    .select('id, company_name, logo_url, description, website, contact_info, stand_number, hall_number, sector')
    .eq('user_id', exhibitorId)
    .maybeSingle();
  return (byUser as ExhibitorRow | null) ?? null;
}

async function fetchProductsForExhibitor(exhibitorId: string): Promise<MiniSiteProduct[]> {
  const ids = await resolveExhibitorIds(exhibitorId);
  for (const id of ids) {
    const { data, error } = await supabase.from('products').select('*').eq('exhibitor_id', id);
    if (error) continue;
    if (data?.length) return data.map((r) => mapProductRow(r as ProductRow));
  }
  return [];
}

function buildDefaultMiniSite(exhibitor: MiniSiteExhibitor): MiniSitePublic {
  return {
    id: `default-${exhibitor.id}`,
    exhibitorId: exhibitor.id,
    logoUrl: exhibitor.logoUrl,
    published: true,
    views: 0,
    lastUpdated: new Date().toISOString(),
    theme: DEFAULT_THEME,
    sections: [],
  };
}

export async function fetchMiniSitePublic(
  exhibitorId: string,
  options?: { includeUnpublished?: boolean },
): Promise<MiniSitePublicData | null> {
  const [siteRow, exhibitorRow] = await Promise.all([
    fetchMiniSiteRow(exhibitorId),
    fetchExhibitorRow(exhibitorId),
  ]);

  if (!exhibitorRow) return null;

  const exhibitor = mapExhibitorRow(exhibitorRow);
  const productIds = [exhibitor.id, exhibitorId, ...(await resolveExhibitorIds(exhibitorId))];
  const uniqueIds = [...new Set(productIds)];

  let products: MiniSiteProduct[] = [];
  for (const id of uniqueIds) {
    products = await fetchProductsForExhibitor(id);
    if (products.length) break;
  }

  let miniSite: MiniSitePublic;
  if (siteRow) {
    miniSite = mapMiniSiteRow(siteRow);
    if (!options?.includeUnpublished && !miniSite.published) {
      return null;
    }
  } else {
    miniSite = buildDefaultMiniSite(exhibitor);
  }

  return { miniSite, exhibitor, products };
}

export async function incrementMiniSiteViews(exhibitorId: string): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('minisite_views').insert({
      exhibitor_id: exhibitorId,
      viewer_id: userData?.user?.id ?? null,
      viewed_at: new Date().toISOString(),
    });
    await supabase.rpc('increment_minisite_views', { p_exhibitor_id: exhibitorId });
  } catch {
    // Analytics optionnelles
  }
}
