import { useLanguageStore, supportedLanguages } from '../store/languageStore';
import { useCallback, useMemo } from 'react';

export const useTranslation = () => {
  // Récupérer la langue actuelle depuis le store (déclenche un re-render si elle change)
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const translateText = useLanguageStore((state) => state.translateText);

  // Fonction de traduction mémorisée avec support de l'interpolation
  const t = useCallback((key: string, params?: Record<string, string | number> | string) => {
    const translated = translateText(key, typeof params === 'string' ? params : undefined);

    // Si params est un objet, faire l'interpolation manuelle
    if (params && typeof params === 'object') {
      return Object.entries(params).reduce((text, [paramKey, value]) => {
        return text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      }, translated);
    }

    return translated;
  }, [translateText, currentLanguage]);

  // Trouver l'objet langue complet
  const currentLang = useMemo(() => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  }, [currentLanguage]);

  return {
    t,
    currentLanguage,
    currentLang,
    isRTL: currentLanguage === 'ar'
  };
};
