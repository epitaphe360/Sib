import React, { memo } from 'react';
import { Star, Verified, MapPin, Users, ExternalLink, Calendar, Globe, MessageCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import LogoWithFallback from '../ui/LogoWithFallback';
import { LevelBadge } from '../common/QuotaWidget';
import { getExhibitorLevelByArea } from '../../config/exhibitorQuotas';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ExhibitorCardProps {
  exhibitor: {
    id: string;
    companyName: string;
    sector?: string;
    category: string;
    description?: string;
    logo?: string;
    country?: string;
    standArea?: number;
    featured?: boolean;
    verified?: boolean;
    minisiteUrl?: string;
    websiteUrl?: string;
  };
  viewMode?: 'grid' | 'list';
  index?: number;
  onViewDetails: (id: string) => void;
  onScheduleAppointment: (id: string) => void;
  onMessage?: (id: string) => void;
  canChat?: boolean;
  getCategoryLabel: (category: string) => string;
  getCategoryColor: (category: string) => 'default' | 'success' | 'warning' | 'error' | 'info';
  t: (key: string) => string;
}

/**
 * ⚡ OPTIMISÉ: ExhibitorCard mémorisé pour éviter les re-renders inutiles
 *
 * Ce composant est mémorisé avec React.memo pour éviter de re-render
 * quand ses props ne changent pas. Cela améliore considérablement
 * les performances sur les listes d'exposants.
 */
const ExhibitorCard: React.FC<ExhibitorCardProps> = memo(({
  exhibitor,
  viewMode = 'grid',
  index = 0,
  onViewDetails,
  onScheduleAppointment,
  getCategoryLabel,
  getCategoryColor,
  t
}) => {
  const handleViewDetails = React.useCallback(() => {
    onViewDetails(exhibitor.id);
  }, [onViewDetails, exhibitor.id]);

  const handleScheduleAppointment = React.useCallback(() => {
    onScheduleAppointment(exhibitor.id);
  }, [onScheduleAppointment, exhibitor.id]);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card hover className="flex items-center p-6 exhibitor-card" data-testid="exhibitor-card">
          <div className="flex items-center space-x-4 flex-grow">
            <LogoWithFallback
              src={exhibitor.logo}
              alt={exhibitor.companyName}
              className="h-16 w-16 rounded-lg object-contain flex-shrink-0"
            />

            <div className="flex-grow min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {exhibitor.companyName}
                </h3>
                {exhibitor.featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                )}
                {exhibitor.verified && (
                  <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                {exhibitor.sector && <span>{exhibitor.sector}</span>}
                {exhibitor.country && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {exhibitor.country}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={getCategoryColor(exhibitor.category)}
                  size="sm"
                >
                  {getCategoryLabel(exhibitor.category)}
                </Badge>
                {exhibitor.standArea && (
                  <LevelBadge
                    level={getExhibitorLevelByArea(exhibitor.standArea)}
                    type="exhibitor"
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <Link
              to={`/minisite/${exhibitor.id}`}
              className="inline-flex items-center px-4 py-2 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
            >
              <Globe className="h-4 w-4 mr-2" />
              Mini-site
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('actions.view_details')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleScheduleAppointment}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('actions.schedule_meeting')}
            </Button>
            {canChat && onMessage && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessage}
                title="Envoyer un message"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group h-full exhibitor-card"
      data-testid="exhibitor-card"
    >
      <div className="h-full bg-white rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden flex flex-col relative">
        {/* En-tête avec Motif Zellige */}
        <div className="relative h-32 bg-gradient-to-br from-slate-900 to-blue-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            {exhibitor.featured && (
              <div className="p-1.5 bg-amber-500 rounded-lg shadow-lg shadow-amber-900/20">
                <Star className="h-4 w-4 text-white fill-current" />
              </div>
            )}
            {exhibitor.verified && (
              <div className="p-1.5 bg-blue-500 rounded-lg shadow-lg shadow-blue-900/20">
                <Verified className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Logo overlapping header */}
        <div className="px-6 -mt-10 relative z-10 mb-4">
          <div className="inline-block p-2 bg-white rounded-3xl shadow-2xl border-4 border-white transform group-hover:scale-110 transition-transform duration-500">
            <LogoWithFallback
              src={exhibitor.logo}
              alt={exhibitor.companyName}
              className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-contain"
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col flex-grow">
          {/* Company Info */}
          <div className="mb-4">
            <h3 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
              {exhibitor.companyName}
            </h3>
            {exhibitor.sector && (
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{exhibitor.sector}</p>
              </div>
            )}
          </div>

          {/* Badges Level & Category */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              exhibitor.category === 'institutional' ? 'border-purple-100 bg-purple-50 text-purple-600' :
              exhibitor.category === 'port-industry' ? 'border-blue-100 bg-blue-50 text-blue-600' :
              exhibitor.category === 'port-operations' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
              'border-amber-100 bg-amber-50 text-amber-600'
            }`}>
              {getCategoryLabel(exhibitor.category)}
            </span>
            {exhibitor.standArea && (
              <div className="opacity-80 scale-90 origin-left">
                <LevelBadge
                  level={getExhibitorLevelByArea(exhibitor.standArea)}
                  type="exhibitor"
                  size="sm"
                />
              </div>
            )}
          </div>

          {/* Description */}
          {exhibitor.description && (
            <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3 font-medium leading-relaxed italic">
              "{exhibitor.description}"
            </p>
          )}

          {/* Location & Footer */}
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
            <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              {exhibitor.country || 'International'}
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to={`/minisite/${exhibitor.id}`}
                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                title="Voir le mini-site"
              >
                <Globe className="h-4 w-4" />
              </Link>
              <button
                onClick={handleViewDetails}
                className="p-2.5 bg-slate-50 text-slate-900 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title={t('actions.view_details')}
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={handleScheduleAppointment}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-110 transition-all shadow-lg shadow-blue-900/20"
                title={t('actions.schedule_meeting')}
              >
                <Calendar className="h-4 w-4" />
              </button>
              {canChat && onMessage && (
                <button
                  onClick={handleMessage}
                  className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:scale-110 transition-all shadow-lg shadow-green-900/20"
                  title="Envoyer un message"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // ⚡ Comparaison custom pour optimiser encore plus
  // Ne re-render que si les props pertinentes changent
  return (
    prevProps.exhibitor.id === nextProps.exhibitor.id &&
    prevProps.exhibitor.companyName === nextProps.exhibitor.companyName &&
    prevProps.exhibitor.featured === nextProps.exhibitor.featured &&
    prevProps.exhibitor.verified === nextProps.exhibitor.verified &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.index === nextProps.index &&
    prevProps.canChat === nextProps.canChat
  );
});

ExhibitorCard.displayName = 'ExhibitorCard';

export default ExhibitorCard;
