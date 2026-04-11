import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock i18n before importing the store
vi.mock('../../src/i18n/config', () => ({
  default: {
    changeLanguage: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock translations
vi.mock('../../src/store/translations', () => ({
  allTranslations: {
    fr: { 'nav.home': 'Accueil', 'hero.title': 'Salon International du Bâtiment' },
    en: { 'nav.home': 'Home', 'hero.title': 'International Building Exhibition' },
    ar: { 'nav.home': 'الرئيسية', 'hero.title': 'الصالون الدولي للبناء' },
  },
}));

import { useLanguageStore, supportedLanguages } from '../../src/store/languageStore';

describe('languageStore', () => {
  beforeEach(() => {
    useLanguageStore.setState({ currentLanguage: 'fr', isLoading: false });
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'fr';
  });

  describe('supportedLanguages', () => {
    it('should include French, English, and Arabic', () => {
      const codes = supportedLanguages.map(l => l.code);
      expect(codes).toContain('fr');
      expect(codes).toContain('en');
      expect(codes).toContain('ar');
    });

    it('should have 3 languages', () => {
      expect(supportedLanguages).toHaveLength(3);
    });

    it('Arabic should have correct native name', () => {
      const ar = supportedLanguages.find(l => l.code === 'ar');
      expect(ar).toBeDefined();
      expect(ar!.nativeName).toBe('العربية');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return French by default', () => {
      const lang = useLanguageStore.getState().getCurrentLanguage();
      expect(lang.code).toBe('fr');
    });
  });

  describe('setLanguage', () => {
    it('should switch to English', async () => {
      await useLanguageStore.getState().setLanguage('en');
      const state = useLanguageStore.getState();
      expect(state.currentLanguage).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should switch to Arabic and set RTL', async () => {
      await useLanguageStore.getState().setLanguage('ar');
      const state = useLanguageStore.getState();
      expect(state.currentLanguage).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should reject unsupported language codes', async () => {
      await expect(
        useLanguageStore.getState().setLanguage('zh')
      ).rejects.toThrow();
    });

    it('should switch back from Arabic to LTR', async () => {
      await useLanguageStore.getState().setLanguage('ar');
      expect(document.documentElement.dir).toBe('rtl');
      
      await useLanguageStore.getState().setLanguage('fr');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('translateText', () => {
    it('should translate keys in French', () => {
      const result = useLanguageStore.getState().translateText('nav.home');
      expect(result).toBe('Accueil');
    });

    it('should translate keys in English after switch', async () => {
      await useLanguageStore.getState().setLanguage('en');
      const result = useLanguageStore.getState().translateText('nav.home');
      expect(result).toBe('Home');
    });

    it('should translate keys in Arabic after switch', async () => {
      await useLanguageStore.getState().setLanguage('ar');
      const result = useLanguageStore.getState().translateText('nav.home');
      expect(result).toBe('الرئيسية');
    });

    it('should return fallback for missing keys', () => {
      const result = useLanguageStore.getState().translateText('missing.key', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should return key when no fallback and key missing', () => {
      const result = useLanguageStore.getState().translateText('missing.key');
      expect(result).toBe('missing.key');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return all supported languages', () => {
      const languages = useLanguageStore.getState().getAvailableLanguages();
      expect(languages).toHaveLength(3);
    });
  });
});
