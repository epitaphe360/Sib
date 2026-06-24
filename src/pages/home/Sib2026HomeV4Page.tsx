import React, { useCallback, useEffect, useRef } from 'react';
import { HOME_V4_CMS_MESSAGE, HOME_V4_LANG_MESSAGE } from '../../config/homeV4CmsConfig';
import { resolveHomeV4ImagesMap } from '../../services/siteImagesService';
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

  useEffect(() => {
    postToIframe({ type: HOME_V4_LANG_MESSAGE, lang: currentLanguage });
  }, [currentLanguage, postToIframe]);

  useEffect(() => {
    let cancelled = false;

    const pushImages = (images: Record<string, string>) => {
      postToIframe({ type: HOME_V4_CMS_MESSAGE, images });
    };

    const loadImages = async () => {
      try {
        const images = await resolveHomeV4ImagesMap();
        if (!cancelled) pushImages(images);
      } catch {
        /* garde les assets statiques par défaut */
      }
    };

    const onIframeLoad = () => {
      const lang = useLanguageStore.getState().currentLanguage;
      postToIframe({ type: HOME_V4_LANG_MESSAGE, lang });
      void loadImages();
    };

    void loadImages();
    const iframe = iframeRef.current;
    iframe?.addEventListener('load', onIframeLoad);

    return () => {
      cancelled = true;
      iframe?.removeEventListener('load', onIframeLoad);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- images chargées une fois ; langue gérée à part
  }, [postToIframe]);

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
