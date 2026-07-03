import React, { useCallback, useEffect, useRef } from 'react';
import {
  HOME_V4_CMS_MESSAGE,
  HOME_V4_LANG_MESSAGE,
  HOME_V4_STATS_MESSAGE,
  HOME_V4_TEXT_MESSAGE,
} from '../../config/homeV4CmsConfig';
import { resolveHomeV4CmsPayload, resolveHomeV4ImagesMap } from '../../services/siteImagesService';
import { useLanguageStore } from '../../store/languageStore';

const HOME_SRC = '/sib2026-home-v4/home-sib2026.html?embedded=1';

/** Accueil SIB 2026 — maquette SIB2026-home-optimized-v4 (iframe) */
export default function Sib2026HomeV4Page() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);

  useEffect(() => {
    document.documentElement.classList.add('sib-home-v4-embedded');
    return () => document.documentElement.classList.remove('sib-home-v4-embedded');
  }, []);

  const postToIframe = useCallback(
    (payload: Record<string, unknown>) => {
      iframeRef.current?.contentWindow?.postMessage(payload, window.location.origin);
    },
    [],
  );

  const pushCmsPayload = useCallback(async () => {
    const lang = useLanguageStore.getState().currentLanguage as 'fr' | 'en' | 'ar';
    try {
      const [images, cms] = await Promise.all([
        resolveHomeV4ImagesMap(),
        resolveHomeV4CmsPayload(lang),
      ]);
      postToIframe({ type: HOME_V4_CMS_MESSAGE, images });
      if (Object.keys(cms.texts).length > 0) {
        postToIframe({ type: HOME_V4_TEXT_MESSAGE, texts: cms.texts });
      }
      if (cms.stats.some(Boolean)) {
        postToIframe({ type: HOME_V4_STATS_MESSAGE, stats: cms.stats });
      }
    } catch {
      /* garde les assets statiques par défaut */
    }
  }, [postToIframe]);

  useEffect(() => {
    postToIframe({ type: HOME_V4_LANG_MESSAGE, lang: currentLanguage });
    void pushCmsPayload();
  }, [currentLanguage, postToIframe, pushCmsPayload]);

  useEffect(() => {
    let cancelled = false;

    const onIframeLoad = () => {
      if (cancelled) return;
      const lang = useLanguageStore.getState().currentLanguage;
      postToIframe({ type: HOME_V4_LANG_MESSAGE, lang });
      void pushCmsPayload();
    };

    void pushCmsPayload();
    const iframe = iframeRef.current;
    iframe?.addEventListener('load', onIframeLoad);

    return () => {
      cancelled = true;
      iframe?.removeEventListener('load', onIframeLoad);
    };
  }, [postToIframe, pushCmsPayload]);

  return (
    <iframe
      ref={iframeRef}
      src={HOME_SRC}
      title="SIB 2026 — Salon International du Bâtiment"
      className="block w-full border-0 bg-[#f7f7f5]"
      style={{ height: '100dvh', minHeight: '100dvh' }}
    />
  );
}
