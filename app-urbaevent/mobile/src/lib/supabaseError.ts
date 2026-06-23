export function supabaseErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const code = e.code as string | undefined;
    if (code === '42P01') return `Table manquante — vérifiez les migrations Supabase`;
    if (code === '42P17') return `Erreur sécurité base de données — appliquez la migration RLS 20260615000001`;
    if (code === '42501' || code === 'PGRST301') return `Droits insuffisants — appliquez la migration SQL`;
    if (code === '23505') return `Enregistrement déjà existant`;
    if (code === 'PGRST116') return fallback;
    const msg = typeof e.message === 'string' ? e.message.trim() : '';
    if (msg) return msg;
  }
  return fallback;
}
