import { describe, it, expect } from 'vitest';
import { ROUTES } from '../../src/lib/routes';

describe('routes', () => {
  describe('public routes', () => {
    it('should define HOME route', () => {
      expect(ROUTES.HOME).toBe('/');
    });

    it('should define EXHIBITORS route', () => {
      expect(ROUTES.EXHIBITORS).toBe('/exhibitors');
    });

    it('should define PARTNERS route', () => {
      expect(ROUTES.PARTNERS).toBe('/partners');
    });

    it('should define SPEAKERS route', () => {
      expect(ROUTES.SPEAKERS).toBe('/speakers');
    });

    it('should define PRESS_ACCREDITATION route', () => {
      expect(ROUTES.PRESS_ACCREDITATION).toBe('/press/accreditation');
    });

    it('should define CONTACT route', () => {
      expect(ROUTES.CONTACT).toBe('/contact');
    });

    it('should define VENUE route', () => {
      expect(ROUTES.VENUE).toBe('/venue');
    });

    it('should define ACCOMMODATION route', () => {
      expect(ROUTES.ACCOMMODATION).toBe('/hebergement');
    });
  });

  describe('auth routes', () => {
    it('should define LOGIN route', () => {
      expect(ROUTES.LOGIN).toBe('/login');
    });

    it('should define REGISTER route', () => {
      expect(ROUTES.REGISTER).toBe('/register');
    });

    it('should define FORGOT_PASSWORD route', () => {
      expect(ROUTES.FORGOT_PASSWORD).toBe('/forgot-password');
    });
  });

  describe('admin routes', () => {
    it('should define ADMIN_DASHBOARD route', () => {
      expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin/dashboard');
    });

    it('should define ADMIN_USERS route', () => {
      expect(ROUTES.ADMIN_USERS).toBe('/admin/users');
    });

    it('should define ADMIN_PAYMENT_VALIDATION route', () => {
      expect(ROUTES.ADMIN_PAYMENT_VALIDATION).toBe('/admin/payment-validation');
    });

    it('should define ADMIN_SPEAKERS route', () => {
      expect(ROUTES.ADMIN_SPEAKERS).toBe('/admin/speakers');
    });

    it('should define ADMIN_PRESS_ACCREDITATIONS route', () => {
      expect(ROUTES.ADMIN_PRESS_ACCREDITATIONS).toBe('/admin/press-accreditations');
    });

    it('should define ADMIN_EXHIBITORS route', () => {
      expect(ROUTES.ADMIN_EXHIBITORS).toBeDefined();
    });

    it('should define ADMIN_PARTNERS_MANAGE route', () => {
      expect(ROUTES.ADMIN_PARTNERS_MANAGE).toBeDefined();
    });
  });

  describe('visitor routes', () => {
    it('should define VISITOR_DASHBOARD route', () => {
      expect(ROUTES.VISITOR_DASHBOARD).toBeDefined();
    });

    it('should define VISITOR_PAYMENT route', () => {
      expect(ROUTES.VISITOR_PAYMENT).toBeDefined();
    });

    it('should define VISITOR_VISA_LETTER route', () => {
      expect(ROUTES.VISITOR_VISA_LETTER).toBeDefined();
    });
  });

  describe('media routes', () => {
    it('should define WEBINARS route', () => {
      expect(ROUTES.WEBINARS).toBeDefined();
    });

    it('should define PODCASTS route', () => {
      expect(ROUTES.PODCASTS).toBeDefined();
    });

    it('should define LIVE_STUDIO route', () => {
      expect(ROUTES.LIVE_STUDIO).toBeDefined();
    });

    it('should define MEDIA_LIBRARY route', () => {
      expect(ROUTES.MEDIA_LIBRARY).toBeDefined();
    });
  });

  describe('route consistency', () => {
    it('all routes should be strings', () => {
      Object.values(ROUTES).forEach(route => {
        expect(typeof route).toBe('string');
      });
    });

    it('all routes should start with /', () => {
      Object.values(ROUTES).forEach(route => {
        expect(route.startsWith('/')).toBe(true);
      });
    });

    it('should not have duplicate route values', () => {
      const values = Object.values(ROUTES);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
