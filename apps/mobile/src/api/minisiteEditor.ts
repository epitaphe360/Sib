import { fetchExhibitorStand, type ExhibitorStand } from './minisite';
import { supabase } from '../lib/supabase';
import { supabaseErrorMessage } from '../lib/supabaseError';
import type { MiniSiteSection, MiniSiteSectionType } from '../types/minisite';

const DEFAULT_COLORS = {
  primaryColor: '#1B365D',
  secondaryColor: '#2E5984',
  accentColor: '#5E8FBE',
};

export type MiniSiteEditorDraft = {
  siteId: string | null;
  exhibitorId: string;
  companyName: string;
  published: boolean;
  description: string;
  website: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinkedin: string;
  socialFacebook: string;
  socialInstagram: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  heroCtaText: string;
  heroCtaLink: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutFeatures: string;
  contactSectionTitle: string;
  productsSectionTitle: string;
  galleryTitle: string;
  galleryImages: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

function asStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function findSection(sections: MiniSiteSection[], type: MiniSiteSectionType): MiniSiteSection | undefined {
  return sections.find((s) => s.type === type);
}

function parseSections(raw: unknown): MiniSiteSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === 'object' && typeof (s as MiniSiteSection).type === 'string')
    .map((s, index) => {
      const row = s as MiniSiteSection;
      return {
        id: row.id ?? `${row.type}-${index}`,
        type: row.type,
        title: row.title,
        visible: row.visible !== false,
        order: typeof row.order === 'number' ? row.order : index,
        content: row.content && typeof row.content === 'object' ? { ...row.content } : {},
      };
    });
}

