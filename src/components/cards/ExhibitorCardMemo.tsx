/**
 * ExhibitorCard optimisé avec React.memo
 * Évite re-renders inutiles dans listes
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, CheckCircle, Star } from 'lucide-react';
import type { Exhibitor } from '../../types';

export interface ExhibitorCardProps {
  exhibitor: Exhibitor;
  onClick?: (exhibitor: Exhibitor) => void;
  showActions?: boolean;
}

const ExhibitorCardComponent: React.FC<ExhibitorCardProps> = ({
  exhibitor,
  onClick,
  showActions = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(exhibitor);
    }
  };

  return (
    <Link
      to={`/exhibitors/${exhibitor.id}`}
      onClick={handleClick}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
    >
      {/* Logo */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        {exhibitor.logo ? (
          <img
            src={exhibitor.logo}
            alt={`${exhibitor.companyName} logo`}
            className="max-h-32 max-w-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <Building2 className="h-20 w-20 text-blue-300" />
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {exhibitor.verified && (
            <div
              className="bg-green-500 text-white p-1.5 rounded-full"
              title="Vérifié"
            >
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
          {exhibitor.featured && (
            <div
              className="bg-yellow-500 text-white p-1.5 rounded-full"
              title="En vedette"
            >
              <Star className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Company name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {exhibitor.companyName}
        </h3>

        {/* Category & Sector */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {exhibitor.category}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {exhibitor.sector}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {exhibitor.description}
        </p>

        {/* Location */}
        {exhibitor.contactInfo?.city && exhibitor.contactInfo?.country && (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {exhibitor.contactInfo.city}, {exhibitor.contactInfo.country}
            </span>
          </div>
        )}

        {/* Stand number */}
        {exhibitor.standNumber && (
          <div className="text-sm font-medium text-blue-600">
            Stand: {exhibitor.standNumber}
          </div>
        )}

        {/* Products count */}
        {exhibitor.products && exhibitor.products.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            {exhibitor.products.length} produit
            {exhibitor.products.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Voir le profil
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

/**
 * Optimized with React.memo
 * Only re-renders if exhibitor data changes
 */
export const ExhibitorCard = React.memo(
  ExhibitorCardComponent,
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if these change
    return (
      prevProps.exhibitor.id === nextProps.exhibitor.id &&
      prevProps.exhibitor.companyName === nextProps.exhibitor.companyName &&
      prevProps.exhibitor.logo === nextProps.exhibitor.logo &&
      prevProps.exhibitor.verified === nextProps.exhibitor.verified &&
      prevProps.exhibitor.featured === nextProps.exhibitor.featured &&
      prevProps.showActions === nextProps.showActions
    );
  }
);

ExhibitorCard.displayName = 'ExhibitorCard';
