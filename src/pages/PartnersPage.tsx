import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid2x2 as Grid, List, Handshake, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';
import type { PartnerTier } from '../config/partnerTiers';
import { useTranslation } from '../hooks/useTranslation';
import { usePartnerTranslation } from '../hooks/usePartnerTranslation';
import { COUNTRIES } from '../data/countries';
import PartnerCard from '../components/partner/PartnerCard';
import { LogoShowcaseSection } from '../components/home/LogoShowcaseSection';
import { SmartImage } from '../components/ui/SmartImage';
import { IMAGES } from '../lib/images';

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

  const statCards: { key: keyof typeof partnerStats; label: string; icon?: any }[] = [
    { key: 'organizer', label: 'Organisateurs' },
    { key: 'co_organizer', label: 'Co-organisateurs' },
    { key: 'official_sponsor', label: 'Sponsor Officiel' },
    { key: 'delegated_organizer', label: 'Org. Délégué' },
    { key: 'partner', label: 'Nos Partenaires' },
    { key: 'press_partner', label: 'Presse' },
    { key: 'total', label: 'Total', icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-20">
        <div className="absolute inset-0 -z-10">
          <SmartImage
            source={IMAGES.business.handshake}
            aspect="auto"
            rounded="none"
            priority
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/92 via-primary-900/88 to-primary-900/95" />
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
        </div>

        <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                Partenaires SIB
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
            >
              {t('pages.partners.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-base lg:text-lg text-white/75 leading-relaxed"
            >
              {t('pages.partners.description')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Logo showcase */}
      <LogoShowcaseSection type="partners" />

      <div className="max-w-container mx-auto px-6 lg:px-8 py-12">
        {/* Search & controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t('pages.partners.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtres
            </Button>
            <div className="flex border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 p-1">
              <button
                type="button"
                onClick={() => setViewMode(CONFIG.viewModes.grid)}
                aria-label="Grid"
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${
                  viewMode === CONFIG.viewModes.grid
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode(CONFIG.viewModes.list)}
                aria-label="List"
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${
                  viewMode === CONFIG.viewModes.list
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-5 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] mb-2">
                  Niveau partenaire
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 rounded-lg text-sm text-neutral-900 dark:text-white transition-all"
                >
                  {partnerTiers.map((tier) => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] mb-2">
                  Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 rounded-lg text-sm text-neutral-900 dark:text-white transition-all"
                >
                  <option value="">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          {statCards.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              {Icon && (
                <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {partnerStats[key]}
              </div>
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Partners list grouped by tier */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 h-80 border border-neutral-200 dark:border-neutral-800">
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                  <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded mb-2" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Search className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
              {t('pages.partners.no_results')}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              {t('pages.partners.try_modify')}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSearchTerm('');
                setSelectedTier('');
                setSelectedCountry('');
              }}
            >
              {t('pages.partners.reset_filters')}
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {[
              { key: 'organizer', label: 'Organisateurs', accent: 'warning' },
              { key: 'co_organizer', label: 'Co-organisateurs', accent: 'warning' },
              { key: 'official_sponsor', label: 'Sponsor Officiel', accent: 'info' },
              { key: 'delegated_organizer', label: 'Organisateur Délégué', accent: 'success' },
              { key: 'partner', label: 'Nos Partenaires', accent: 'default' },
              { key: 'press_partner', label: 'Nos Partenaires Presse', accent: 'error' },
            ]
              .map((tier) => ({
                ...tier,
                partners: filteredPartners.filter((p) => p.partner_tier === tier.key),
              }))
              .filter((tier) => tier.partners.length > 0)
              .map((tier) => (
                <motion.section
                  key={tier.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <div className="sib-kicker mb-2">
                        {tier.partners.length} partenaire{tier.partners.length > 1 ? 's' : ''}
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        {tier.label}
                      </h2>
                    </div>
                  </div>

                  <div
                    className={
                      viewMode === CONFIG.viewModes.grid
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-6'
                    }
                  >
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

            <div className="pt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                {partners.length} affichés sur {totalPartners} partenaires
              </p>
              {hasMore && (
                <Button variant="primary" size="lg" onClick={handleLoadMore} disabled={isLoading}>
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

