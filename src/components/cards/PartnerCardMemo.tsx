/**
 * PartnerCard optimisé avec React.memo
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Crown } from 'lucide-react';
import type { Partner } from '../../types';
import LogoWithFallback from '../ui/LogoWithFallback';

export interface PartnerCardProps {
  partner: Partner;
  onClick?: (partner: Partner) => void;
}

const PartnerCardComponent: React.FC<PartnerCardProps> = ({ partner, onClick }) => {
  const getTierIcon = (tier: string) => {
    if (tier === 'organizer' || tier === 'co_organizer') {
      return <Crown className="h-5 w-5 text-yellow-600" />;
    }
    if (tier === 'official_sponsor') {
      return <Crown className="h-5 w-5 text-purple-500" />;
    }
    if (tier === 'delegated_organizer') {
      return <Crown className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  const getTierBadgeColor = (tier: string) => {
    if (tier === 'organizer' || tier === 'co_organizer') return 'bg-yellow-100 text-yellow-800';
    if (tier === 'official_sponsor') return 'bg-purple-100 text-purple-800';
    if (tier === 'delegated_organizer') return 'bg-green-100 text-green-800';
    if (tier === 'press_partner') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Link
      to={`/partners/${partner.id}`}
      onClick={(e) => onClick && (e.preventDefault(), onClick(partner))}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Header with tier */}
      <div className="relative h-48 bg-gradient-to-br from-purple-50 via-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        <LogoWithFallback
          src={partner.logo}
          alt={partner.organizationName || partner.name || 'Partner'}
          className="max-h-40 max-w-full object-contain p-6 group-hover:scale-110 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {partner.verified && (
            <div className="bg-green-500 text-white p-1.5 rounded-full" title="Vérifié">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
          {partner.featured && (
            <div className="bg-yellow-500 text-white p-1.5 rounded-full" title="En vedette">
              <Star className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Tier badge */}
        {partner.partnerType && (
          <div className="absolute top-2 left-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${getTierBadgeColor(partner.partnerType)} flex items-center gap-1`}>
              {getTierIcon(partner.partnerType)}
              {partner.partnerType.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {partner.organizationName}
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {partner.sector}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {partner.country}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {partner.description}
        </p>

        {partner.sponsorshipLevel && (
          <div className="text-sm text-gray-500">
            Niveau: <span className="font-medium">{partner.sponsorshipLevel}</span>
          </div>
        )}

        {partner.contributions && partner.contributions.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            {partner.contributions.length} contribution
            {partner.contributions.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Link>
  );
};

export const PartnerCard = React.memo(
  PartnerCardComponent,
  (prev, next) =>
    prev.partner.id === next.partner.id &&
    prev.partner.organizationName === next.partner.organizationName &&
    prev.partner.logo === next.partner.logo &&
    prev.partner.verified === next.partner.verified &&
    prev.partner.featured === next.partner.featured
);

PartnerCard.displayName = 'PartnerCard';

