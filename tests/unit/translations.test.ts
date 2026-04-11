import { describe, it, expect } from 'vitest';
import { allTranslations } from '../../src/store/translations';

describe('translations', () => {
  describe('structure', () => {
    it('should export an allTranslations object', () => {
      expect(allTranslations).toBeDefined();
      expect(typeof allTranslations).toBe('object');
    });

    it('should have French translations', () => {
      expect(allTranslations.fr).toBeDefined();
      expect(Object.keys(allTranslations.fr).length).toBeGreaterThan(100);
    });

    it('should have English translations', () => {
      expect(allTranslations.en).toBeDefined();
      expect(Object.keys(allTranslations.en).length).toBeGreaterThan(100);
    });

    it('should have Arabic translations', () => {
      expect(allTranslations.ar).toBeDefined();
      expect(Object.keys(allTranslations.ar).length).toBeGreaterThan(10);
    });
  });

  describe('French translations', () => {
    it('should have nav keys', () => {
      expect(allTranslations.fr['nav.home']).toBe('Accueil');
      expect(allTranslations.fr['nav.exhibitors']).toBeDefined();
      expect(allTranslations.fr['nav.partners']).toBeDefined();
    });

    it('should have hero keys', () => {
      expect(allTranslations.fr['hero.title']).toBeDefined();
      expect(allTranslations.fr['hero.subtitle']).toBeDefined();
    });

    it('should have auth keys', () => {
      expect(allTranslations.fr['auth.email']).toBeDefined();
    });

    it('should have common keys', () => {
      expect(allTranslations.fr['common.back']).toBeDefined();
      expect(allTranslations.fr['common.save']).toBeDefined();
    });

    it('should have admin keys', () => {
      expect(allTranslations.fr['admin.dashboard']).toBeDefined();
    });
  });

  describe('English translations', () => {
    it('should have nav keys', () => {
      expect(allTranslations.en['nav.home']).toBe('Home');
    });

    it('should have hero keys', () => {
      expect(allTranslations.en['hero.title']).toBeDefined();
    });

    it('should have common keys', () => {
      expect(allTranslations.en['common.back']).toBeDefined();
    });
  });

  describe('Arabic translations', () => {
    it('should have nav keys', () => {
      expect(allTranslations.ar['nav.home']).toBe('الرئيسية');
      expect(allTranslations.ar['nav.exhibitors']).toBe('العارضون');
      expect(allTranslations.ar['nav.partners']).toBe('الشركاء');
    });

    it('should have hero keys', () => {
      expect(allTranslations.ar['hero.title']).toBe('الصالون الدولي للبناء');
    });

    it('should have common keys', () => {
      expect(allTranslations.ar['common.back']).toBe('رجوع');
      expect(allTranslations.ar['common.save']).toBe('حفظ');
    });

    it('should have footer keys', () => {
      expect(allTranslations.ar['footer.all_rights']).toBe('جميع الحقوق محفوظة');
    });

    it('should have admin keys', () => {
      expect(allTranslations.ar['admin.dashboard']).toBe('لوحة الإدارة');
    });
  });

  describe('translation keys consistency', () => {
    it('core AR keys should exist in FR as well', () => {
      const coreKeys = ['nav.home', 'nav.exhibitors', 'nav.partners', 'common.back', 'common.save', 'hero.title'];
      coreKeys.forEach(key => {
        expect(
          allTranslations.fr[key],
          `Key "${key}" in AR but missing in FR`
        ).toBeDefined();
      });
    });
  });
});
