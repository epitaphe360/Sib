/**
 * useInvoiceConfig — lecture/écriture de la configuration des factures
 * Stockage : table app_settings (clé/valeur)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface InvoiceConfig {
  /** Nom affiché en haut de facture */
  emitter_name: string;
  /** Raison sociale / organisation */
  emitter_org: string;
  /** Adresse postale */
  emitter_address: string;
  /** Email de contact */
  emitter_email: string;
  /** Téléphone */
  emitter_phone: string;
  /** Numéro ICE / TVA */
  emitter_ice: string;
  /** Site web */
  emitter_website: string;
  /** Préfixe numéro de facture (ex: FAC-SIB-2026-) */
  invoice_prefix: string;
  /** Taux TVA en % (ex: 20) */
  vat_rate: number;
  /** Texte de pied de page */
  footer_text: string;
  /** URL du logo (laisser vide pour utiliser /logo-sib2026.png) */
  logo_url: string;
}

export const INVOICE_CONFIG_DEFAULTS: InvoiceConfig = {
  emitter_name:    'SIB 2026',
  emitter_org:     'Salon International du Bâtiment',
  emitter_address: 'Casablanca, Maroc',
  emitter_email:   'contact@sib2026.ma',
  emitter_phone:   '',
  emitter_ice:     '',
  emitter_website: 'www.sib2026.ma',
  invoice_prefix:  'FAC-RENT-2026-',
  vat_rate:        20,
  footer_text:     'SIB 2026 · Salon International du Bâtiment · Casablanca, Maroc · contact@sib2026.ma · www.sib2026.ma',
  logo_url:        '',
};

const KEY_MAP: Record<keyof InvoiceConfig, string> = {
  emitter_name:    'invoice_emitter_name',
  emitter_org:     'invoice_emitter_org',
  emitter_address: 'invoice_emitter_address',
  emitter_email:   'invoice_emitter_email',
  emitter_phone:   'invoice_emitter_phone',
  emitter_ice:     'invoice_emitter_ice',
  emitter_website: 'invoice_emitter_website',
  invoice_prefix:  'invoice_prefix',
  vat_rate:        'invoice_vat_rate',
  footer_text:     'invoice_footer_text',
  logo_url:        'invoice_logo_url',
};

/** Charge la config depuis app_settings (public, lecture seule pour lecture) */
export async function loadInvoiceConfig(): Promise<InvoiceConfig> {
  try {
    const keys = Object.values(KEY_MAP);
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', keys);

    if (error) { return { ...INVOICE_CONFIG_DEFAULTS }; }

    const map: Record<string, string> = {};
    (data ?? []).forEach(row => { map[row.key] = row.value; });

    return {
      emitter_name:    map[KEY_MAP.emitter_name]    ?? INVOICE_CONFIG_DEFAULTS.emitter_name,
      emitter_org:     map[KEY_MAP.emitter_org]     ?? INVOICE_CONFIG_DEFAULTS.emitter_org,
      emitter_address: map[KEY_MAP.emitter_address] ?? INVOICE_CONFIG_DEFAULTS.emitter_address,
      emitter_email:   map[KEY_MAP.emitter_email]   ?? INVOICE_CONFIG_DEFAULTS.emitter_email,
      emitter_phone:   map[KEY_MAP.emitter_phone]   ?? INVOICE_CONFIG_DEFAULTS.emitter_phone,
      emitter_ice:     map[KEY_MAP.emitter_ice]     ?? INVOICE_CONFIG_DEFAULTS.emitter_ice,
      emitter_website: map[KEY_MAP.emitter_website] ?? INVOICE_CONFIG_DEFAULTS.emitter_website,
      invoice_prefix:  map[KEY_MAP.invoice_prefix]  ?? INVOICE_CONFIG_DEFAULTS.invoice_prefix,
      vat_rate:        Number(map[KEY_MAP.vat_rate] ?? INVOICE_CONFIG_DEFAULTS.vat_rate),
      footer_text:     map[KEY_MAP.footer_text]     ?? INVOICE_CONFIG_DEFAULTS.footer_text,
      logo_url:        map[KEY_MAP.logo_url]        ?? INVOICE_CONFIG_DEFAULTS.logo_url,
    };
  } catch {
    return { ...INVOICE_CONFIG_DEFAULTS };
  }
}

export function useInvoiceConfig() {
  const [config, setConfig] = useState<InvoiceConfig>({ ...INVOICE_CONFIG_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await loadInvoiceConfig();
      setConfig(cfg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (cfg: InvoiceConfig) => {
    setSaving(true);
    try {
      const rows = (Object.keys(KEY_MAP) as Array<keyof InvoiceConfig>).map(k => ({
        key: KEY_MAP[k],
        value: String(cfg[k]),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('app_settings')
        .upsert(rows, { onConflict: 'key' });

      if (error) { throw error; }
      setConfig(cfg);
      toast.success('Configuration facture sauvegardée');
    } catch (err) {
      toast.error(`Erreur : ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setSaving(false);
    }
  }, []);

  return { config, loading, saving, reload: load, save };
}
