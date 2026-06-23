import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/data/images', () => ({
  SALON_IMAGES: { sib: 1, sir: 2, sip: 3, btp: 4, sie: 5 },
}));

import {
  URBA_PLATFORM_STATS,
  URBA_SOCIAL_LINKS,
  URBA_SALON_THEMES,
  resolveSalonThemeKey,
  getUrbaSalonTheme,
} from '../../src/data/urbaCatalog';

describe('Mobile — urbaCatalog', () => {
  it('stats plateforme', () => {
    expect(URBA_PLATFORM_STATS).toHaveLength(4);
    expect(URBA_SOCIAL_LINKS.length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(URBA_SALON_THEMES)).toEqual(['sib', 'sir', 'sip', 'btp', 'sie']);
  });

  it('resolveSalonThemeKey par slug', () => {
    expect(resolveSalonThemeKey({ id: 'x', slug: 'sib', code: 'SIB' })).toBe('sib');
    expect(resolveSalonThemeKey({ id: 'x', slug: 'sir', code: 'SIR' })).toBe('sir');
  });

  it('resolveSalonThemeKey par code si slug UUID', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(resolveSalonThemeKey({ id: uuid, slug: uuid, code: 'btp' })).toBe('btp');
  });

  it('resolveSalonThemeKey fallback', () => {
    expect(resolveSalonThemeKey({ id: 'custom', slug: 'custom', code: 'CUS' })).toBe('custom');
  });

  it('getUrbaSalonTheme thème connu', () => {
    const theme = getUrbaSalonTheme({ id: 'sib', slug: 'sib', code: 'SIB', name: 'SIB' });
    expect(theme.fullName).toContain('Bâtiment');
    expect(theme.color).toBe('#4598D1');
  });

  it('fallback sib sans slug ni code', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(resolveSalonThemeKey({ id: uuid, slug: '', code: '' })).toBe('sib');
  });

  it('resolveSalonThemeKey par id non-UUID', () => {
    expect(resolveSalonThemeKey({ id: 'sib', slug: '', code: '' })).toBe('sib');
  });

  it('getUrbaSalonTheme fallback avec nom', () => {
    const theme = getUrbaSalonTheme({ id: 'zzz', slug: 'zzz', code: 'ZZZ', name: 'Salon Z' });
    expect(theme.fullName).toBe('Salon Z');
    expect(theme.location).toBe('Maroc');
  });

  it('getUrbaSalonTheme fallback sans nom', () => {
    const theme = getUrbaSalonTheme({ id: 'zzz', slug: 'zzz', code: 'ZZZ', name: '' });
    expect(theme.fullName).toBe('ZZZ');
  });
});
