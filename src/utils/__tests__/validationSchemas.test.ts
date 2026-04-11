/**
 * Tests for Zod validation schemas
 * Coverage: Email, password, phone, URL, user, product schemas
 */

import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  urlSchema,
  nameSchema,
  descriptionSchema,
  userCreationSchema,
  userUpdateSchema,
  productCreationSchema,
  appointmentCreationSchema,
  validateData,
  validateOrThrow
} from '../validationSchemas';

describe('validationSchemas', () => {
  describe('emailSchema', () => {
    it('should validate correct emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name+tag@example.co.uk').success).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('test@').success).toBe(false);
      expect(emailSchema.safeParse('@example.com').success).toBe(false);
      expect(emailSchema.safeParse('test').success).toBe(false);
    });

    it('should reject emails that are too short', () => {
      expect(emailSchema.safeParse('a@b').success).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(emailSchema.safeParse(longEmail).success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      expect(passwordSchema.safeParse('StrongPass123!').success).toBe(true);
      expect(passwordSchema.safeParse('MyP@ssw0rd123').success).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      expect(passwordSchema.safeParse('weakpass123!').success).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(passwordSchema.safeParse('WEAKPASS123!').success).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(passwordSchema.safeParse('WeakPassword!').success).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(passwordSchema.safeParse('WeakPassword123').success).toBe(false);
    });

    it('should reject passwords that are too short', () => {
      expect(passwordSchema.safeParse('Short1!').success).toBe(false);
    });

    it('should reject passwords that are too long', () => {
      const longPass = 'A1!' + 'a'.repeat(130);
      expect(passwordSchema.safeParse(longPass).success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should validate international phone numbers', () => {
      expect(phoneSchema.safeParse('+33123456789').success).toBe(true);
      expect(phoneSchema.safeParse('+1 (555) 123-4567').success).toBe(true);
      expect(phoneSchema.safeParse('0612345678').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false);
      expect(phoneSchema.safeParse('abc').success).toBe(false);
    });

    it('should reject phone numbers that are too long', () => {
      expect(phoneSchema.safeParse('1'.repeat(25)).success).toBe(false);
    });
  });

  describe('urlSchema', () => {
    it('should validate URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true);
      expect(urlSchema.safeParse('http://sub.domain.example.com/path').success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(urlSchema.safeParse('not-a-url').success).toBe(false);
      expect(urlSchema.safeParse('ftp://example.com').success).toBe(false);
    });

    it('should reject URLs that are too long', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2100);
      expect(urlSchema.safeParse(longUrl).success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('should validate names', () => {
      expect(nameSchema.safeParse('John').success).toBe(true);
      expect(nameSchema.safeParse('Marie-Claire').success).toBe(true);
      expect(nameSchema.safeParse("O'Brien").success).toBe(true);
      expect(nameSchema.safeParse('José').success).toBe(true);
    });

    it('should reject names that are too short', () => {
      expect(nameSchema.safeParse('A').success).toBe(false);
    });

    it('should reject names with invalid characters', () => {
      expect(nameSchema.safeParse('John123').success).toBe(false);
      expect(nameSchema.safeParse('John@').success).toBe(false);
    });

    it('should reject names that are too long', () => {
      expect(nameSchema.safeParse('a'.repeat(101)).success).toBe(false);
    });
  });

  describe('descriptionSchema', () => {
    it('should validate descriptions', () => {
      const validDesc = 'a'.repeat(50);
      expect(descriptionSchema.safeParse(validDesc).success).toBe(true);
    });

    it('should reject descriptions that are too short', () => {
      expect(descriptionSchema.safeParse('Short').success).toBe(false);
    });

    it('should reject descriptions that are too long', () => {
      const longDesc = 'a'.repeat(5001);
      expect(descriptionSchema.safeParse(longDesc).success).toBe(false);
    });
  });

  describe('userCreationSchema', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      type: 'visitor' as const,
      profile: {
        company: 'Test Corp',
        position: 'Developer',
        phone: '+33123456789',
        country: 'France'
      }
    };

    it('should validate complete user data', () => {
      expect(userCreationSchema.safeParse(validUser).success).toBe(true);
    });

    it('should reject user with invalid email', () => {
      expect(userCreationSchema.safeParse({ ...validUser, email: 'invalid' }).success).toBe(false);
    });

    it('should reject user with weak password', () => {
      expect(userCreationSchema.safeParse({ ...validUser, password: 'weak' }).success).toBe(false);
    });

    it('should reject user with invalid type', () => {
      expect(userCreationSchema.safeParse({ ...validUser, type: 'invalid' }).success).toBe(false);
    });

    it('should validate user with minimal profile', () => {
      const minimalUser = {
        ...validUser,
        profile: {
          country: 'France'
        }
      };
      expect(userCreationSchema.safeParse(minimalUser).success).toBe(true);
    });
  });

  describe('userUpdateSchema', () => {
    it('should validate user updates', () => {
      expect(userUpdateSchema.safeParse({ firstName: 'Jane' }).success).toBe(true);
      expect(userUpdateSchema.safeParse({}).success).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(userUpdateSchema.safeParse({ firstName: 'J' }).success).toBe(false);
    });
  });

  describe('productCreationSchema', () => {
    const validProduct = {
      name: 'Test Product',
      description: 'a'.repeat(50),
      category: 'Electronics',
      price: 99.99,
      images: ['https://example.com/image.jpg']
    };

    it('should validate complete product data', () => {
      expect(productCreationSchema.safeParse(validProduct).success).toBe(true);
    });

    it('should reject product with invalid name', () => {
      expect(productCreationSchema.safeParse({ ...validProduct, name: 'AB' }).success).toBe(false);
    });

    it('should reject product with negative price', () => {
      expect(productCreationSchema.safeParse({ ...validProduct, price: -10 }).success).toBe(false);
    });

    it('should reject product with too many images', () => {
      const manyImages = Array(11).fill('https://example.com/image.jpg');
      expect(productCreationSchema.safeParse({ ...validProduct, images: manyImages }).success).toBe(false);
    });

    it('should validate product without optional fields', () => {
      const minimalProduct = {
        name: 'Test Product',
        description: 'a'.repeat(50),
        category: 'Electronics'
      };
      expect(productCreationSchema.safeParse(minimalProduct).success).toBe(true);
    });
  });

  describe('appointmentCreationSchema', () => {
    const validAppointment = {
      exhibitorId: '123e4567-e89b-12d3-a456-426614174000',
      visitorId: '123e4567-e89b-12d3-a456-426614174001',
      timeSlotId: '123e4567-e89b-12d3-a456-426614174002',
      date: new Date().toISOString(),
      notes: 'Test notes'
    };

    it('should validate complete appointment data', () => {
      expect(appointmentCreationSchema.safeParse(validAppointment).success).toBe(true);
    });

    it('should reject appointment with invalid UUID', () => {
      expect(appointmentCreationSchema.safeParse({ ...validAppointment, exhibitorId: 'invalid' }).success).toBe(false);
    });

    it('should reject appointment with invalid date', () => {
      expect(appointmentCreationSchema.safeParse({ ...validAppointment, date: 'invalid' }).success).toBe(false);
    });

    it('should validate appointment without optional notes', () => {
      const { notes, ...minimalAppointment } = validAppointment;
      expect(appointmentCreationSchema.safeParse(minimalAppointment).success).toBe(true);
    });
  });

  describe('validateData helper', () => {
    it('should return success for valid data', () => {
      const result = validateData(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should return errors for invalid data', () => {
      const result = validateData(emailSchema, 'invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('email');
      }
    });
  });

  describe('validateOrThrow helper', () => {
    it('should return data for valid input', () => {
      const result = validateOrThrow(emailSchema, 'test@example.com');
      expect(result).toBe('test@example.com');
    });

    it('should throw error for invalid input', () => {
      expect(() => validateOrThrow(emailSchema, 'invalid')).toThrow('Validation failed');
    });
  });
});
