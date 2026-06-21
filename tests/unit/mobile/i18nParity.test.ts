/**
 * Tests — parité i18n mobile (fr / en / ar)
 */
import { describe, it, expect } from 'vitest';
import fr from '../../../apps/mobile/src/i18n/locales/fr.json';
import en from '../../../apps/mobile/src/i18n/locales/en.json';
import ar from '../../../apps/mobile/src/i18n/locales/ar.json';

const REQUIRED_URBEVENT_KEYS = [
  'app.name',
  'salon.gateTitle',
  'salon.gateMessage',
  'salon.enterCta',
  'networking.scanTitle',
  'networking.scanCta',
  'home.urba.chooseSalon',
  'home.hubQuickHint',
  'explore.seeDetails',
  'onboarding.slide1.title',
];

const PLATFORM_KEYS_NO_SIB_HARDCODE = [
  'app.name',
  'explore.title',
  'home.salonsSubtitle',
  'certificate.subtitle',
];

function keysOf(dict: Record<string, string>) {
  return Object.keys(dict).sort();
}

describe('Mobile — i18n parité', () => {
  it('fr et en ont les mêmes clés', () => {
    expect(keysOf(en)).toEqual(keysOf(fr));
  });

  it('fr et ar ont les mêmes clés', () => {
    expect(keysOf(ar)).toEqual(keysOf(fr));
  });

  it('clés UrbaEvent critiques présentes dans les 3 langues', () => {
    for (const key of REQUIRED_URBEVENT_KEYS) {
      expect(fr[key], `fr missing ${key}`).toBeTruthy();
      expect(en[key], `en missing ${key}`).toBeTruthy();
      expect(ar[key], `ar missing ${key}`).toBeTruthy();
    }
  });

  it('app.name = UrbaEvent (pas SIB 2026)', () => {
    expect(fr['app.name']).toBe('UrbaEvent');
    expect(en['app.name']).toBe('UrbaEvent');
    expect(ar['app.name']).toBe('UrbaEvent');
  });

  it('écrans plateforme sans "SIB 2026" hardcodé dans i18n', () => {
    for (const key of PLATFORM_KEYS_NO_SIB_HARDCODE) {
      expect(fr[key]).not.toMatch(/SIB 2026/);
      expect(en[key]).not.toMatch(/SIB 2026/);
      expect(ar[key]).not.toMatch(/SIB 2026/);
    }
  });

  it('aucune clé vide dans fr', () => {
    const empty = Object.entries(fr).filter(([, v]) => !String(v).trim());
    expect(empty).toEqual([]);
  });
});
