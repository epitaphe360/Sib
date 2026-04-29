import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

type RegistrationType = 'exhibitor' | 'partner';

const SETTING_KEYS: Record<RegistrationType, string> = {
  exhibitor: 'exhibitor_registration_open',
  partner: 'partner_registration_open',
};

const LABELS: Record<RegistrationType, { open: string; close: string }> = {
  exhibitor: { open: '✅ Inscriptions exposant ouvertes', close: '🔒 Inscriptions exposant clôturées' },
  partner: { open: '✅ Inscriptions partenaire ouvertes', close: '🔒 Inscriptions partenaire clôturées' },
};

export function useRegistrationControl(type: RegistrationType = 'exhibitor') {
  const settingKey = SETTING_KEYS[type];
  const labels = LABELS[type];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', settingKey)
        .maybeSingle();

      if (error && error.code !== '42P01') throw error;
      // Si la clé n'existe pas encore → fermé par défaut
      setIsOpen(data?.value === 'true');
    } catch {
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [settingKey]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (newValue: boolean) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          { key: settingKey, value: String(newValue), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) throw error;
      setIsOpen(newValue);
      toast.success(newValue ? labels.open : labels.close);
    } catch (err) {
      toast.error(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setIsSaving(false);
    }
  }, [settingKey, labels]);

  return { isOpen, isLoading, isSaving, toggle };
}
