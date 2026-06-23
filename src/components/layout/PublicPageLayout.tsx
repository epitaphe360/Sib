import React from 'react';

/** Enveloppe pages publiques — fond papier & typo SIB 2026 v4 */
export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sib-paper text-sib-ink">
      {children}
    </div>
  );
}

export default PublicPageLayout;
