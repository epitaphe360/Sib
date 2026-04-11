import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';
import { ArrowLeft, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ExhibitorHeaderProps {
  companyName: string;
  logo: string;
  booth?: string;
  onAppointmentClick: () => void;
  onMessageClick: () => void;
  isAuthenticated: boolean;
}

// OPTIMIZATION: Memoized exhibitor header component
export const ExhibitorHeader: React.FC<ExhibitorHeaderProps> = memo(({
  companyName,
  logo,
  booth,
  onAppointmentClick,
  onMessageClick,
  isAuthenticated
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back Button */}
          <Link to={ROUTES.EXHIBITORS}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux exposants
            </Button>
          </Link>

          {/* Logo and Company Name */}
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt={companyName}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-bold text-gray-900">{companyName}</span>
            {booth && (
              <span className="text-sm text-gray-500">Stand {booth}</span>
            )}
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-gray-700 hover:text-blue-600 transition-colors">Accueil</a>
            <a href="#apropos" className="text-gray-700 hover:text-blue-600 transition-colors">À propos</a>
            <a href="#produits" className="text-gray-700 hover:text-blue-600 transition-colors">Produits</a>
            <a href="#actualites" className="text-gray-700 hover:text-blue-600 transition-colors">Actualités</a>
            <a href="#galerie" className="text-gray-700 hover:text-blue-600 transition-colors">Galerie</a>
            <a href="#disponibilites" className="text-gray-700 hover:text-blue-600 transition-colors">Disponibilités</a>
          </div>

          {/* Action Buttons */}
          {isAuthenticated && (
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={onMessageClick}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="default" size="sm" onClick={onAppointmentClick}>
                <Calendar className="h-4 w-4 mr-2" />
                Prendre RDV
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});

ExhibitorHeader.displayName = 'ExhibitorHeader';
