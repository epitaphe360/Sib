import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Salon {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  location: string | null;
  date_debut: string | null;
  date_fin: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface SalonContextValue {
  /** Salon actif (celui affiché en ce moment) */
  currentSalon: Salon | null;
  /** Liste de tous les salons actifs */
  salons: Salon[];
  /** true pendant le chargement initial */
  loading: boolean;
  /** Changer manuellement de salon (Urbacom admin) */
  setSalonBySlug: (slug: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SalonContext = createContext<SalonContextValue>({
  currentSalon: null,
  salons: [],
  loading: true,
  setSalonBySlug: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSalons() {
      try {
        if (!supabase) return;

        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error || !data?.length) return;

        setSalons(data as Salon[]);

        // Détecter le salon depuis l'URL (slug) ou prendre le salon par défaut
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const slugFromUrl = pathSegments[0];
        const bySlug = data.find((s) => s.slug === slugFromUrl);
        const byDefault = data.find((s) => s.is_default);

        setCurrentSalon(bySlug ?? byDefault ?? data[0]);
      } catch (_) {
        // Si la table n'existe pas encore, on ne bloque pas l'app
      } finally {
        setLoading(false);
      }
    }

    loadSalons();
  }, []);

  const setSalonBySlug = (slug: string) => {
    const found = salons.find((s) => s.slug === slug);
    if (found) setCurrentSalon(found);
  };

  return (
    <SalonContext.Provider value={{ currentSalon, salons, loading, setSalonBySlug }}>
      {children}
    </SalonContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSalon(): SalonContextValue {
  return useContext(SalonContext);
}
