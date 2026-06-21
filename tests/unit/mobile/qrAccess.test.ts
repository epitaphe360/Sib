import { describe, it, expect, vi } from 'vitest';
import * as partnerTier from '../../../apps/mobile/src/lib/partnerTier';
import { ACCESS_LEVELS, getAccessKey, checkZoneAccess } from '../../../apps/mobile/src/lib/qrAccessLevels';

describe('Mobile — QR access levels', () => {
  it('ACCESS_LEVELS couvre tous les rôles', () => {
    expect(ACCESS_LEVELS.admin.zones).toContain('*');
    expect(ACCESS_LEVELS.visitor_free.zones).toContain('public');
  });

  it('getAccessKey par type', () => {
    expect(getAccessKey({ type: 'admin' })).toBe('admin');
    expect(getAccessKey({ type: 'security' })).toBe('security');
    expect(getAccessKey({ type: 'exhibitor' })).toBe('exhibitor');
    expect(getAccessKey({ type: 'visitor', visitor_level: 'free' })).toBe('visitor_free');
    expect(getAccessKey({ type: 'visitor', visitor_level: 'vip' })).toBe('visitor_premium');
    expect(getAccessKey({ type: 'visitor', status: 'pending_payment' })).toBe('visitor_free');
    expect(getAccessKey({ type: 'partner', partner_tier: 'gold' })).toBe('partner_gold');
    expect(getAccessKey({ type: 'partner', partner_tier: 'bronze' })).toBe('partner_museum');
    expect(getAccessKey({ type: 'partner', partner_tier: 'unknown' })).toBe('partner_museum');
  });

  it('getAccessKey visitor_vip legacy', () => {
    expect(getAccessKey({ type: 'visitor', visitor_level: 'vip' })).toBe('visitor_premium');
  });

  it('partner tier inconnu dans ACCESS_LEVELS', () => {
    vi.spyOn(partnerTier, 'normalizePartnerTierDb').mockReturnValue('invalid' as 'museum');
    expect(getAccessKey({ type: 'partner', partner_tier: 'x' })).toBe('partner_museum');
    vi.restoreAllMocks();
  });

  it('getAccessKey visiteur sans niveau', () => {
    expect(getAccessKey({ type: 'visitor' })).toBe('visitor_free');
  });

  it('checkZoneAccess', () => {
    expect(checkZoneAccess('admin', null, null, 'backstage')).toBe(true);
    expect(checkZoneAccess('visitor', 'free', null, 'public')).toBe(true);
    expect(checkZoneAccess('visitor', 'free', null, 'vip_lounge')).toBe(false);
    expect(checkZoneAccess('visitor', 'vip', null, 'vip_lounge')).toBe(true);
    expect(checkZoneAccess('partner', null, 'gold', 'vip_lounge')).toBe(true);
    expect(checkZoneAccess('exhibitor', null, null, 'backstage')).toBe(true);
  });
});
