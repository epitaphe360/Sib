import { describe, it, expect } from 'vitest';
import { BANNER_KEYS, type BannerKey } from '../../../apps/mobile/src/config/banners';

describe('Mobile — banners config', () => {
  it('clés bannières définies', () => {
    expect(Object.keys(BANNER_KEYS)).toEqual(['urbaevent', 'ministry_egide']);
    expect(BANNER_KEYS.urbaevent).toBe('urbaevent');
  });
});
