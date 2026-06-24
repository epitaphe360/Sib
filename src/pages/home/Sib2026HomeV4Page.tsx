import React, { useEffect, useRef } from 'react';
import { HOME_V4_CMS_MESSAGE } from '../../config/homeV4CmsConfig';
import { resolveHomeV4ImagesMap } from '../../services/siteImagesService';

const HOME_SRC = '/sib2026-home-v4/home-sib2026.html?embedded=1';

/** Accueil SIB 2026 — maquette SIB2026-home-optimized-v4 (iframe) */
export default function Sib2026HomeV4Page() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('sib-home-v4-embedded');
    return () => document.documentElement.classList.remove('sib-home-v4-embedded');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const pushImages = (images: Record<string, string>) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: HOME_V4_CMS_MESSAGE, images },
        window.location.origin,
      );
    };

    const loadImages = async () => {
      try {
        const images = await resolveHomeV4ImagesMap();
        if (!cancelled) pushImages(images);
      } catch {
        /* garde les assets statiques par défaut */
      }
    };

    const onIframeLoad = () => { void loadImages(); };

    void loadImages();
    const iframe = iframeRef.current;
    iframe?.addEventListener('load', onIframeLoad);

    return () => {
      cancelled = true;
      iframe?.removeEventListener('load', onIframeLoad);
    };
  }, []);

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
