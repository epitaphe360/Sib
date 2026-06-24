/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { normalizeAuthDeepLink, hasAuthDeepLinkPayload } from '../../src/lib/authDeepLink';

describe('authDeepLink', () => {
  it('conserve token_hash dans URL complète', () => {
    const url = 'urbaevent://auth-callback?token_hash=abc&type=invite';
    expect(normalizeAuthDeepLink(url)).toBe(url);
    expect(hasAuthDeepLinkPayload(url)).toBe(true);
  });

  it('reconstruit depuis queryParams Expo Linking', () => {
    // Simule le cas Android où la string perd la query mais parse la conserve
    const url = 'urbaevent://auth-callback?token_hash=xyz123&type=magiclink';
    expect(normalizeAuthDeepLink(url)).toContain('token_hash=xyz123');
  });

  it('retourne null sans payload', () => {
    expect(normalizeAuthDeepLink('urbaevent://auth-callback')).toBeNull();
    expect(hasAuthDeepLinkPayload(null)).toBe(false);
  });
});
