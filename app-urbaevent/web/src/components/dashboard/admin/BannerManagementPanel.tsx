import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Upload, RotateCcw, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { BANNER_DEFINITIONS, getBannerDefaultSrc, getBannerDefinition } from '../../../config/banners';
import type { BannerKey } from '../../../config/banners';
import {
  fetchSiteBanners,
  uploadBannerImage,
  resetBannerToDefault,
  type SiteBannerRow,
} from '../../../services/bannerService';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

export function BannerManagementPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<SiteBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<BannerKey | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSiteBanners();
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rowFor = (key: BannerKey) => rows.find((r) => r.key === key);

  const previewSrc = (key: BannerKey) => {
    const row = rowFor(key);
    if (row?.image_url) {
      const v = row.updated_at ? new Date(row.updated_at).getTime() : Date.now();
      return `${row.image_url}${row.image_url.includes('?') ? '&' : '?'}v=${v}`;
    }
    return getBannerDefaultSrc(key);
  };

  const handleFile = async (key: BannerKey, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('admin.banner.invalid_type'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('admin.banner.max_size'));
      return;
    }
    setUploadingKey(key);
    try {
      await uploadBannerImage(key, file);
      toast.success(t('admin.banner.saved'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.banner.error'));
    } finally {
      setUploadingKey(null);
    }
  };

  const handleReset = async (key: BannerKey) => {
    setUploadingKey(key);
    try {
      await resetBannerToDefault(key);
      toast.success(t('admin.banner.reset_done'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.banner.error'));
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      className={embedded ? '' : 'mb-8'}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-4 flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('admin.banners_title')}</h3>
            <p className="text-sm text-white/80">{t('admin.banners_desc')}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              {t('admin.banner.loading')}
            </div>
          )}

          {!loading &&
            BANNER_DEFINITIONS.map((def) => {
              const busy = uploadingKey === def.key;
              const src = previewSrc(def.key);
              const usesCustom = Boolean(rowFor(def.key)?.image_url);

              return (
                <div
                  key={def.key}
                  className="flex flex-col lg:flex-row gap-5 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50"
                >
                  <div className="lg:w-72 flex-shrink-0">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                      {t(def.labelKey)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                      {t(def.descriptionKey)}
                    </p>
                    {usesCustom ? (
                      <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        {t('admin.banner.custom_image')}
                      </span>
                    ) : (
                      <span className="inline-block text-xs font-medium text-neutral-600 bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                        {t('admin.banner.default_image')}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 ${
                        def.previewAspectClass ?? 'aspect-[21/6] max-h-36'
                      }`}
                    >
                      <img
                        src={src}
                        alt={t(def.labelKey)}
                        className={`w-full h-full ${def.previewObjectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
                        onError={(e) => {
                          const fb = getBannerDefinition(def.key)?.fallbackSrc ?? getBannerDefaultSrc(def.key);
                          if (e.currentTarget.src !== fb) {
                            e.currentTarget.src = fb;
                            return;
                          }
                          e.currentTarget.src = getBannerDefaultSrc(def.key);
                        }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        ref={(el) => {
                          fileRefs.current[def.key] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
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
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {usesCustom ? t('admin.banner.replace') : t('admin.banner.upload')}
                      </Button>
                      {usesCustom && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => handleReset(def.key)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {t('admin.banner.reset_default')}
                        </Button>
                      )}
                      {def.linkTo && (
                        <Link
                          to={def.linkTo}
                          className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 ml-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          {t('admin.banner.preview_link')}
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      {t(def.hintKey ?? 'admin.banner.hint')}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}

export default BannerManagementPanel;
