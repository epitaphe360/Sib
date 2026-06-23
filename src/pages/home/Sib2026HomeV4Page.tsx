import React, { useEffect } from 'react';

const HOME_SRC = '/sib2026-home-v4/home-sib2026.html?embedded=1';

/** Accueil SIB 2026 — maquette SIB2026-home-optimized-v4 (iframe) */
export default function Sib2026HomeV4Page() {
  useEffect(() => {
    document.documentElement.classList.add('sib-home-v4-embedded');
    return () => document.documentElement.classList.remove('sib-home-v4-embedded');
  }, []);

  return (
    <iframe
      src={HOME_SRC}
      title="SIB 2026 — Salon International du Bâtiment"
      className="block w-full border-0 bg-[#f7f7f5]"
      style={{ height: '100dvh', minHeight: '100dvh' }}
    />
  );
}
