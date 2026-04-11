/**
 * SkipLink - WCAG 2.1 Requirement
 * Permet aux utilisateurs clavier de sauter la navigation
 */

import React from 'react';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
};

/**
 * Skip Links Container
 * Place at top of App.tsx
 */
export const SkipLinks: React.FC = () => {
  return (
    <div role="navigation" aria-label="Navigation rapide">
      <SkipLink href="#main-content">Aller au contenu principal</SkipLink>
      <SkipLink href="#main-navigation">Aller à la navigation</SkipLink>
      <SkipLink href="#search">Aller à la recherche</SkipLink>
      <SkipLink href="#footer">Aller au pied de page</SkipLink>
    </div>
  );
};
