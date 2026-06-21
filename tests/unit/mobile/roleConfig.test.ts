/**
 * Tests — navigation par rôle (mobile)
 */
import { describe, it, expect } from 'vitest';
import { getRoleGroup, getHomePath, isRoleAllowed } from '../../../apps/mobile/src/navigation/roleConfig';

describe('Mobile — roleConfig', () => {
  it('mappe chaque type utilisateur au bon groupe', () => {
    expect(getRoleGroup('visitor')).toBe('visitor');
    expect(getRoleGroup('exhibitor')).toBe('exhibitor');
    expect(getRoleGroup('partner')).toBe('visitor');
    expect(getRoleGroup('admin')).toBe('staff');
    expect(getRoleGroup('security')).toBe('staff');
    expect(getRoleGroup('service_client')).toBe('service_client');
    expect(getRoleGroup('marketing')).toBe('staff');
  });

  it('redirige vers le bon écran d\'accueil', () => {
    expect(getHomePath('visitor')).toBe('/(visitor)/(tabs)');
    expect(getHomePath('exhibitor')).toBe('/(exhibitor)/(tabs)');
    expect(getHomePath('partner')).toBe('/(visitor)/(tabs)');
    expect(getHomePath('admin')).toBe('/(staff)/(tabs)');
    expect(getHomePath('security')).toBe('/(staff)/(tabs)/scanner');
    expect(getHomePath('service_client')).toBe('/(service-client)/(tabs)');
  });

  it('isRoleAllowed restreint par groupe de rôle', () => {
    expect(isRoleAllowed('visitor', 'visitor')).toBe(true);
    expect(isRoleAllowed('visitor', 'exhibitor')).toBe(false);
    expect(isRoleAllowed('exhibitor', 'exhibitor')).toBe(true);
    expect(isRoleAllowed('admin', 'staff')).toBe(true);
    expect(isRoleAllowed('visitor', ['visitor', 'exhibitor'])).toBe(true);
    expect(isRoleAllowed('partner', ['visitor'])).toBe(false);
  });
});
