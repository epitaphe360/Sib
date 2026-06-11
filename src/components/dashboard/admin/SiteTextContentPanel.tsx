import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import {
  fetchSiteTextContent,
  upsertSiteText,
  type SiteTextRow,
} from '../../../services/siteImagesService';

const TEXT_DEFINITIONS = [
  { key: 'home_hero_kicker',      label: 'Accroche (petit texte au-dessus du titre)', placeholder: 'Ex : 40ᵉ ÉDITION • 2026' },
  { key: 'home_hero_headline',    label: 'Titre principal hero',                       placeholder: 'Ex : Le Salon International du Bâtiment' },
  { key: 'home_hero_date',        label: 'Date du salon',                              placeholder: 'Ex : 5 – 9 Novembre 2026' },
  { key: 'home_hero_location',    label: 'Lieu',                                       placeholder: "Ex : Parc d'Exposition El Jadida" },
  { key: 'home_hero_cta_stand',   label: 'Bouton exposant',                            placeholder: 'Ex : Réserver votre stand' },
  { key: 'home_hero_cta_visit',   label: 'Bouton visiteur',                            placeholder: 'Ex : Inscription visiteur gratuite' },
  { key: 'home_stats_exhibitors', label: 'Statistique — Exposants',                    placeholder: 'Ex : 600+' },
  { key: 'home_stats_visitors',   label: 'Statistique — Visiteurs',                    placeholder: 'Ex : 40 000+' },
  { key: 'home_stats_countries',  label: 'Statistique — Pays représentés',             placeholder: 'Ex : 30+' },
  { key: 'home_stats_conferences',label: 'Statistique — Conférences',                  placeholder: 'Ex : 80+' },
];

type Lang = 'fr' | 'en' | 'ar';
const LANGS: { id: Lang; label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
];

export function SiteTextContentPanel() {
  const [rows, setRows]     = useState<SiteTextRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState<Lang>('fr');
  const [draft, setDraft]   = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const getLangValue = (row: SiteTextRow, lang: Lang) => {
    if (lang === 'fr') return row.value_fr;
    if (lang === 'en') return row.value_en;
    return row.value_ar;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSiteTextContent();
      setRows(data);
      const initial: Record<string, string> = {};
      for (const row of data) {
        initial[row.key] = getLangValue(row, activeLang) ?? '';
      }
      setDraft(initial);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, [activeLang]);

  useEffect(() => { load(); }, [load]);

  const handleLangChange = (lang: Lang) => {
    setActiveLang(lang);
    const next: Record<string, string> = {};
    for (const row of rows) {
      next[row.key] = getLangValue(row, lang) ?? '';
    }
    setDraft(next);
  };

  const getLangField = (lang: Lang) => {
    if (lang === 'fr') return 'value_fr';
    if (lang === 'en') return 'value_en';
    return 'value_ar';
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      const field = getLangField(activeLang);
      await upsertSiteText(key, { [field]: draft[key] || null } as any);
      toast.success('Texte enregistré');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally { setSaving(null); }
  };

  const handleSaveAll = async () => {
    setSaving('__all__');
    try {
      const field = getLangField(activeLang);
      await Promise.all(
        TEXT_DEFINITIONS.map(def =>
          upsertSiteText(def.key, { [field]: draft[def.key] || null } as any)
        )
      );
      toast.success('Tous les textes enregistrés');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally { setSaving(null); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75 }}
      className="mb-8"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-700 to-accent-500 px-6 py-4 flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Gestion des Textes du Site</h3>
            <p className="text-sm text-white/80">Modifiez les titres, descriptions et statistiques de la page d'accueil</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={saving === '__all__'}
            onClick={handleSaveAll}
          >
            {saving === '__all__'
              ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
              : <Save className="h-4 w-4 mr-1" />
            }
            Tout enregistrer
          </Button>
        </div>

        {/* Lang tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
          {LANGS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleLangChange(id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeLang === id
                  ? 'text-accent-700 dark:text-accent-400 border-b-2 border-accent-500 bg-white dark:bg-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Chargement des contenus…
            </div>
          ) : (
            <div className="space-y-4">
              {TEXT_DEFINITIONS.map(def => {
                const isSavingThis = saving === def.key;
                const row = rows.find(r => r.key === def.key);
                const savedVal = row ? getLangValue(row, activeLang) : null;
                const hasCustom = Boolean(savedVal);

                return (
                  <div key={def.key} className="flex flex-col gap-2 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {def.label}
                      </label>
                      <div className="flex items-center gap-2">
                        {hasCustom && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Personnalisé
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSavingThis}
                          onClick={() => handleSave(def.key)}
                        >
                          {isSavingThis
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <Save className="h-3.5 w-3.5 mr-1" />
                          }
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={draft[def.key] ?? ''}
                      onChange={e => setDraft(prev => ({ ...prev, [def.key]: e.target.value }))}
                      placeholder={def.placeholder}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                    />
                    {hasCustom && (
                      <button
                        onClick={() => {
                          setDraft(prev => ({ ...prev, [def.key]: '' }));
                          handleSave(def.key);
                        }}
                        className="self-start flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        <RefreshCw className="h-3 w-3" /> Utiliser la traduction par défaut
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default SiteTextContentPanel;
