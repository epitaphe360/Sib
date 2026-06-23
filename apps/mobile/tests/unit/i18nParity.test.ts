import { describe, expect, it } from 'vitest';
import fr from '../../src/i18n/locales/fr.json';
import en from '../../src/i18n/locales/en.json';
import ar from '../../src/i18n/locales/ar.json';

const frDict: Record<string, string> = fr;
const enDict: Record<string, string> = en;
const arDict: Record<string, string> = ar;

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

describe('Mobile — parité i18n', () => {
  it('fr et en ont les mêmes clés', () => {
    expect(keysOf(enDict)).toEqual(keysOf(frDict));
  });

  it('fr et ar ont les mêmes clés', () => {
    expect(keysOf(arDict)).toEqual(keysOf(frDict));
  });

  it('clés UrbaEvent critiques présentes dans les 3 langues', () => {
    for (const key of REQUIRED_URBEVENT_KEYS) {
      expect(frDict[key], `fr missing ${key}`).toBeTruthy();
      expect(enDict[key], `en missing ${key}`).toBeTruthy();
      expect(arDict[key], `ar missing ${key}`).toBeTruthy();
    }
  });

  it('app.name = UrbaEvent', () => {
    expect(frDict['app.name']).toBe('UrbaEvent');
    expect(enDict['app.name']).toBe('UrbaEvent');
    expect(arDict['app.name']).toBe('UrbaEvent');
  });

  it('écrans plateforme sans "SIB 2026" hardcodé dans i18n', () => {
    for (const key of PLATFORM_KEYS_NO_SIB_HARDCODE) {
      expect(frDict[key]).not.toMatch(/SIB 2026/);
      expect(enDict[key]).not.toMatch(/SIB 2026/);
      expect(arDict[key]).not.toMatch(/SIB 2026/);
    }
  });

  it('aucune clé vide dans fr', () => {
    const empty = Object.entries(frDict).filter(([, value]) => !String(value).trim());
    expect(empty).toEqual([]);
  });
});
