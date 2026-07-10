import { useCallback, useEffect, useRef, useState } from 'react';
import { Handshake, Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import { SalonPartnersEditor } from './SalonPartnersEditor';
import {
  APK_DEFAULT_SALON_PARTNERS,
  getApkDefaultImageUrl,
  partnersBannerSlot,
  resolveApkImageUrl,
  type SalonPartnersCms,
} from '../../../config/mobileAppDefaultContent';
import {
  DEFAULT_MOBILE_APP_CONTENT,
  fetchMobileAppContent,
  mergeMobileAppContent,
  saveMobileAppContent,
  uploadMobileAppImage,
  type MobileAppContent,
} from '../../../services/mobileAppContentService';

const WEB_SALON_KEY = 'sib';

export function SalonPartnersCmsPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const [content, setContent] = useState<MobileAppContent>(DEFAULT_MOBILE_APP_CONTENT);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreviewBroken, setBannerPreviewBroken] = useState(false);
  const bannerRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setContent(await fetchMobileAppContent());
      setBannerPreviewBroken(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les sponsors';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getSalonPartners = (): SalonPartnersCms => ({
    displayMode: content.salonPartners?.[WEB_SALON_KEY]?.displayMode ?? 'banner',
    groups:
      content.salonPartners?.[WEB_SALON_KEY]?.groups?.length
        ? content.salonPartners[WEB_SALON_KEY]!.groups!
        : (APK_DEFAULT_SALON_PARTNERS[WEB_SALON_KEY]?.groups ?? []),
  });

  const updateSalonPartners = (next: SalonPartnersCms) => {
    setContent((prev) => ({
      ...prev,
      salonPartners: { ...prev.salonPartners, [WEB_SALON_KEY]: next },
    }));
  };

  const setDisplayMode = (displayMode: 'banner' | 'list') => {
    const current = getSalonPartners();
    const groups =
      displayMode === 'list' && !current.groups.length
        ? (APK_DEFAULT_SALON_PARTNERS[WEB_SALON_KEY]?.groups ?? [{ label: 'Sponsors', partners: [{ name: '', acronym: '' }] }])
        : current.groups;
    updateSalonPartners({ ...current, displayMode, groups });
  };

  const handleSave = async () => {
    if (loadError) {
      toast.error('Rechargez le contenu avant d’enregistrer');
      return;
    }
    setSaving(true);
    try {
      await saveMobileAppContent(mergeMobileAppContent(content));
      toast.success('Sponsors enregistrés — site web, accueil et APK synchronisés');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (loadError) return;
    const slot = partnersBannerSlot(WEB_SALON_KEY);
    setUploadingBanner(true);
    try {
      const url = await uploadMobileAppImage(slot, file);
      const next = { ...content, images: { ...content.images, [slot]: url } };
      setContent(next);
      await saveMobileAppContent(mergeMobileAppContent(next));
      toast.success('Bannière sponsors publiée');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload échoué');
    } finally {
      setUploadingBanner(false);
    }
  };

  const bannerSlot = partnersBannerSlot(WEB_SALON_KEY);
  const customBannerUrl = content.images[bannerSlot]?.trim();
  const bannerPreview =
    customBannerUrl && !bannerPreviewBroken
      ? resolveApkImageUrl(customBannerUrl)
      : getApkDefaultImageUrl(bannerSlot);
  const partners = getSalonPartners();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des sponsors…
      </div>
    );
  }

  return (
    <section
      className={
        embedded
          ? 'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-5'
          : 'space-y-5'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary-600" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Sponsors & organisateurs SIB</h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Source unique partagée : accueil web (iframe), page Présentation et application mobile.
            Après modification, rafraîchissez la page publique (Ctrl+F5).
            {content.updatedAt ? (
              <span className="block mt-1 text-neutral-400">
                Dernière sauvegarde en base : {new Date(content.updatedAt).toLocaleString('fr-FR')}
                {content.version ? ` · version ${content.version}` : ''}
              </span>
            ) : null}
          </p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving || Boolean(loadError)} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Enregistrer
        </Button>
      </div>

      {loadError ? (
        <p className="text-sm text-red-600 rounded-lg border border-red-200 bg-red-50 px-3 py-2">{loadError}</p>
      ) : null}

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="web-partners-mode"
            checked={partners.displayMode !== 'list'}
            onChange={() => setDisplayMode('banner')}
          />
          Bannière image
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="web-partners-mode"
            checked={partners.displayMode === 'list'}
            onChange={() => setDisplayMode('list')}
          />
          Liste de sponsors (logos + noms)
        </label>
      </div>

      {partners.displayMode === 'list' ? (
        <SalonPartnersEditor
          salonKey={WEB_SALON_KEY}
          value={partners}
          onChange={updateSalonPartners}
          onUploadLogo={async (slot, file) => {
            const url = await uploadMobileAppImage(slot, file);
            setContent((prev) => ({
              ...prev,
              images: { ...prev.images, [slot]: url },
            }));
            return url;
          }}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-4 space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Mode bannière : une image unique remplace la liste sur l’accueil (si aucun logo individuel n’est défini).
          </p>
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Aperçu bannière sponsors"
              className="max-h-40 rounded-lg border object-contain"
              onError={() => {
                if (customBannerUrl) setBannerPreviewBroken(true);
              }}
            />
          ) : null}
          <input
            ref={bannerRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleBannerUpload(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadingBanner}
            onClick={() => bannerRef.current?.click()}
          >
            {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Uploader la bannière SIB
          </Button>
        </div>
      )}
    </section>
  );
}
