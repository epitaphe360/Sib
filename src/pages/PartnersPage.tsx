import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid2x2 as Grid, List, Handshake } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';
import type { PartnerTier } from '../config/partnerTiers';
import { useTranslation } from '../hooks/useTranslation';
import { usePartnerTranslation } from '../hooks/usePartnerTranslation';
import { COUNTRIES } from '../data/countries';
import PartnerCard from '../components/partner/PartnerCard';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';

interface Partner {
  id: string;
  name: string;
  name_en?: string;
  partner_tier: PartnerTier; // Nouveau système: museum, silver, gold, platinum
  category: string;
  category_en?: string;
  description: string;
  description_en?: string;
  logo: string;
  website?: string;
  country: string;
  sector: string;
  sector_en?: string;
  verified: boolean;
  featured: boolean;
  contributions: string[];
  establishedYear: number;
  employees: string;
}

// Les partenaires sont maintenant chargés depuis Supabase
// Composant wrapper pour gérer la traduction de chaque partenaire
interface PartnerCardWrapperProps {
  partner: Partner;
  viewMode: 'grid' | 'list';
  index: number;
  onViewDetails: (id: string) => void;
  getCategoryLabel: (category: string) => string;
  getCategoryColor: (category: string) => 'default' | 'success' | 'warning' | 'error' | 'info';
  t: (key: string) => string;
}

