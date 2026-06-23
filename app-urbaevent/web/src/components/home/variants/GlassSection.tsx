import React from 'react';

interface GlassSectionProps {
  children: React.ReactNode;
  className?: string;
}

/** Enveloppe P6 — carte verre dépoli */
export const GlassSection: React.FC<GlassSectionProps> = ({ children, className = '' }) => (
  <div className={`py-8 ${className}`}>
    <div className="max-w-container mx-auto px-6 lg:px-8">
      <div className="home-glass-panel rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  </div>
);

export default GlassSection;
