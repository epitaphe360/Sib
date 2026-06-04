import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, Store } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import {
  DEFAULT_SALON_CONFIG,
  formatSalonDatesShort,
  formatSalonHours,
} from '../../config/salonInfo';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Bandeau événement (dates, lieu, horaires + CTAs) — inspiré BATIMAT / BIG5.
 */
export const HomeEventBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-primary-900 text-white border-b border-primary-800">
      <div className="max-w-container mx-auto px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold tracking-wide">
            <Calendar className="h-4 w-4 text-accent-400 shrink-0" />
            {formatSalonDatesShort()} · 2026
          </span>
          <span className="inline-flex items-center gap-2 text-white/85">
            <MapPin className="h-4 w-4 text-accent-400 shrink-0" />
            {DEFAULT_SALON_CONFIG.location.venue}, {DEFAULT_SALON_CONFIG.location.city}
          </span>
          <span className="inline-flex items-center gap-2 text-white/75 text-xs sm:text-sm">
            <Clock className="h-4 w-4 text-accent-400 shrink-0" />
            {formatSalonHours(DEFAULT_SALON_CONFIG)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="#badges">
            <Button variant="accent" size="sm" className="whitespace-nowrap">
              <Ticket className="h-4 w-4 mr-1" />
              {t('home.event_bar.ticket')}
            </Button>
          </a>
          <Link to={ROUTES.EXHIBITOR_SUBSCRIPTION}>
            <Button
              size="sm"
              className="whitespace-nowrap bg-white/10 border border-white/25 text-white hover:bg-white/20"
            >
              <Store className="h-4 w-4 mr-1" />
              {t('home.event_bar.exhibit')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeEventBar;