function linesToFeatures(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function featuresToLines(features: unknown): string {
  if (!Array.isArray(features)) return '';
  return features
    .map((f) => (typeof f === 'string' ? f : (f as { name?: string })?.name ?? ''))
    .filter(Boolean)
    .join('\n');
}

function galleryToLines(images: unknown): string {
  if (!Array.isArray(images)) return '';
  return images
    .map((img) => (typeof img === 'string' ? img : (img as { url?: string })?.url ?? ''))
    .filter(Boolean)
    .join('\n');
}

function linesToGallery(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

const MANAGED_SECTION_TYPES: MiniSiteSectionType[] = ['hero', 'about', 'products', 'gallery', 'contact'];

function mergeSections(existing: MiniSiteSection[], built: MiniSiteSection[]): MiniSiteSection[] {
  const preserved = existing.filter((s) => !MANAGED_SECTION_TYPES.includes(s.type));
  return [...built, ...preserved].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function buildSectionsFromDraft(draft: MiniSiteEditorDraft): MiniSiteSection[] {
  const features = linesToFeatures(draft.aboutFeatures);
  const galleryUrls = linesToGallery(draft.galleryImages);

  return [
    {
      id: 'hero',
      type: 'hero',
      title: 'Hero',
      visible: true,
      order: 0,
      content: {
        title: draft.heroTitle.trim() || draft.companyName,
        subtitle: draft.heroSubtitle.trim() || draft.description,
        description: draft.description,
        backgroundImage: draft.heroBackgroundImage.trim() || null,
        ctaText: draft.heroCtaText.trim() || null,
        ctaLink: draft.heroCtaLink.trim() || null,
      },
    },
    {
      id: 'about',
      type: 'about',
      title: 'About',
      visible: true,
      order: 1,
      content: {
        title: draft.aboutTitle.trim() || draft.companyName,
        description: draft.aboutDescription.trim() || draft.description,
        text: draft.aboutDescription.trim() || draft.description,
        features,
      },
    },
    {
      id: 'products',
      type: 'products',
      title: 'Products',
      visible: true,
      order: 2,
      content: {
        title: draft.productsSectionTitle.trim() || 'Produits & Services',
      },
    },
    {
      id: 'gallery',
      type: 'gallery',
      title: 'Gallery',
      visible: galleryUrls.length > 0,
      order: 3,
      content: {
        title: draft.galleryTitle.trim() || 'Galerie',
        images: galleryUrls,
      },
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact',
      visible: true,
      order: 4,
      content: {
        title: draft.contactSectionTitle.trim() || 'Contact',
        email: draft.contactEmail.trim() || null,
        phone: draft.contactPhone.trim() || null,
        address: draft.contactAddress.trim() || null,
        website: draft.website.trim() || null,
      },
    },
  ];
}

function draftFromStandAndSite(stand: ExhibitorStand, site: Record<string, unknown> | null): MiniSiteEditorDraft {
  const sections = parseSections(site?.sections);
  const hero = findSection(sections, 'hero');
  const about = findSection(sections, 'about');
  const productsSection = findSection(sections, 'products');
  const gallerySection = findSection(sections, 'gallery');
  const contact = findSection(sections, 'contact');

  const custom =
    site?.custom_colors && typeof site.custom_colors === 'object'
      ? (site.custom_colors as Record<string, unknown>)
      : {};
  const theme =
    site?.theme && typeof site.theme === 'object' ? (site.theme as Record<string, unknown>) : {};

  const prevContact = contact?.content ?? {};
  const social = stand.social ?? {};

  return {
    siteId: site?.id ? String(site.id) : null,
    exhibitorId: stand.id,
    companyName: stand.companyName,
    published: Boolean(site?.published),
    description: stand.description ?? '',
    website: stand.website ?? asStr(prevContact.website),
    logoUrl: stand.logoUrl ?? '',
    contactEmail: stand.contactEmail ?? asStr(prevContact.email),
    contactPhone: stand.contactPhone ?? asStr(prevContact.phone),
    contactAddress: stand.contactAddress ?? asStr(prevContact.address),
    socialLinkedin: social.linkedin ?? '',
    socialFacebook: social.facebook ?? '',
    socialInstagram: social.instagram ?? '',
    heroTitle: asStr(hero?.content?.title) || stand.companyName,
    heroSubtitle: asStr(hero?.content?.subtitle) || stand.description || '',
    heroBackgroundImage: asStr(hero?.content?.backgroundImage),
    heroCtaText: asStr(hero?.content?.ctaText),
    heroCtaLink: asStr(hero?.content?.ctaLink),
    aboutTitle: asStr(about?.content?.title) || stand.companyName,
    aboutDescription:
      asStr(about?.content?.description) || asStr(about?.content?.text) || stand.description || '',
    aboutFeatures: featuresToLines(about?.content?.features),
    contactSectionTitle: asStr(contact?.content?.title) || 'Contact',
    productsSectionTitle: asStr(productsSection?.content?.title) || 'Produits & Services',
    galleryTitle: asStr(gallerySection?.content?.title) || 'Galerie',
    galleryImages: galleryToLines(gallerySection?.content?.images),
    primaryColor:
      asStr(custom.primaryColor) || asStr(custom.primary) || asStr(theme.primaryColor) || DEFAULT_COLORS.primaryColor,
    secondaryColor:
      asStr(custom.secondaryColor) || asStr(custom.secondary) || asStr(theme.secondaryColor) || DEFAULT_COLORS.secondaryColor,
    accentColor:
      asStr(custom.accentColor) || asStr(custom.accent) || asStr(theme.accentColor) || DEFAULT_COLORS.accentColor,
  };
}

export async function fetchMiniSiteEditor(userId: string): Promise<MiniSiteEditorDraft | null> {
  const stand = await fetchExhibitorStand(userId);
  if (!stand) return null;

  const { data, error } = await supabase
    .from('mini_sites')
    .select('id, sections, published, theme, custom_colors')
    .eq('exhibitor_id', stand.id)
    .maybeSingle();

  if (error && error.code !== '42P01') {
    throw new Error(supabaseErrorMessage(error, 'Impossible de charger le mini-site'));
  }

  return draftFromStandAndSite(stand, (data as Record<string, unknown> | null) ?? null);
}

export async function ensureMiniSiteRow(exhibitorId: string, companyName: string, description: string): Promise<string> {
  const { data: existing } = await supabase
    .from('mini_sites')
    .select('id')
    .eq('exhibitor_id', exhibitorId)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const draft: MiniSiteEditorDraft = {
    siteId: null,
    exhibitorId,
    companyName,
    published: false,
    description,
    website: '',
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    socialLinkedin: '',
    socialFacebook: '',
    socialInstagram: '',
    heroTitle: companyName,
    heroSubtitle: description,
    heroBackgroundImage: '',
    heroCtaText: '',
    heroCtaLink: '',
    aboutTitle: companyName,
    aboutDescription: description,
    aboutFeatures: '',
    contactSectionTitle: 'Contact',
    productsSectionTitle: 'Produits & Services',
    galleryTitle: 'Galerie',
    galleryImages: '',
    ...DEFAULT_COLORS,
  };

  const { data, error } = await supabase
    .from('mini_sites')
    .insert({
      exhibitor_id: exhibitorId,
      sections: buildSectionsFromDraft(draft),
      custom_colors: DEFAULT_COLORS,
      published: false,
    })
    .select('id')
    .single();

  if (error) throw new Error(supabaseErrorMessage(error, 'Impossible de créer le mini-site'));
  return data.id as string;
}

export async function saveMiniSiteEditor(draft: MiniSiteEditorDraft): Promise<{ siteId: string }> {
  const siteId =
    draft.siteId ?? (await ensureMiniSiteRow(draft.exhibitorId, draft.companyName, draft.description));

  const { data: exhibitorRow, error: readError } = await supabase
    .from('exhibitors')
    .select('contact_info')
    .eq('id', draft.exhibitorId)
    .single();

  if (readError) throw new Error(supabaseErrorMessage(readError, 'Stand introuvable'));

  const prevContact =
    exhibitorRow?.contact_info && typeof exhibitorRow.contact_info === 'object'
      ? (exhibitorRow.contact_info as Record<string, unknown>)
      : {};

  const social: Record<string, string> = {};
  if (draft.socialLinkedin.trim()) social.linkedin = draft.socialLinkedin.trim();
  if (draft.socialFacebook.trim()) social.facebook = draft.socialFacebook.trim();
  if (draft.socialInstagram.trim()) social.instagram = draft.socialInstagram.trim();

  const contact_info: Record<string, unknown> = {
    ...prevContact,
    email: draft.contactEmail.trim() || null,
    phone: draft.contactPhone.trim() || null,
    address: draft.contactAddress.trim() || null,
    social,
  };

  const { error: exhibitorError } = await supabase
    .from('exhibitors')
    .update({
      description: draft.description,
      website: draft.website.trim() || null,
      logo_url: draft.logoUrl.trim() || null,
      contact_info,
    })
    .eq('id', draft.exhibitorId);

  if (exhibitorError) throw new Error(supabaseErrorMessage(exhibitorError, 'Sauvegarde stand impossible'));

  const { data: existingSite } = await supabase.from('mini_sites').select('sections').eq('id', siteId).maybeSingle();
  const existingSections = parseSections(existingSite?.sections);
  const sections = mergeSections(existingSections, buildSectionsFromDraft(draft));
  const custom_colors = {
    primaryColor: draft.primaryColor.trim() || DEFAULT_COLORS.primaryColor,
    secondaryColor: draft.secondaryColor.trim() || DEFAULT_COLORS.secondaryColor,
    accentColor: draft.accentColor.trim() || DEFAULT_COLORS.accentColor,
    primary: draft.primaryColor.trim() || DEFAULT_COLORS.primaryColor,
    secondary: draft.secondaryColor.trim() || DEFAULT_COLORS.secondaryColor,
    accent: draft.accentColor.trim() || DEFAULT_COLORS.accentColor,
  };

  const { error: siteError } = await supabase
    .from('mini_sites')
    .update({
      sections,
      custom_colors,
      published: draft.published,
    })
    .eq('id', siteId);

  if (siteError) throw new Error(supabaseErrorMessage(siteError, 'Sauvegarde mini-site impossible'));

  return { siteId };
}
