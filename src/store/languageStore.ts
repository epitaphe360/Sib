import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n/config';
import { fr as frTranslations } from './translations.fr';
import { migratePersistedStorage } from './persistMigration';

// Cache pour éviter de recharger les traductions à chaque changement de langue
const loadedTranslations: Record<string, Record<string, string>> = {
  fr: frTranslations,
};

async function loadLanguage(code: string): Promise<Record<string, string>> {
  if (loadedTranslations[code]) return loadedTranslations[code];
  if (code === 'en') {
    const m = await import('./translations.en');
    loadedTranslations['en'] = m.en;
  } else if (code === 'ar') {
    const m = await import('./translations.ar');
    loadedTranslations['ar'] = m.ar;
  }
  return loadedTranslations[code] ?? frTranslations;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇲🇦',
  },
];

interface LanguageState {
  currentLanguage: string;
  isLoading: boolean;

  // Actions
  setLanguage: (languageCode: string) => Promise<void>;
  getCurrentLanguage: () => Language;
  getAvailableLanguages: () => Language[];
  translateText: (key: string, fallback?: string) => string;
}

const LANGUAGE_STORAGE_KEY = 'sib-language-storage';
const LEGACY_LANGUAGE_STORAGE_KEY = 'sibs-language-storage';

migratePersistedStorage(LANGUAGE_STORAGE_KEY, LEGACY_LANGUAGE_STORAGE_KEY);

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',
      isLoading: false,

      setLanguage: async (languageCode: string) => {
        set({ isLoading: true });

        try {
          const language = supportedLanguages.find(lang => lang.code === languageCode);
          if (!language) {
            throw new Error(`Langue non supportée: ${languageCode}`);
          }

          // Lazy-load la langue si pas encore chargée
          await loadLanguage(languageCode);

          // Synchroniser avec i18next
          try {
            await i18n.changeLanguage(languageCode);
          } catch (i18nError) {
          }

          // Mettre à jour la direction du texte pour l'arabe (RTL)
          document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = languageCode;

          // Mettre à jour le titre de la page
          const titleKey = 'hero.title';
          const langDict = loadedTranslations[languageCode] ?? frTranslations;
          const translatedTitle = langDict[titleKey] || frTranslations[titleKey] || 'SIB';
          document.title = `${translatedTitle} - SIB 2026`;

          set({ currentLanguage: languageCode, isLoading: false });

        } catch (_error) {
          set({ isLoading: false });
          throw _error;
        }
      },

      getCurrentLanguage: () => {
        const { currentLanguage } = get();
        return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
      },

      getAvailableLanguages: () => {
        return supportedLanguages;
      },

      translateText: (key: string, fallback?: string) => {
        const { currentLanguage } = get();
        const languageTranslations = loadedTranslations[currentLanguage] ?? frTranslations;

        // D'abord, essayer la clé telle quelle (pour 'nav.home' par exemple)
        if (key in languageTranslations) {
          return languageTranslations[key];
        }

        // Sinon, essayer comme clé imbriquée (pour compatibilité)
        const keys = key.split('.');
        let value: unknown = languageTranslations;

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
          } else {
            return fallback || key;
          }
        }

        return typeof value === 'string' ? value : (fallback || key);
      }
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      partialize: (state) => ({ currentLanguage: state.currentLanguage })
    }
  )
);