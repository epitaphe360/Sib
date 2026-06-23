import { describe, it, expect } from 'vitest';
import {
  BRAND_COLORS,
  PLAY_STORE_URL,
  getBrandLogoSource,
  getBadgeLogoSource,
  BADGE_LOGO_LOCAL,
} from '../../../../apps/mobile/src/config/brandAssets';

describe('Mobile — brandAssets', () => {
  it('constantes marque', () => {
    expect(BRAND_COLORS.primary).toBe('#1B365D');
    expect(PLAY_STORE_URL).toContain('com.urbacom.urbaevent');
    expect(Object.keys(BADGE_LOGO_LOCAL)).toEqual(['logo-sib2026', 'logo-ministere']);
  });

  it('getBrandLogoSource HTTP ou local', () => {
    expect(getBrandLogoSource('https://cdn.test/logo.png')).toEqual({ uri: 'https://cdn.test/logo.png' });
    expect(getBrandLogoSource(null)).toBeTruthy();
  });

  it('getBadgeLogoSource brand://', () => {
    expect(getBadgeLogoSource('brand://logo-sib2026.png')).toBe(BADGE_LOGO_LOCAL['logo-sib2026']);
    expect(getBadgeLogoSource('brand://logo-ministere.png')).toBe(BADGE_LOGO_LOCAL['logo-ministere']);
    expect(getBadgeLogoSource('/logo-sib2026.png')).toBe(BADGE_LOGO_LOCAL['logo-sib2026']);
    expect(getBadgeLogoSource('https://cdn.test/x.png')).toEqual({ uri: 'https://cdn.test/x.png' });
    expect(getBadgeLogoSource('')).toBeNull();
    expect(getBadgeLogoSource('unknown.png')).toBeTruthy();
  });
});
