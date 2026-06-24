import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BootScreen } from '../components/BootScreen';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

const LOCALE_STORAGE_KEY = 'sib_locale';
const LOCALE_BOOT_TIMEOUT_MS = 1500;

type Locale = 'fr' | 'ar' | 'en';
type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = { fr, ar, en };

function isLocale(value: string | null): value is Locale {
  return value === 'fr' || value === 'ar' || value === 'en';
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function RtlRoot({ isRTL, children }: { isRTL: boolean; children: React.ReactNode }) {
  return (
    <View style={[styles.root, isRTL ? styles.rtl : styles.ltr]}>
      {children}
    </View>
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, LOCALE_BOOT_TIMEOUT_MS);

    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isLocale(stored)) setLocaleState(stored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, l).catch(() => undefined);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text =
        dictionaries[locale][key] ?? dictionaries.fr[key] ?? dictionaries.en[key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), String(value));
        }
      }
      return text;
    },
    [locale]
  );

  const isRTL = locale === 'ar';

  const value = useMemo(
    () => ({ locale, setLocale, t, isRTL, ready }),
    [locale, setLocale, t, isRTL, ready]
  );

  if (!ready) {
    return <BootScreen />;
  }

  return (
    <I18nContext.Provider value={value}>
      <RtlRoot isRTL={isRTL}>{children}</RtlRoot>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n requires I18nProvider');
  return ctx;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
});