const PartnerCardWrapper: React.FC<PartnerCardWrapperProps> = ({ 
  partner, 
  viewMode, 
  index, 
  onViewDetails, 
  getCategoryLabel, 
  getCategoryColor, 
  t 
}) => {
  const translatedContent = usePartnerTranslation(partner);
  
  return (
    <PartnerCard
      partner={partner}
      translatedContent={translatedContent}
      viewMode={viewMode}
      index={index}
      onViewDetails={onViewDetails}
      getCategoryLabel={getCategoryLabel}
      getCategoryColor={getCategoryColor}
      t={t}
    />
  );
};
export default function PartnersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [viewMode, setViewMode] = useState<keyof typeof CONFIG.viewModes>(CONFIG.viewModes.grid);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPartners, setTotalPartners] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 24;
  const [hasMore, setHasMore] = useState(true);
  const [partnerStats, setPartnerStats] = useState({
    organizer: 0,
    co_organizer: 0,
    official_sponsor: 0,
    delegated_organizer: 0,
    partner: 0,
    press_partner: 0,
    total: 0
  });

  const recomputePartnerStats = useCallback((data: Partner[]) => {
    const stats = {
      organizer: data.filter(p => p.partner_tier === 'organizer').length,
      co_organizer: data.filter(p => p.partner_tier === 'co_organizer').length,
      official_sponsor: data.filter(p => p.partner_tier === 'official_sponsor').length,
      delegated_organizer: data.filter(p => p.partner_tier === 'delegated_organizer').length,
      partner: data.filter(p => p.partner_tier === 'partner').length,
      press_partner: data.filter(p => p.partner_tier === 'press_partner').length,
      total: data.length
    };
    setPartnerStats(stats);
  }, []);

  const loadPartners = useCallback(async (reset = false) => {
      setIsLoading(true);
      try {
        const nextPage = reset ? 0 : currentPage;
        const offset = nextPage * pageSize;
        const { items, total } = await SupabaseService.getPartnersPaginated({
          limit: pageSize,
          offset,
        });

        const merged = reset
          ? items
          : [...partners, ...items.filter(p => !partners.some(existing => existing.id === p.id))];

        setPartners(merged);
        setFilteredPartners(merged);
        setTotalPartners(total);
        setCurrentPage(reset ? 1 : nextPage + 1);
        setHasMore(merged.length < total);
        recomputePartnerStats(merged);
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error);
        setPartners([]);
        setFilteredPartners([]);
        setTotalPartners(0);
        setCurrentPage(0);
        setHasMore(false);
        // Statistiques par défaut
        setPartnerStats({
          organizer: 0,
          co_organizer: 0,
          official_sponsor: 0,
          delegated_organizer: 0,
          partner: 0,
          press_partner: 0,
          total: 0
        });
      } finally {
        setIsLoading(false);
      }
    }, [currentPage, pageSize, partners, recomputePartnerStats]);

  useEffect(() => {
    loadPartners(true);
  }, []);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    await loadPartners(false);
  };

  useEffect(() => {
    const filtered = partners.filter(partner => {
      const search = searchTerm.toLowerCase();
      
      // Recherche dans tous les champs (FR et EN)
      const searchableFields = [
        partner.name || '',
        partner.name_en || '',
        partner.description || '',
        partner.description_en || '',
        partner.sector || '',
        partner.sector_en || '',
        partner.category || '',
        partner.category_en || ''
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchableFields.includes(search);
      const matchesTier = !selectedTier || partner.partner_tier === selectedTier;
      const matchesCountry = !selectedCountry || partner.country === selectedCountry;

      return matchesSearch && matchesTier && matchesCountry;
    });

    setFilteredPartners(filtered);
  }, [partners, searchTerm, selectedTier, selectedCountry]);

  // ? OPTIMISÉ: Mémoriser les tiers pour éviter recréation
  const partnerTiers = useMemo(() => [
    { value: '', label: t('pages.partners.filter_tier') },
    { value: 'organizer', label: 'Organisateurs' },
    { value: 'co_organizer', label: 'Co-organisateurs' },
    { value: 'official_sponsor', label: 'Sponsor Officiel' },
    { value: 'delegated_organizer', label: 'Organisateur Délégué' },
    { value: 'partner', label: 'Nos Partenaires' },
    { value: 'press_partner', label: 'Nos Partenaires Presse' },
  ], [t]);

  // ? OPTIMISÉ: Mémoriser les pays
  const countries = useMemo(() => {
    const partnerCountries = [...new Set(partners.map(p => p.country).filter(Boolean))];
    const allCountryNames = COUNTRIES.map(c => c.name);
    return [...new Set([...allCountryNames, ...partnerCountries])].sort();
  }, [partners]);

  // ? OPTIMISÉ: useCallback pour les handlers
  const handleViewDetails = useCallback((partnerId: string) => {
    navigate(`/partners/${partnerId}`);
  }, [navigate]);

  const getCategoryLabel = useCallback((category: string) => {
    const labels: Record<string, string> = {
      'industry': t('pages.partners.category_industry'),
      'service': t('pages.partners.category_service'),
      'technology': t('pages.partners.category_technology'),
      'education': t('pages.partners.category_education')
    };
    return labels[category] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'industry': 'error',
      'service': 'info',
      'technology': 'success',
      'education': 'warning'
    };
    return colors[category] || 'default';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('pages.partners.title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('pages.partners.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Logo Showcase Section - Bande défilante des logos partenaires */}
      <LogoShowcaseSection type="partners" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('pages.partners.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode(CONFIG.viewModes.grid)}
                className={`p-2 ${viewMode === CONFIG.viewModes.grid ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode(CONFIG.viewModes.list)}
                className={`p-2 ${viewMode === CONFIG.viewModes.list ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-gray-50 rounded-lg mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau partenaire
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {partnerTiers.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats - Types Partenaires SIB */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl mb-1">🏛️</div>
              <div className="text-xl font-bold text-gray-900">{partnerStats.organizer}</div>
              <div className="text-xs font-semibold text-gray-600">Organisateurs</div>
            </div>
          </Card>

          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl mb-1">🤝</div>
              <div className="text-xl font-bold text-gray-900">{partnerStats.co_organizer}</div>
              <div className="text-xs font-semibold text-gray-600">Co-organisateurs</div>
            </div>
          </Card>

          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-xl font-bold text-gray-900">{partnerStats.official_sponsor}</div>
              <div className="text-xs font-semibold text-gray-600">Sponsor Officiel</div>
            </div>
          </Card>

          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl mb-1">📋</div>
              <div className="text-xl font-bold text-gray-900">{partnerStats.delegated_organizer}</div>
              <div className="text-xs font-semibold text-gray-600">Org. Délégué</div>
            </div>
          </Card>

          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl mb-1">🌐</div>
              <div className="text-xl font-bold text-gray-900">{partnerStats.partner}</div>
              <div className="text-xs font-semibold text-gray-600">Nos Partenaires</div>
            </div>
          </Card>

          <Card>
            <div className="p-4 text-center">
              <div className="text-3xl mb-1">📰</div>
              <div className="text-xl font-bold text-gray-900">{partnerStats.press_partner}</div>
              <div className="text-xs font-semibold text-gray-600">Presse</div>
            </div>
          </Card>

          <Card>
            <div className="p-4 text-center">
              <Handshake className="h-7 w-7 text-blue-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{partnerStats.total}</div>
              <div className="text-xs font-semibold text-gray-600">Total</div>
            </div>
          </Card>
        </div>

        {/* Partners List - Grouped by Tier */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 h-80">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('pages.partners.no_results')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('pages.partners.try_modify')}
            </p>
            <Button variant="default" onClick={() => {
              setSearchTerm('');
              setSelectedTier('');
              setSelectedCountry('');
            }}>
              {t('pages.partners.reset_filters')}
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {[
              { key: 'organizer',           label: 'Organisateurs',         emoji: '🏛️', gradient: 'from-yellow-600 to-amber-700',   border: 'border-yellow-200', bg: 'bg-yellow-50' },
              { key: 'co_organizer',        label: 'Co-organisateurs',      emoji: '🤝', gradient: 'from-amber-500 to-yellow-600',  border: 'border-amber-200',  bg: 'bg-amber-50' },
              { key: 'official_sponsor',    label: 'Sponsor Officiel',      emoji: '⭐', gradient: 'from-blue-600 to-blue-800',     border: 'border-blue-200',   bg: 'bg-blue-50' },
              { key: 'delegated_organizer', label: 'Organisateur Délégué',  emoji: '📋', gradient: 'from-green-600 to-emerald-700', border: 'border-green-200',  bg: 'bg-green-50' },
              { key: 'partner',             label: 'Nos Partenaires',       emoji: '🌐', gradient: 'from-purple-500 to-indigo-600', border: 'border-purple-200', bg: 'bg-purple-50' },
              { key: 'press_partner',       label: 'Nos Partenaires Presse',emoji: '📰', gradient: 'from-red-600 to-rose-700',      border: 'border-red-200',    bg: 'bg-red-50' },
            ]
              .map(tier => ({
                ...tier,
                partners: filteredPartners.filter(p => p.partner_tier === tier.key)
              }))
              .filter(tier => tier.partners.length > 0)
              .map((tier) => (
                <motion.section
                  key={tier.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {/* Tier Section Header */}
                  <div className={`flex items-center gap-3 mb-5 p-4 rounded-xl ${tier.bg} border ${tier.border}`}>
                    <span className="text-3xl">{tier.emoji}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{tier.label}</h2>
                      <p className="text-sm text-gray-500">{tier.partners.length} partenaire{tier.partners.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Tier Partner Cards */}
                  <div className={viewMode === CONFIG.viewModes.grid
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                  }>
                    {tier.partners.map((partner, index) => (
                      <PartnerCardWrapper
                        key={partner.id}
                        partner={partner}
                        viewMode={viewMode}
                        index={index}
                        onViewDetails={handleViewDetails}
                        getCategoryLabel={getCategoryLabel}
                        getCategoryColor={getCategoryColor}
                        t={t}
                      />
                    ))}
                  </div>
                </motion.section>
              ))}

            <div className="pt-4 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">
                {partners.length} affichés sur {totalPartners} partenaires
              </p>
              {hasMore && (
                <Button onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

