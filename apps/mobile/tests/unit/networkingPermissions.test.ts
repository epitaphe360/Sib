/**
 * Tests — permissions réseautage UrbaEvent mobile (couverture 100 %)
 */
import { describe, it, expect, vi } from 'vitest';
import * as partnerTier from '../../src/lib/partnerTier';
import {
  getNetworkingPermissions,
  checkDailyLimits,
  normalizeVisitorPass,
  getPermissionErrorMessage,
} from '../../src/lib/networkingPermissions';

describe('Mobile — networkingPermissions', () => {
  describe('normalizeVisitorPass', () => {
    it('premium et vip → premium', () => {
      expect(normalizeVisitorPass('premium')).toBe('premium');
      expect(normalizeVisitorPass('vip')).toBe('premium');
    });
    it('null/undefined/free → free', () => {
      expect(normalizeVisitorPass(null)).toBe('free');
      expect(normalizeVisitorPass(undefined)).toBe('free');
      expect(normalizeVisitorPass('free')).toBe('free');
    });
  });

  describe('staff (admin, security, service_client)', () => {
    it('admin illimité', () => {
      const p = getNetworkingPermissions('admin');
      expect(p.maxConnectionsPerDay).toBe(-1);
      expect(p.canBypassQueue).toBe(true);
    });
    it('security illimité', () => {
      expect(getNetworkingPermissions('security').canAccessAnalytics).toBe(true);
    });
    it('service_client illimité', () => {
      expect(getNetworkingPermissions('service_client').canSendMessages).toBe(true);
    });
  });

  describe('partenaire par tier', () => {
    it('bronze', () => {
      const p = getNetworkingPermissions('partner', 'museum');
      expect(p.canAccessVIPLounge).toBe(false);
      expect(p.canAccessAnalytics).toBe(false);
      expect(p.maxConnectionsPerDay).toBe(50);
    });
    it('silver', () => {
      const p = getNetworkingPermissions('partner', 'silver');
      expect(p.canAccessVIPLounge).toBe(true);
      expect(p.maxConnectionsPerDay).toBe(75);
    });
    it('gold', () => {
      const p = getNetworkingPermissions('partner', 'gold');
      expect(p.canBypassQueue).toBe(true);
      expect(p.maxConnectionsPerDay).toBe(100);
    });
    it('platinum', () => {
      const p = getNetworkingPermissions('partner', 'platinium');
      expect(p.canBypassQueue).toBe(true);
      expect(p.maxConnectionsPerDay).toBe(150);
    });
    it('tier invalide → multiplicateur défaut', () => {
      vi.spyOn(partnerTier, 'partnerTierForNetworking').mockReturnValue('invalid' as 'bronze');
      const p = getNetworkingPermissions('partner', 'x');
      expect(p.maxConnectionsPerDay).toBe(50);
      vi.restoreAllMocks();
    });
  });

  describe('exposant par statut', () => {
    it('basic sans userLevel explicite', () => {
      const p = getNetworkingPermissions('exhibitor');
      expect(p.maxConnectionsPerDay).toBe(20);
    });
    it('basic', () => {
      const p = getNetworkingPermissions('exhibitor', 'basic');
      expect(p.canAccessPremiumFeatures).toBe(false);
      expect(p.maxConnectionsPerDay).toBe(20);
    });
    it('premium', () => {
      const p = getNetworkingPermissions('exhibitor', 'premium');
      expect(p.canAccessPremiumFeatures).toBe(true);
      expect(p.maxConnectionsPerDay).toBe(30);
    });
    it('platinum', () => {
      const p = getNetworkingPermissions('exhibitor', 'platinum');
      expect(p.canAccessVIPLounge).toBe(true);
      expect(p.canBypassQueue).toBe(true);
    });
    it('statut inconnu → basic', () => {
      const p = getNetworkingPermissions('exhibitor', 'unknown' as 'basic');
      expect(p.maxConnectionsPerDay).toBe(20);
    });
    it('multiplicateur exposant défaut', () => {
      const p = getNetworkingPermissions('exhibitor', 'weird' as 'premium');
      expect(p.maxConnectionsPerDay).toBe(20);
    });
  });

  describe('visiteur gratuit — scan-to-connect', () => {
    const perms = getNetworkingPermissions('visitor', 'free');
    it('peut accéder au réseautage limité', () => {
      expect(perms.canAccessNetworking).toBe(true);
    });
    it('peut créer des connexions par scan', () => {
      expect(perms.canMakeConnections).toBe(true);
      expect(perms.maxConnectionsPerDay).toBe(20);
    });
    it('ne peut pas envoyer de messages', () => {
      expect(perms.canSendMessages).toBe(false);
    });
    it('peut planifier des RDV (max 5/jour)', () => {
      expect(perms.canScheduleMeetings).toBe(true);
      expect(perms.maxMeetingsPerDay).toBe(5);
    });
  });

  describe('visiteur VIP', () => {
    const perms = getNetworkingPermissions('visitor', 'premium');
    it('accès réseautage complet', () => {
      expect(perms.canSendMessages).toBe(true);
      expect(perms.canAccessVIPLounge).toBe(true);
      expect(perms.maxConnectionsPerDay).toBe(1000);
    });
  });

  describe('type inconnu', () => {
    it('permissions de base', () => {
      const p = getNetworkingPermissions('unknown' as 'visitor');
      expect(p.canAccessNetworking).toBe(false);
    });
  });

  describe('checkDailyLimits', () => {
    it('bloque connexion quand quota atteint', () => {
      const limits = checkDailyLimits('visitor', 'free', { connections: 20, messages: 0, meetings: 0 });
      expect(limits.canMakeConnection).toBe(false);
      expect(limits.remainingConnections).toBe(0);
    });
    it('autorise RDV sous le quota', () => {
      const limits = checkDailyLimits('visitor', 'free', { connections: 0, messages: 0, meetings: 3 });
      expect(limits.canScheduleMeeting).toBe(true);
      expect(limits.remainingMeetings).toBe(2);
    });
    it('admin illimité (-1)', () => {
      const limits = checkDailyLimits('admin', undefined, { connections: 9999, messages: 9999, meetings: 9999 });
      expect(limits.canMakeConnection).toBe(true);
      expect(limits.remainingConnections).toBe(-1);
    });
    it('bloque messages au quota', () => {
      const limits = checkDailyLimits('exhibitor', 'basic', { connections: 0, messages: 50, meetings: 0 });
      expect(limits.canSendMessage).toBe(false);
    });
  });

  describe('getPermissionErrorMessage', () => {
    it('visiteur gratuit connexion', () => {
      const msg = getPermissionErrorMessage('visitor', 'free', 'connection');
      expect(msg).toContain('VIP');
      expect(msg).toContain('scanner');
    });
    it('visiteur gratuit meeting', () => {
      const msg = getPermissionErrorMessage('visitor', 'free', 'meeting');
      expect(msg).toContain('Limite quotidienne');
    });
    it('sans accès réseautage', () => {
      const msg = getPermissionErrorMessage('unknown' as 'visitor', undefined, 'message');
      expect(msg).toContain("pas accès");
    });
    it('message quota exposant', () => {
      expect(getPermissionErrorMessage('exhibitor', 'basic', 'message')).toContain('messages');
    });
    it('connection quota', () => {
      expect(getPermissionErrorMessage('exhibitor', 'basic', 'connection')).toContain('connexions');
    });
    it('meeting quota exposant', () => {
      expect(getPermissionErrorMessage('exhibitor', 'basic', 'meeting')).toContain('rendez-vous');
    });
    it('action inconnue', () => {
      expect(getPermissionErrorMessage('exhibitor', 'basic', 'other')).toContain('pas disponible');
    });
  });
});
