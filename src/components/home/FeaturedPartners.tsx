import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { CheckCircle, Eye, ArrowRight, Award, Handshake } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SupabaseService } from '../../services/supabaseService';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { translateSector } from '../../utils/sectorTranslations';
import { MoroccanPattern } from '../ui/MoroccanDecor';
import LogoWithFallback from '../ui/LogoWithFallback';
import { LogoShowcaseSection } from './LogoShowcaseSection';

export const FeaturedPartners: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getPartners();
        // Filter for featured partners, or fallback to all
        const pool = data.filter(p => p.featured).length > 0 ? data.filter(p => p.featured) : data;

        // Ordre de priorité des tiers
        const tierPriority: Record<string, number> = {
          'egide': 1,
          'strategic': 2,
          'platinum': 3,
          'gold': 4,
          'academic': 5,
          'cultural': 6,
          'silver': 7,
          'support': 8,
          'museum': 9,
        };

        const sorted = [...pool].sort((a, b) => {
          const pa = tierPriority[a.partner_tier || a.partner_type || a.partnerType || ''] ?? 99;
          const pb = tierPriority[b.partner_tier || b.partner_type || b.partnerType || ''] ?? 99;
          if (pa !== pb) return pa - pb;
          // À égalité de tier, ordre alphabétique
          return (a.organization_name || a.organizationName || a.company_name || '').localeCompare(b.organization_name || b.organizationName || b.company_name || '');
        });

        setPartners(sorted.slice(0, 3));
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPartners();
  }, []);

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      'egide': 'Égide',
      'strategic': 'Stratégique',
      'platinum': 'Platinum',
      'gold': 'Gold',
      'silver': 'Silver',
      'support': 'Support',
      'cultural': 'Culturel',
      'academic': 'Académique',
      'museum': 'Museum'
    };
    return labels[tier] || tier;
  };

  const getTierColor = (tier: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'egide': 'error',
      'strategic': 'info',
      'platinum': 'warning',
      'gold': 'warning',
      'silver': 'info',
      'support': 'success',
      'cultural': 'error',
      'academic': 'success',
      'museum': 'default'
    };
    return colors[tier] || 'default';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-gray-50 rounded-lg p-6 h-80">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <MoroccanPattern className="opacity-[0.04] text-blue-600" scale={1.8} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 mb-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-sm font-semibold uppercase tracking-wider shadow-lg">
            <Award className="h-4 w-4 mr-2" />
            {t('home.featured_partners_badge', 'Partenaires Officiels')}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('home.featured_partners_title', 'Partenaires à la Une')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.featured_partners_desc', 'Les organisations leaders qui soutiennent SIPORTS 2026')}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Bande défilante des logos partenaires */}
      <div className="mb-12">
        <LogoShowcaseSection type="partners" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white relative">
                <div className="flex flex-col h-full p-8">
                  {/* Badge vérifié en haut à droite */}
                  {partner.verified && (
                    <Badge variant="success" size="sm" className="absolute top-4 right-4 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('home.verified')}
                    </Badge>
                  )}

                  {/* Logo centré */}
                  <div className="flex justify-center mb-6">
                    <LogoWithFallback
                      src={partner.logo}
                      alt={partner.name}
                      className="h-40 w-40 rounded-2xl object-contain border-2 border-blue-100 bg-white p-4 shadow-md"
                    />
                  </div>

                  {/* Nom et secteur centrés */}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight px-2">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-semibold">{translateSector(partner.sector, t)}</p>
                  </div>

                  {/* Tier */}
                  <div className="flex justify-center mb-4">
                    <Badge variant={getTierColor(partner.partner_tier)} className="uppercase tracking-wider font-bold">
                      <Award className="h-3 w-3 mr-1" />
                      {getTierLabel(partner.partner_tier)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-4 mb-6 flex-grow text-center leading-relaxed">
                    {partner.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{partner.views || 0} {t('home.views', 'vues')}</span>
                    </div>
                    <div className="flex items-center">
                      <Handshake className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{partner.contributions?.length || 0} {t('home.benefits', 'avantages')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`${ROUTES.PARTNERS}/${partner.id}`)}
                    >
                      {t('home.see_profile', 'Voir le Profil')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`${ROUTES.CONTACT}?subject=Partenariat with ${partner.name}`)}
                    >
                      {t('home.contact_partner', 'Contacter')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to={ROUTES.PARTNERS}>
            <Button variant="outline" size="lg" className="group">
              {t('home.discover_all')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
