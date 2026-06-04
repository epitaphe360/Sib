import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026 } from './tokens';
import { getSalonCardBg } from './assets';

export interface SalonGridItem {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const SalonGridCard: React.FC<{ item: SalonGridItem; onNavigate?: () => void }> = ({ item, onNavigate }) => {
  const Icon = item.icon;
  const bg = getSalonCardBg(item.key, true);
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className="group relative flex min-h-[128px] lg:min-h-[142px] overflow-hidden"
      style={{ border: `1px solid ${SIB2026.cardBorder}` }}
    >
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.12]"
        style={{
          backgroundImage: `image-set(url('${bg.webp}') type('image/webp'), url('${bg.jpg}') type('image/jpeg'))`,
          filter: 'saturate(0.75) brightness(0.52)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0" style={{ backgroundColor: SIB2026.cardOverlay }} />
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-5 lg:p-6">
        <div>
          <div className="flex items-start gap-3 mb-2">
            <Icon className="h-7 w-7 shrink-0" style={{ color: SIB2026.orange }} strokeWidth={1.5} />
            <span className="font-extrabold uppercase text-[13px] leading-tight tracking-wide text-white pt-0.5">
              {item.title}
            </span>
          </div>
          <p className="text-[11px] leading-snug pl-10" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {item.description}
          </p>
        </div>
        <ArrowRight
          className="absolute bottom-4 right-4 h-4 w-4 group-hover:translate-x-0.5 transition-transform"
          style={{ color: SIB2026.orange }}
          strokeWidth={2}
        />
      </div>
    </Link>
  );
};

interface Sib2026SalonGridSectionProps {
  items: SalonGridItem[];
  dropdown?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
}

export const Sib2026SalonGridSection: React.FC<Sib2026SalonGridSectionProps> = ({
  items,
  dropdown = false,
  compact = false,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const titleLines = t('mockup.salon_pense.title_lines').split('|');

  const titleBlock = (
    <div
      className={
        dropdown
          ? 'flex w-[190px] shrink-0 items-center px-6 py-8'
          : compact
            ? 'px-6 py-4 border-b border-white/10'
            : 'flex shrink-0 items-center px-8 lg:px-10 xl:px-12 py-14 lg:py-16 lg:w-[210px] xl:w-[240px]'
      }
    >
      <h2
        className={`sib2026-display font-extrabold uppercase leading-[1.08] text-white ${
          dropdown ? 'text-sm' : compact ? 'text-lg' : 'text-[22px] lg:text-2xl'
        }`}
      >
        {titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
    </div>
  );

  const gridCols = dropdown || compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2';

  const grid = (
    <div className={`grid ${gridCols} gap-[1px]`} style={{ backgroundColor: SIB2026.cardBorder }}>
      {items.map((item) => (
        <SalonGridCard key={item.key} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="mx-3 mb-2 overflow-hidden" style={{ backgroundColor: SIB2026.navy }}>
        {titleBlock}
        {grid}
      </div>
    );
  }

  if (dropdown) {
    return (
      <div className="overflow-hidden shadow-2xl" style={{ border: `1px solid ${SIB2026.cardBorder}` }}>
        <div className="flex w-[min(920px,calc(100vw-2rem))]" style={{ backgroundColor: SIB2026.navy }}>
          {titleBlock}
          <div className="flex-1 min-w-0">{grid}</div>
        </div>
      </div>
    );
  }

  return (
    <section id="salon-pense" style={{ backgroundColor: SIB2026.navy }} className="w-full">
      <div className="flex flex-col lg:flex-row w-full">
        {titleBlock}
        <div className="flex-1 min-w-0">{grid}</div>
      </div>
    </section>
  );
};
