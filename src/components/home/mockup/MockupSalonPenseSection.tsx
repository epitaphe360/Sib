import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOCKUP } from './tokens';
import { getMockupCardBg, getMockupCardImage } from './assets';

export interface SalonPenseItem {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
}

/** Carte HTML — fond photo + texte (page d'accueil) */
const SalonPenseCard: React.FC<{ item: SalonPenseItem; onNavigate?: () => void }> = ({ item, onNavigate }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className="group relative flex min-h-[130px] lg:min-h-[150px] overflow-hidden"
      style={{ border: `1px solid ${MOCKUP.cardBorder}` }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${getMockupCardBg(item.key)})` }}
        aria-hidden
      />
      <div className="absolute inset-0" style={{ backgroundColor: MOCKUP.cardOverlay }} />
      <div className="relative z-10 flex h-full w-full gap-3 p-5 lg:p-6">
        <Icon className="mt-0.5 h-6 w-6 shrink-0 lg:h-7 lg:w-7" style={{ color: MOCKUP.orange }} strokeWidth={1.5} />
        <div className="min-w-0 flex-1 pr-6">
          <span className="block font-extrabold uppercase text-[12px] lg:text-[13px] leading-tight tracking-wide text-white">
            {item.title}
          </span>
          <p className="mt-2 text-[11px] lg:text-xs leading-snug" style={{ color: MOCKUP.grayText }}>
            {item.description}
          </p>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 group-hover:translate-x-0.5 transition-transform" style={{ color: MOCKUP.orange }} strokeWidth={2} />
      </div>
    </Link>
  );
};

/** Carte image seule — dropdown menu */
const SalonPenseCardImage: React.FC<{ item: SalonPenseItem; onNavigate?: () => void }> = ({ item, onNavigate }) => (
  <Link to={item.href} onClick={onNavigate} className="block overflow-hidden" style={{ border: `1px solid ${MOCKUP.cardBorder}` }}>
    <img src={getMockupCardImage(item.key)} alt={item.title} className="w-full h-auto block" />
  </Link>
);

interface MockupSalonPenseSectionProps {
  items: SalonPenseItem[];
  onNavigate?: () => void;
  dropdown?: boolean;
  compact?: boolean;
}

export const MockupSalonPenseSection: React.FC<MockupSalonPenseSectionProps> = ({
  items,
  onNavigate,
  dropdown = false,
  compact = false,
}) => {
  const { t } = useTranslation();
  const titleLines = t('mockup.salon_pense.title_lines').split('|');
  const useImageCards = dropdown || compact;
  const Card = useImageCards ? SalonPenseCardImage : SalonPenseCard;

  const titleBlock = (
    <div
      className={
        dropdown
          ? 'flex w-[180px] shrink-0 items-center px-5 py-8'
          : compact
            ? 'px-5 py-4 border-b border-white/10'
            : 'flex shrink-0 items-center px-8 lg:px-12 py-12 lg:w-[220px] xl:w-[260px]'
      }
    >
      <h2 className={`mockup-display font-extrabold uppercase leading-[1.1] text-white ${dropdown ? 'text-base' : compact ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
        {titleLines.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </h2>
    </div>
  );

  const grid = (
    <div className={`grid gap-[2px] p-[2px] ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`} style={{ backgroundColor: MOCKUP.navy }}>
      {items.map((item) => (
        <Card key={item.key} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="mx-3 mb-2 overflow-hidden" style={{ backgroundColor: MOCKUP.navy }}>
        {titleBlock}
        {grid}
      </div>
    );
  }

  if (dropdown) {
    return (
      <div className="overflow-hidden shadow-2xl" style={{ border: `1px solid ${MOCKUP.cardBorder}` }}>
        <div className="flex w-[min(900px,calc(100vw-2rem))]" style={{ backgroundColor: MOCKUP.navy }}>
          {titleBlock}
          <div className="flex-1 min-w-0">{grid}</div>
        </div>
      </div>
    );
  }

  return (
    <section id="salon-pense" style={{ backgroundColor: MOCKUP.navy }}>
      <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto">
        {titleBlock}
        <div className="flex-1 min-w-0">{grid}</div>
      </div>
    </section>
  );
};
