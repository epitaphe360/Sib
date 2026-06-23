/**
 * Tests — résolution URLs logos badge
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveBadgeAssetUrl } from '../../src/lib/badgeAssetUrl';

const ENV = {
  siteUrl: 'https://www.sib2026.ma',
  supabaseUrl: 'https://test.supabase.co',
};

describe('Mobile — badgeConfig resolveBadgeAssetUrl', () => {
  const prevSite = process.env.EXPO_PUBLIC_SITE_URL;
  const prevSb = process.env.EXPO_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_SITE_URL = prevSite;
    process.env.EXPO_PUBLIC_SUPABASE_URL = prevSb;
  });

  it('retourne URL absolue inchangée', () => {
    expect(resolveBadgeAssetUrl('https://cdn.example.com/logo.png', ENV)).toBe(
      'https://cdn.example.com/logo.png',
    );
  });

  it('préfixe chemin relatif avec SITE_URL', () => {
    expect(resolveBadgeAssetUrl('/logo-sib2026.png', ENV)).toBe(
      'https://www.sib2026.ma/logo-sib2026.png',
    );
  });

  it('résout chemin Supabase storage', () => {
    expect(resolveBadgeAssetUrl('media/badge/logo.png', ENV)).toBe(
      'https://test.supabase.co/storage/v1/object/public/media/badge/logo.png',
    );
  });

  it('résout via variables process.env si env vide', () => {
    process.env.EXPO_PUBLIC_SITE_URL = 'https://env.site';
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://env.sb';
    expect(resolveBadgeAssetUrl('/from-env.png')).toBe('https://env.site/from-env.png');
    expect(resolveBadgeAssetUrl('media/x.png')).toBe('https://env.sb/storage/v1/object/public/media/x.png');
  });

  it('résout media/ sans préfixe media/', () => {
    expect(resolveBadgeAssetUrl('badge/x.png', ENV)).toBe(
      'https://test.supabase.co/storage/v1/object/public/media/badge/x.png',
    );
  });

  it('résout brand:// local', () => {
    expect(resolveBadgeAssetUrl('brand://logo-sib2026.png', ENV)).toBe('brand://logo-sib2026.png');
  });

  it('undefined pour chemin relatif sans SITE_URL', () => {
    expect(resolveBadgeAssetUrl('/orphan.png', { siteUrl: '', supabaseUrl: '' })).toBeUndefined();
    expect(resolveBadgeAssetUrl('relative-no-scheme.png', { siteUrl: '', supabaseUrl: '' })).toBe(
      'relative-no-scheme.png',
    );
  });

  it('résout sans env ni process.env', () => {
    delete process.env.EXPO_PUBLIC_SITE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    expect(resolveBadgeAssetUrl('/x.png', {})).toBeUndefined();
    expect(resolveBadgeAssetUrl('file.png', {})).toBe('file.png');
  });

  it('undefined pour entrée vide', () => {
    expect(resolveBadgeAssetUrl('', ENV)).toBeUndefined();
    expect(resolveBadgeAssetUrl(undefined, ENV)).toBeUndefined();
  });
});
