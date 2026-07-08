import { describe, it, expect } from 'vitest';
import {
  VISITOR_QUOTAS,
  UNLIMITED_QUOTA,
  getVisitorQuota,
  isUnlimitedQuota,
  calculateRemainingQuota
} from '../../src/config/quotas';

describe('Quotas System', () => {
  describe('VISITOR_QUOTAS', () => {
    it('should have correct quota values (RDV illimités sauf FREE)', () => {
      expect(VISITOR_QUOTAS.free).toBe(0);
      expect(VISITOR_QUOTAS.vip).toBe(UNLIMITED_QUOTA);
      expect(VISITOR_QUOTAS.premium).toBe(UNLIMITED_QUOTA);
      expect(VISITOR_QUOTAS.exhibitor).toBe(UNLIMITED_QUOTA);
      expect(VISITOR_QUOTAS.partner).toBe(UNLIMITED_QUOTA);
    });
  });

  describe('getVisitorQuota', () => {
    it('should return correct quota for valid level', () => {
      expect(getVisitorQuota('free')).toBe(0);
      expect(getVisitorQuota('vip')).toBe(UNLIMITED_QUOTA);
      expect(getVisitorQuota('premium')).toBe(UNLIMITED_QUOTA);
    });

    it('should return 0 for undefined level', () => {
      expect(getVisitorQuota(undefined)).toBe(0);
    });

    it('should return 0 for invalid level', () => {
      expect(getVisitorQuota('invalid')).toBe(0);
    });
  });

  describe('isUnlimitedQuota', () => {
    it('vrai pour vip/premium/exposant, faux pour free', () => {
      expect(isUnlimitedQuota('vip')).toBe(true);
      expect(isUnlimitedQuota('premium')).toBe(true);
      expect(isUnlimitedQuota('exhibitor')).toBe(true);
      expect(isUnlimitedQuota('free')).toBe(false);
      expect(isUnlimitedQuota(undefined)).toBe(false);
    });
  });

  describe('calculateRemainingQuota', () => {
    it('reste illimité pour un niveau illimité', () => {
      expect(calculateRemainingQuota('premium', 2)).toBe(UNLIMITED_QUOTA - 2);
    });

    it('should not return negative values', () => {
      expect(calculateRemainingQuota('free', 10)).toBe(0);
    });

    it('should handle undefined level', () => {
      expect(calculateRemainingQuota(undefined, 0)).toBe(0);
    });
  });
});
