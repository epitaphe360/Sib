import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Save, Loader2, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import {
  DEFAULT_MOBILE_APP_CONTENT,
  fetchMobileAppContent,
  mergeMobileAppContent,
  saveMobileAppContent,
  uploadMobileAppImage,
  type MobileAppContent,
} from '../../../services/mobileAppContentService';

const SALON_IMAGE_SLOTS = [
  { key: 'sib', label: 'Salon SIB' },
  { key: 'sir', label: 'Salon SIR' },
  { key: 'sip', label: 'Salon SIP' },
  { key: 'btp', label: 'Salon BTP' },
  { key: 'sie', label: 'Salon SIE' },
  { key: 'hero_bg', label: 'Fond hero accueil' },
];

export function MobileAppContentPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const [content, setContent] = useState<MobileAppContent>(DEFAULT_MOBILE_APP_CONTENT);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setContent(await fetchMobileAppContent());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger le contenu APK';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateHero = (field: keyof MobileAppContent['hero'], value: string) => {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateStat = (index: number, value: string) => {
    setContent((prev) => {
      const stats = [...prev.platformStats];
      stats[index] = { ...stats[index], value };
      return { ...prev, platformStats: stats };
    });
  };

  const updatePayment = (field: 'vipPriceEur' | 'iban' | 'bic' | 'bankName' | 'accountHolder' | 'domiciliation', value: string) => {
    setContent((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: field === 'vipPriceEur' ? Number(value) || 0 : value,
      },
    }));
  };

  const updateSalonStat = (salonKey: string, field: 'edition' | 'visitors' | 'description', value: string) => {
    setContent((prev) => ({
      ...prev,
      salonStats: {
        ...prev.salonStats,
        [salonKey]: { ...prev.salonStats?.[salonKey], [field]: value },
      },
    }));
  };

  const SALON_STAT_KEYS = ['sib', 'sir', 'sip', 'btp', 'sie'] as const;

  const handleSave = async () => {
    if (loadError) {
      toast.error('Rechargez le contenu avant d’enregistrer');
      return;
    }
    setSaving(true);
    try {
      await saveMobileAppContent(mergeMobileAppContent(content));
      toast.success('Contenu APK enregistré — synchronisation au prochain démarrage de l’app');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (slot: string, file: File) => {
    if (loadError) {
      toast.error('Rechargez le contenu avant de publier une photo');
      return;
    }
    setUploadingSlot(slot);
    try {
      const url = await uploadMobileAppImage(slot, file);
      const nextContent = {
        ...content,
        images: { ...content.images, [slot]: url },
      };
      setContent(nextContent);
      await saveMobileAppContent(mergeMobileAppContent(nextContent));
      toast.success(`Photo ${slot} publiée — tirer vers le bas dans l’APK pour actualiser`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload échoué');
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <motion.section
      initial={embedded ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        embedded
          ? 'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm'
          : 'mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Contenu APK UrbaEvent</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Textes, chiffres et photos de l’application mobile. L’APK récupère ces données au démarrage ; après upload d’une photo, tirez vers le bas sur l’accueil de l’app pour actualiser.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={saving || loading || Boolean(loadError)}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Enregistrer APK
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          Erreur de chargement : {loadError}. Les valeurs par défaut ne sont pas affichées pour éviter un écrasement accidentel.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500 py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Hero accueil</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {(['badgeOrg', 'titlePart1', 'titlePart2', 'subtitleFr', 'subtitleEn', 'subtitleAr'] as const).map((field) => (
                <label key={field} className="block">
                  <span className="text-xs text-neutral-500 mb-1 block">{field}</span>
                  <input
                    type="text"
                    value={content.hero[field]}
                    onChange={(e) => updateHero(field, e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Chiffres plateforme (4 stats)</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {content.platformStats.slice(0, 4).map((stat, idx) => (
                <label key={stat.labelKey} className="block">
                  <span className="text-xs text-neutral-500 mb-1 block">{stat.labelKey}</span>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Paiement VIP</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-xs text-neutral-500 mb-1 block">Prix VIP (EUR)</span>
                <input type="number" value={content.payment.vipPriceEur ?? 700} onChange={(e) => updatePayment('vipPriceEur', e.target.value)} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-neutral-500 mb-1 block">Banque</span>
                <input type="text" value={content.payment.bankName ?? ''} onChange={(e) => updatePayment('bankName', e.target.value)} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-neutral-500 mb-1 block">Titulaire</span>
                <input type="text" value={content.payment.accountHolder ?? ''} onChange={(e) => updatePayment('accountHolder', e.target.value)} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs text-neutral-500 mb-1 block">IBAN</span>
                <input type="text" value={content.payment.iban ?? ''} onChange={(e) => updatePayment('iban', e.target.value)} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs text-neutral-500 mb-1 block">BIC</span>
                <input type="text" value={content.payment.bic ?? ''} onChange={(e) => updatePayment('bic', e.target.value)} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm" />
              </label>
              <label className="block md:col-span-3">
                <span className="text-xs text-neutral-500 mb-1 block">Domiciliation</span>
                <input type="text" value={content.payment.domiciliation ?? ''} onChange={(e) => updatePayment('domiciliation', e.target.value)} className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm" />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Stats salons (cartes accueil)</h3>
            <div className="space-y-4">
              {SALON_STAT_KEYS.map((key) => (
                <div key={key} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 grid gap-3 md:grid-cols-3">
                  <p className="md:col-span-3 text-xs font-bold uppercase text-neutral-500">{key}</p>
                  {(['edition', 'visitors', 'description'] as const).map((field) => (
                    <label key={field} className="block">
                      <span className="text-xs text-neutral-500 mb-1 block">{field}</span>
                      <input
                        type="text"
                        value={content.salonStats?.[key]?.[field] ?? ''}
                        onChange={(e) => updateSalonStat(key, field, e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Photos APK
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SALON_IMAGE_SLOTS.map(({ key, label }) => (
                <div key={key} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
                  <p className="text-sm font-medium mb-2">{label}</p>
                  {content.images[key] ? (
                    <img src={content.images[key]} alt={label} className="w-full h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-2 flex items-center justify-center text-xs text-neutral-400">
                      Image locale par défaut
                    </div>
                  )}
                  <input
                    ref={(el) => { fileRefs.current[key] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImageUpload(key, file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={uploadingSlot === key}
                    onClick={() => fileRefs.current[key]?.click()}
                  >
                    {uploadingSlot === key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    Remplacer
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {content.updatedAt && (
            <p className="text-xs text-neutral-500">
              Dernière mise à jour : {new Date(content.updatedAt).toLocaleString('fr-FR')} · v{content.version}
            </p>
          )}
        </div>
      )}
    </motion.section>
  );
}
