import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchSalons } from '../services/salons';
import type { Salon } from '../types';

const STORAGE_KEY = '@urbaevent/active_salon_id';
const LEGACY_STORAGE_KEY = '@sib/active_salon_id';

type SalonContextValue = {
  salons: Salon[];
  activeSalon: Salon | null;
  setActiveSalon: (salon: Salon) => Promise<void>;
  clearActiveSalon: () => Promise<void>;
  refreshSalons: () => Promise<void>;
  loading: boolean;
};

const SalonContext = createContext<SalonContextValue>({
  salons: [],
  activeSalon: null,
  setActiveSalon: async () => {},
  clearActiveSalon: async () => {},
  refreshSalons: async () => {},
  loading: true,
});

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [activeSalon, setActiveSalonState] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const activeSalonRef = useRef<Salon | null>(null);

  useEffect(() => {
    activeSalonRef.current = activeSalon;
  }, [activeSalon]);

  const refreshSalons = useCallback(async () => {
    const list = await fetchSalons();
    setSalons(list);

    const current = activeSalonRef.current;
    if (current && list.some((s) => s.id === current.id)) {
      setActiveSalonState(list.find((s) => s.id === current.id) ?? current);
      return;
    }

    let storedId = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedId) {
      storedId = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    }
    const restored = storedId ? list.find((s) => s.id === storedId) ?? null : null;
    setActiveSalonState(restored);
  }, []);

  useEffect(() => {
    refreshSalons().finally(() => setLoading(false));
  }, [refreshSalons]);

  const setActiveSalon = useCallback(async (salon: Salon) => {
    setActiveSalonState(salon);
    activeSalonRef.current = salon;
    await AsyncStorage.setItem(STORAGE_KEY, salon.id);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  }, []);

  const clearActiveSalon = useCallback(async () => {
    setActiveSalonState(null);
    activeSalonRef.current = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  }, []);

  return (
    <SalonContext.Provider
      value={{ salons, activeSalon, setActiveSalon, clearActiveSalon, refreshSalons, loading }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  return useContext(SalonContext);
}
