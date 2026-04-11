import { describe, it, expect } from 'vitest';
import { PASSWORD_SCHEMA, PHONE_SCHEMA } from '../../src/services/registrationService';

describe('registrationService - Validation', () => {
  describe('PASSWORD_SCHEMA', () => {
    it('should accept a valid strong password', () => {
      const result = PASSWORD_SCHEMA.safeParse('MyStr0ng!Pass');
      expect(result.success).toBe(true);
    });

    it('should reject passwords shorter than 12 characters', () => {
      const result = PASSWORD_SCHEMA.safeParse('Short!1a');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      const result = PASSWORD_SCHEMA.safeParse('nostrongpass1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      const result = PASSWORD_SCHEMA.safeParse('NOSTRONGPASS1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without digits', () => {
      const result = PASSWORD_SCHEMA.safeParse('NoStrongPass!!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      const result = PASSWORD_SCHEMA.safeParse('NoStrongPass12');
      expect(result.success).toBe(false);
    });

    it('should reject passwords longer than 128 characters', () => {
      const longPass = 'Aa1!' + 'x'.repeat(126);
      const result = PASSWORD_SCHEMA.safeParse(longPass);
      expect(result.success).toBe(false);
    });

    it('should accept exactly 12 character valid password', () => {
      const result = PASSWORD_SCHEMA.safeParse('Abcdefgh1!ab');
      expect(result.success).toBe(true);
    });
  });

  describe('PHONE_SCHEMA', () => {
    it('should accept valid international format +212612345678', () => {
      const result = PHONE_SCHEMA.safeParse('+212612345678');
      expect(result.success).toBe(true);
    });

    it('should accept valid format without +', () => {
      const result = PHONE_SCHEMA.safeParse('212612345678');
      expect(result.success).toBe(true);
    });

    it('should accept +33612345678 (France)', () => {
      const result = PHONE_SCHEMA.safeParse('+33612345678');
      expect(result.success).toBe(true);
    });

    it('should reject numbers starting with 0', () => {
      const result = PHONE_SCHEMA.safeParse('0612345678');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = PHONE_SCHEMA.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject strings with letters', () => {
      const result = PHONE_SCHEMA.safeParse('+212abc2345');
      expect(result.success).toBe(false);
    });

    it('should reject too short numbers', () => {
      const result = PHONE_SCHEMA.safeParse('+21');
      expect(result.success).toBe(false);
    });
  });
});
