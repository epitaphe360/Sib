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
  partner_tier: PartnerTier; // 6 types SIB: organizer, co_organizer, official_sponsor, delegated_organizer, partner, press_partner
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
    if (isLoading || !hasMore) {return;}
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
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Hero dark luxury */}
      <div className="relative bg-[#0A0F1E] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/85 via-[#0A0F1E]/75 to-[#0A0F1E]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#E7D192] text-xs font-bold tracking-widest uppercase mb-6">
              Partenaires & Sponsors
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
              {t('pages.partners.title')}
            </h1>
            <p className="text-lg text-white/55 max-w-2xl mx-auto">
              {t('pages.partners.description')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Logo Showcase Section - Bande défilante des logos partenaires */}
      <LogoShowcaseSection type="partners" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/30" />
            <input
              type="text"
              placeholder={t('pages.partners.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]/50"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/15 rounded-lg text-white/70 hover:border-[#C9A84C]/40 hover:text-[#E7D192] transition-colors text-sm"
            >
              <Filter className="h-4 w-4" />
              Filtres
            </button>

            <div className="flex border border-white/15 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode(CONFIG.viewModes.grid)}
                className={`p-2.5 transition-colors ${viewMode === CONFIG.viewModes.grid ? 'bg-[#C9A84C]/20 text-[#E7D192]' : 'text-white/40 hover:text-white/70'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode(CONFIG.viewModes.list)}
                className={`p-2.5 transition-colors ${viewMode === CONFIG.viewModes.list ? 'bg-[#C9A84C]/20 text-[#E7D192]' : 'text-white/40 hover:text-white/70'}`}
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
            className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
                  Niveau partenaire
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/50"
                >
                  {partnerTiers.map((tier) => (
                    <option key={tier.value} value={tier.value} className="bg-[#0A0F1E]">
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
                  Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/50"
                >
                  <option value="" className="bg-[#0A0F1E]">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country} className="bg-[#0A0F1E]">
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats - Types Partenaires SIB */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { count: partnerStats.organizer,           label: 'Organisateurs',     icon: '🏛️' },
            { count: partnerStats.co_organizer,        label: 'Co-organisateurs',  icon: '🤝' },
            { count: partnerStats.official_sponsor,    label: 'Sponsor Officiel',  icon: '⭐' },
            { count: partnerStats.delegated_organizer, label: 'Org. Délégué',      icon: '📋' },
            { count: partnerStats.partner,             label: 'Partenaires',       icon: '🌐' },
            { count: partnerStats.press_partner,       label: 'Presse',            icon: '📰' },
            { count: partnerStats.total,               label: 'Total',             icon: '🤝' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1.5">{stat.icon}</div>
              <div className="text-xl font-bold text-[#E7D192]">{stat.count}</div>
              <div className="text-[10px] font-medium text-white/45 uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Partners List - Grouped by Tier */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-white/5 border border-white/8 rounded-2xl p-6 h-80">
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="h-20 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/5 border border-white/10 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-10 w-10 text-white/30" />
            </div>
            <h3 className="text-lg font-display font-light text-white mb-2">
              {t('pages.partners.no_results')}
            </h3>
            <p className="text-white/40 mb-6">
              {t('pages.partners.try_modify')}
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedTier(''); setSelectedCountry(''); }}
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0F1E] font-bold px-5 py-2.5 rounded-sm hover:bg-[#E7D192] transition-colors text-sm"
            >
              {t('pages.partners.reset_filters')}
            </button>
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
                  <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-white/10 bg-white/5">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <h2 className="text-lg font-display font-light text-white">{tier.label}</h2>
                      <p className="text-xs text-white/40 uppercase tracking-wider">{tier.partners.length} partenaire{tier.partners.length > 1 ? 's' : ''}</p>
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
              <p className="text-sm text-white/35">
                {partners.length} affichés sur {totalPartners} partenaires
              </p>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-6 py-2.5 rounded-sm hover:bg-white/5 transition-colors text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

