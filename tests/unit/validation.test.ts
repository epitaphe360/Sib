import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the validation schemas
describe('Validation Schemas', () => {
  describe('Email validation', () => {
    const emailSchema = z.string().email();

    it('should accept valid emails', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name+tag@example.co.uk')).not.toThrow();
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('invalid')).toThrow();
      expect(() => emailSchema.parse('test@')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
    });
  });

  describe('Password validation', () => {
    const passwordSchema = z.string()
      .min(12, 'Minimum 12 caractères')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir au moins un caractère spécial');

    it('should accept valid passwords', () => {
      expect(() => passwordSchema.parse('ValidPass123!')).not.toThrow();
      expect(() => passwordSchema.parse('SecureP@ssw0rd')).not.toThrow();
    });

    it('should reject short passwords', () => {
      expect(() => passwordSchema.parse('Short1!')).toThrow();
    });

    it('should reject passwords without uppercase', () => {
      expect(() => passwordSchema.parse('lowercase123!')).toThrow();
    });

    it('should reject passwords without special char', () => {
      expect(() => passwordSchema.parse('NoSpecialChar123')).toThrow();
    });
  });

  describe('Phone validation', () => {
    const phoneSchema = z.string().min(8, 'Numéro de téléphone requis');

    it('should accept valid phone numbers', () => {
      expect(() => phoneSchema.parse('0612345678')).not.toThrow();
      expect(() => phoneSchema.parse('+33612345678')).not.toThrow();
    });

    it('should reject short phone numbers', () => {
      expect(() => phoneSchema.parse('123')).toThrow();
    });
  });
});
