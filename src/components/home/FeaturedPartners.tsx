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
          'organizer': 1,
          'co_organizer': 2,
          'official_sponsor': 3,
          'delegated_organizer': 4,
          'partner': 5,
          'press_partner': 6,
        };

        const sorted = [...pool].sort((a, b) => {
          const pa = tierPriority[a.partner_tier || a.partner_type || a.partnerType || ''] ?? 99;
          const pb = tierPriority[b.partner_tier || b.partner_type || b.partnerType || ''] ?? 99;
          if (pa !== pb) {return pa - pb;}
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
      'organizer': 'Organisateurs',
      'co_organizer': 'Co-organisateurs',
      'official_sponsor': 'Sponsor Officiel',
      'delegated_organizer': 'Organisateur Délégué',
      'partner': 'Nos Partenaires',
      'press_partner': 'Nos Partenaires Presse'
    };
    return labels[tier] || tier;
  };

  const getTierColor = (tier: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'organizer': 'warning',
      'co_organizer': 'warning',
      'official_sponsor': 'info',
      'delegated_organizer': 'success',
      'partner': 'default',
      'press_partner': 'error'
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

  if (partners.length === 0) {return null;}

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(231,209,146,1) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="luxury-badge mb-5 inline-flex items-center gap-2">
            <Award className="h-3 w-3" />
            {t('home.featured_partners_badge', 'Partenaires Officiels')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-light text-[#1A1A1A] mb-4 mt-3"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {t('home.featured_partners_title', 'Partenaires à la Une')}
          </h2>
          <p className="text-base text-[#666] max-w-2xl mx-auto leading-relaxed font-light">
            {t('home.featured_partners_desc', 'Les organisations leaders qui soutiennent SIB 2026')}
          </p>
          <div className="luxury-divider mt-6">
            <span />
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
              <Card hover className="h-full shadow-none hover:shadow-luxury transition-all duration-400 bg-white relative" style={{ border: '0.5px solid rgba(231,209,146,0.25)' }}>
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
                      className="h-24 w-24 rounded-sm object-contain border bg-white p-2"
                      style={{ borderColor: 'rgba(231,209,146,0.3)' }}
                    />
                  </div>

                  {/* Nom et secteur centrés */}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight px-2">
                      {partner.name}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: '#C9A84C' }}>{translateSector(partner.sector, t)}</p>
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
            <button className="luxury-btn group inline-flex items-center gap-2">
              {t('home.discover_all')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
