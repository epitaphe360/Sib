import { describe, it, expect } from 'vitest';
import { badgeLevelLabel, badgeAccessColor } from '../../../apps/mobile/src/lib/badgeDisplay';

describe('Mobile — badge display', () => {
  it('badgeLevelLabel', () => {
    expect(badgeLevelLabel('vip')).toBe('VIP');
    expect(badgeLevelLabel('visitor_premium')).toBe('VIP');
    expect(badgeLevelLabel('premium')).toBe('VIP');
    expect(badgeLevelLabel('visitor_free')).toBe('Gratuit');
    expect(badgeLevelLabel('free')).toBe('Gratuit');
    expect(badgeLevelLabel('exhibitor')).toBe('Exposant');
    expect(badgeLevelLabel('partner')).toBe('Partenaire');
    expect(badgeLevelLabel('admin')).toBe('Administrateur');
    expect(badgeLevelLabel('security')).toBe('Sécurité');
    expect(badgeLevelLabel('standard')).toBe('STANDARD');
    expect(badgeLevelLabel('custom_level')).toBe('CUSTOM_LEVEL');
    expect(badgeLevelLabel(undefined)).toBe('STANDARD');
  });

  it('badgeAccessColor', () => {
    expect(badgeAccessColor('admin')).toBe('#F44336');
    expect(badgeAccessColor('security')).toBe('#FF9800');
    expect(badgeAccessColor('exhibitor')).toBe('#4CAF50');
    expect(badgeAccessColor('vip')).toBe('#FFD700');
    expect(badgeAccessColor('visitor_premium')).toBe('#FFD700');
    expect(badgeAccessColor('partner_gold')).toBe('#FFD700');
    expect(badgeAccessColor('partner_museum')).toBe('#3F51B5');
    expect(badgeAccessColor('partner_silver')).toBe('#9E9E9E');
    expect(badgeAccessColor('partner')).toBe('#0D5C3E');
    expect(badgeAccessColor('unknown')).toBe('#3ECF8E');
  });
});
