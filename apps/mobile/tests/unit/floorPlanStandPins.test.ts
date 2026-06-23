/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import {
  computeStandPins,
  normalizeHall,
  parseStandPinOverrides,
} from '../../src/lib/floorPlanStandPins';
import type { Exhibitor } from '../../src/types';

const ex = (partial: Partial<Exhibitor> & Pick<Exhibitor, 'id' | 'companyName'>): Exhibitor => ({
  sector: 'BTP',
  ...partial,
});

describe('Mobile — floorPlanStandPins', () => {
  describe('normalizeHall', () => {
    it('mappe Hall 1 → A et chiffres 2–5', () => {
      expect(normalizeHall('Hall 1')).toBe('A');
      expect(normalizeHall('hall 2')).toBe('B');
      expect(normalizeHall('3')).toBe('C');
      expect(normalizeHall('4')).toBe('D');
      expect(normalizeHall('5')).toBe('E');
    });
    it('accepte lettres A–E seules', () => {
      expect(normalizeHall('C')).toBe('C');
      expect(normalizeHall('D')).toBe('D');
    });
    it('parse préfixe stand dans hall', () => {
      expect(normalizeHall('A-12')).toBe('A');
      expect(normalizeHall('B_20')).toBe('B');
    });
    it('retourne vide ou premier caractère', () => {
      expect(normalizeHall('')).toBe('');
      expect(normalizeHall(null)).toBe('');
      expect(normalizeHall('XYZ')).toBe('X');
    });
  });

  describe('computeStandPins', () => {
    it('place les exposants dans leur hall', () => {
      const pins = computeStandPins([
        ex({ id: '1', companyName: 'A Co', hallNumber: 'Hall 1', standNumber: 'A-01' }),
        ex({ id: '2', companyName: 'B Co', hallNumber: 'Hall 2', standNumber: 'B-02' }),
      ]);
      expect(pins).toHaveLength(2);
      expect(pins[0].hall).toBe('A');
      expect(pins[1].hall).toBe('B');
      expect(pins[0].x).toBeGreaterThan(0);
      expect(pins[0].x).toBeLessThan(1);
    });

    it('infère hall depuis numéro stand sans hallNumber', () => {
      const pins = computeStandPins([
        ex({ id: '3', companyName: 'C Co', standNumber: 'C-10' }),
      ]);
      expect(pins[0].hall).toBe('C');
    });

    it('ignore exposant sans hall identifiable', () => {
      expect(computeStandPins([ex({ id: 'x', companyName: 'Orphelin' })])).toHaveLength(0);
    });

    it('label stand par défaut si absent', () => {
      const pins = computeStandPins([ex({ id: '4', companyName: 'D Co', hallNumber: 'D' })]);
      expect(pins[0].standLabel).toMatch(/^D\d$/);
    });

    it('tri numérique et stand sans chiffres', () => {
      const pins = computeStandPins([
        ex({ id: 'a', companyName: 'Z', hallNumber: 'E', standNumber: 'ABC' }),
        ex({ id: 'b', companyName: 'Y', hallNumber: 'E', standNumber: 'E-02' }),
      ]);
      expect(pins).toHaveLength(2);
    });

    it('tri exposants sans numéro de stand dans le même hall', () => {
      const pins = computeStandPins([
        ex({ id: 'a', companyName: 'Sans stand A', hallNumber: 'A' }),
        ex({ id: 'b', companyName: 'Sans stand B', hallNumber: 'A' }),
      ]);
      expect(pins).toHaveLength(2);
      expect(pins[0].standLabel).toMatch(/^A\d$/);
    });

    it('ignore stand vide ou sans préfixe hall reconnaissable', () => {
      expect(
        computeStandPins([ex({ id: 'v', companyName: 'Vide', hallNumber: '', standNumber: '   ' })]),
      ).toHaveLength(0);
      expect(
        computeStandPins([ex({ id: 'f', companyName: 'F hall', standNumber: 'F-99' })]),
      ).toHaveLength(0);
    });

    it('hall inconnu utilise bounds fallback', () => {
      const pins = computeStandPins([
        ex({ id: 'z', companyName: 'Z Co', hallNumber: 'Z', standNumber: 'Z-1' }),
      ]);
      expect(pins).toHaveLength(1);
    });

    it('applique overrides par id, label ou clé composée', () => {
      const base = [ex({ id: 'x', companyName: 'X', hallNumber: 'A', standNumber: 'A-1' })];
      expect(computeStandPins(base, { x: { x: 0.5, y: 0.5 } })[0]).toMatchObject({ x: 0.5, y: 0.5 });
      expect(computeStandPins(base, { 'A-1': { x: 0.4, y: 0.4 } })[0]).toMatchObject({ x: 0.4, y: 0.4 });
      expect(computeStandPins(base, { 'A-A-1': { x: 0.3, y: 0.3 } })[0]).toMatchObject({ x: 0.3, y: 0.3 });
    });
  });

  describe('parseStandPinOverrides', () => {
    it('ignore entrées invalides', () => {
      expect(parseStandPinOverrides(null)).toEqual({});
      expect(parseStandPinOverrides('bad')).toEqual({});
      expect(parseStandPinOverrides({ bad: { x: 2, y: 0.5 } })).toEqual({});
      expect(parseStandPinOverrides({ bad: null })).toEqual({});
      expect(parseStandPinOverrides({ bad: { x: 0.5, y: -1 } })).toEqual({});
    });
    it('parse coordonnées valides', () => {
      expect(parseStandPinOverrides({ 'A-12': { x: 0.2, y: 0.3 } })).toEqual({
        'A-12': { x: 0.2, y: 0.3 },
      });
    });
  });
});
