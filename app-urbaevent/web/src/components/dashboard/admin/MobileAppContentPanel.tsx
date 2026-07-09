import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Save, Loader2, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import { SalonPartnersEditor } from './SalonPartnersEditor';
import {
  DEFAULT_MOBILE_APP_CONTENT,
  fetchMobileAppContent,
  mergeMobileAppContent,
  saveMobileAppContent,
  uploadMobileAppImage,
  type MobileAppContent,
} from '../../../services/mobileAppContentService';
import {
  APK_DEFAULT_IMAGE_PREVIEWS,
  APK_DEFAULT_SALON_PARTNERS,
  APK_DEFAULT_SALON_STATS,
  APK_SALON_STAT_KEYS,
  SALON_CMS_FIELD_KEYS,
  partnersBannerSlot,
  type SalonCmsFields,
  type SalonPartnersCms,
} from '../../../config/mobileAppDefaultContent';

const SALON_IMAGE_SLOTS = [
  { key: 'sib', label: 'Salon SIB (bannière)' },
  { key: 'sir', label: 'Salon SIR' },
  { key: 'sip', label: 'Salon SIP' },
  { key: 'btp', label: 'Salon BTP' },
  { key: 'sie', label: 'Salon SIE' },
  { key: 'hero_bg', label: 'Fond hero accueil' },
  ...APK_SALON_STAT_KEYS.map((key) => ({
    key: partnersBannerSlot(key),
    label: `Bannière partenaires ${key.toUpperCase()}`,
  })),
];

