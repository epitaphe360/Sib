/**
 * Tests — catalogue salons statiques UrbaEvent
 */
import { describe, it, expect } from 'vitest';
import { SALONS } from '../../src/data/salons';

describe('Mobile — catalogue salons', () => {
  it('contient exactement 5 salons Urbacom', () => {
    expect(SALONS).toHaveLength(5);
    const codes = SALONS.map((s) => s.code);
    expect(codes).toEqual(expect.arrayContaining(['SIB', 'SIR', 'SIP', 'BTP', 'SIE']));
  });

  it('un seul salon actif (SIB 2026) au lancement', () => {
    const active = SALONS.filter((s) => s.active);
    expect(active).toHaveLength(1);
    expect(active[0].code).toBe('SIB');
  });

  it('chaque salon a id, nom et dates', () => {
    for (const salon of SALONS) {
      expect(salon.id).toBeTruthy();
      expect(salon.name).toBeTruthy();
      expect(salon.dates).toBeTruthy();
      expect(salon.description).toBeTruthy();
    }
  });

  it('les salons inactifs n\'ont pas active:true', () => {
    const inactive = SALONS.filter((s) => !s.active);
    expect(inactive.length).toBe(4);
    inactive.forEach((s) => expect(s.active).toBeFalsy());
  });
});
