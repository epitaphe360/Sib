import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Images, Upload, RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import {
  fetchSiteImages,
  uploadSiteImage,
  resetSiteImage,
  type SiteImageRow,
} from '../../../services/siteImagesService';
import {
  SITE_IMAGE_DEFINITIONS,
  getSiteImageDefault,
  type SiteImageKey,
} from '../../../config/siteImagesConfig';

type Category = 'home' | 'sib40' | 'builders' | 'sib2026';

const CATEGORY_LABELS: Record<Category, string> = {
  sib2026:  'Accueil SIB 2026 (v4)',
  home:     'Accueil (autres)',
  sib40:    'Page 40 ans',
  builders: 'Femmes & Hommes',
};
const CATEGORY_DESCS: Record<Category, string> = {
  sib2026:  'Maquette home v4 (iframe) : hero, timeline 40 ans, globe, univers, SIB Talks et 3 liens rapides en bas de page',
  home:     'Photos héros, parc, stands, conférences, B2B, inauguration, international (variants)',
  sib40:    'Hero, portraits et timeline de la page /accueil/40ans',
  builders: 'Portraits des profils sur /salon/femmes-et-hommes',
};

export function SiteImagesPanel({
  embedded = false,
  defaultCategory = 'sib2026' as Category,
}: { embedded?: boolean; defaultCategory?: Category } = {}) {
  const [activeTab, setActiveTab] = useState<Category>(defaultCategory);
  const [rows, setRows]           = useState<SiteImageRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchSiteImages()); }
    catch { setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rowFor = (key: string) => rows.find(r => r.key === key);

  const previewSrc = (key: SiteImageKey) => {
    const row = rowFor(key);
    if (row?.image_url) {
      const v = row.updated_at ? new Date(row.updated_at).getTime() : Date.now();
      return `${row.image_url}?v=${v}`;
    }
    return getSiteImageDefault(key);
  };

  const handleFile = async (key: SiteImageKey, file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Format non supporté (JPG, PNG, WebP uniquement)'); return; }
    if (file.size > 8 * 1024 * 1024)    { toast.error('Fichier trop lourd (8 Mo maximum)'); return; }
    setUploadingKey(key);
    try {
      await uploadSiteImage(key, file);
      toast.success('Photo mise à jour avec succès');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du téléversement');
    } finally { setUploadingKey(null); }
  };

  const handleReset = async (key: SiteImageKey) => {
    setUploadingKey(key);
    try {
      await resetSiteImage(key);
      toast.success('Photo réinitialisée (CDN par défaut)');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation');
    } finally { setUploadingKey(null); }
  };

  const defs = SITE_IMAGE_DEFINITIONS.filter(d => d.category === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className={embedded ? '' : 'mb-8'}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-4 flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl">
            <Images className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gestion des Photos du Site</h3>
            <p className="text-sm text-white/80">Modifiez les visuels de l’accueil v4, des pages 40 ans et Femmes & Hommes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === cat
                  ? 'text-primary-700 dark:text-primary-400 border-b-2 border-primary-600 bg-white dark:bg-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tab description */}
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            {CATEGORY_DESCS[activeTab]}
          </p>

          {loading && (
            <div className="flex items-center justify-center py-10 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Chargement des images…
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {defs.map(def => {
                const busy     = uploadingKey === def.key;
                const src      = previewSrc(def.key);
                const hasCustom = Boolean(rowFor(def.key)?.image_url);

                return (
                  <div
                    key={def.key}
                    className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50"
                  >
                    {/* Label + status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{def.label}</p>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{def.key}</p>
                      </div>
                      {hasCustom ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Personnalisée
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                          CDN par défaut
                        </span>
                      )}
                    </div>

                    {/* Preview */}
                    <div className={`relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 ${def.previewAspect ?? 'aspect-video'}`}>
                      <img
                        src={src}
                        alt={def.label}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = getSiteImageDefault(def.key); }}
                      />
                      {busy && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-7 w-7 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={el => { fileRefs.current[def.key] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(def.key, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy}
                        onClick={() => fileRefs.current[def.key]?.click()}
                      >
                        {busy
                          ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          : <Upload className="h-4 w-4 mr-1" />
                        }
                        {hasCustom ? 'Remplacer' : 'Téléverser'}
                      </Button>
                      {hasCustom && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => handleReset(def.key)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Réinitialiser
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      JPG, PNG ou WebP · 8 Mo max · Ratio recommandé : {
                        def.previewAspect === 'aspect-square' ? '1:1'
                          : def.previewAspect === 'aspect-[5/1]' ? '5:1 (bande timeline)'
                          : def.previewAspect === 'aspect-[6/1]' ? '6:1 (bande univers)'
                          : '16:9'
                      }
                    </p>
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

export default SiteImagesPanel;
