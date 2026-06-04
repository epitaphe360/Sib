import fr from './locales/fr.json';
import ar from './locales/ar.json';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';

type Locale = 'fr' | 'ar';
type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = { fr, ar };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    const rtl = l === 'ar';
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? dictionaries.fr[key] ?? key,
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, isRTL: locale === 'ar' }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n requires I18nProvider');
  return ctx;
}