const SALON_FIELD_LABELS: Record<(typeof SALON_CMS_FIELD_KEYS)[number], string> = {
  tagline: 'Sous-titre (ex. Construction & Architecture)',
  aboutText: 'Texte présentation (paragraphe complet)',
  edition: 'Édition',
  visitors: 'Visiteurs',
  description: 'Description courte',
  location: 'Lieu affiché',
  features: 'Fonctionnalités (une par ligne)',
  hours: 'Horaires',
  venue: 'Lieu / venue',
  city: 'Ville',
  startDayNote: 'Note jour d’ouverture',
  exhibitorsStat: 'Stat exposants',
  countriesStat: 'Stat pays',
  contactEmail: 'Email contact',
  website: 'Site web',
};

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

  const updateSalonStat = (salonKey: string, field: keyof SalonCmsFields, value: string) => {
    setContent((prev) => ({
      ...prev,
      salonStats: {
        ...prev.salonStats,
        [salonKey]: { ...prev.salonStats?.[salonKey], [field]: value },
      },
    }));
  };

  const updateSalonPartners = (salonKey: string, next: SalonPartnersCms) => {
    setContent((prev) => ({
      ...prev,
      salonPartners: {
        ...prev.salonPartners,
        [salonKey]: next,
      },
    }));
  };

  const getSalonPartners = (salonKey: string): SalonPartnersCms => ({
    displayMode: content.salonPartners?.[salonKey]?.displayMode ?? 'banner',
    groups:
      content.salonPartners?.[salonKey]?.groups?.length
        ? content.salonPartners[salonKey]!.groups!
        : (APK_DEFAULT_SALON_PARTNERS[salonKey]?.groups ?? []),
  });

  const setPartnersDisplayMode = (salonKey: string, displayMode: 'banner' | 'list') => {
    const current = getSalonPartners(salonKey);
    const groups =
      displayMode === 'list' && !current.groups.length
        ? (APK_DEFAULT_SALON_PARTNERS[salonKey]?.groups ?? [{ label: 'Sponsors', partners: [{ name: '', acronym: '' }] }])
        : current.groups;
    updateSalonPartners(salonKey, { ...current, displayMode, groups });
  };

  const SALON_STAT_KEYS = APK_SALON_STAT_KEYS;

  const isSalonStatCustomized = (salonKey: string, field: keyof SalonCmsFields) => {
    const displayed = content.salonStats?.[salonKey]?.[field]?.trim();
    const base = APK_DEFAULT_SALON_STATS[salonKey]?.[field];
    if (!displayed) return false;
    return displayed !== base;
  };

  const getSalonFieldValue = (salonKey: string, field: keyof SalonCmsFields) =>
    content.salonStats?.[salonKey]?.[field] ?? APK_DEFAULT_SALON_STATS[salonKey]?.[field] ?? '';

  const getImagePreviewUrl = (slot: string) => content.images[slot]?.trim() || APK_DEFAULT_IMAGE_PREVIEWS[slot] || '';

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
            Tout le contenu visible dans l’APK (textes salon, présentation, partenaires, photos, paiement).
            Enregistrez puis tirez vers le bas sur l’accueil APK pour actualiser.
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
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Contenu salons (Présentation, Informations…)</h3>
            <p className="text-xs text-neutral-500 mb-4">Chaque salon SIB / SIR / SIP / BTP / SIE — textes affichés dans l’APK visiteur.</p>
            <div className="space-y-6">
              {SALON_STAT_KEYS.map((key) => (
                <div key={key} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
                  <p className="text-xs font-bold uppercase text-neutral-500">{key}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {SALON_CMS_FIELD_KEYS.map((field) => (
                      <label key={field} className={`block ${field === 'aboutText' || field === 'features' ? 'md:col-span-2' : ''}`}>
                        <span className="text-xs text-neutral-500 mb-1 flex items-center gap-2">
                          {SALON_FIELD_LABELS[field]}
                          {isSalonStatCustomized(key, field) ? (
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                              Personnalisé
                            </span>
                          ) : (
                            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                              Défaut APK
                            </span>
                          )}
                        </span>
                        {field === 'aboutText' || field === 'features' ? (
                          <textarea
                            rows={field === 'aboutText' ? 4 : 3}
                            value={getSalonFieldValue(key, field)}
                            onChange={(e) => updateSalonStat(key, field, e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm min-h-[80px]"
                          />
                        ) : (
                          <input
                            type="text"
                            value={getSalonFieldValue(key, field)}
                            onChange={(e) => updateSalonStat(key, field, e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Sponsors & organisateurs
                      </span>
                      <label className="inline-flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="radio"
                          name={`partners-mode-${key}`}
                          checked={getSalonPartners(key).displayMode !== 'list'}
                          onChange={() => setPartnersDisplayMode(key, 'banner')}
                        />
                        Bannière image
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="radio"
                          name={`partners-mode-${key}`}
                          checked={getSalonPartners(key).displayMode === 'list'}
                          onChange={() => setPartnersDisplayMode(key, 'list')}
                        />
                        Liste de sponsors
                      </label>
                    </div>
                    {getSalonPartners(key).displayMode === 'list' ? (
                      <SalonPartnersEditor
                        salonKey={key}
                        value={getSalonPartners(key)}
                        onChange={(next) => updateSalonPartners(key, next)}
                        onUploadLogo={uploadMobileAppImage}
                      />
                    ) : (
                      <p className="text-xs text-neutral-500 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-3">
                        Mode bannière : uploadez « Bannière partenaires {key.toUpperCase()} » dans la section Photos APK ci-dessous.
                        Pour ajouter des sponsors un par un, choisissez « Liste de sponsors ».
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Photos APK
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SALON_IMAGE_SLOTS.map(({ key, label }) => {
                const customUrl = content.images[key]?.trim();
                const previewUrl = getImagePreviewUrl(key);
                return (
                <div key={key} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
                  <p className="text-sm font-medium mb-1">{label}</p>
                  <p className="text-[10px] mb-2">
                    {customUrl ? (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                        Photo Supabase
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 font-medium text-neutral-500">
                        Image embarquée APK
                      </span>
                    )}
                  </p>
                  {previewUrl ? (
                    <img src={previewUrl} alt={label} className="w-full h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800 mb-2 flex items-center justify-center text-xs text-neutral-400">
                      Aperçu indisponible
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
              );})}
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
