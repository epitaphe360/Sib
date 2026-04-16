/**
 * Admin PartnersPageOptimized - Admin Partners Management with Pagination
 *
 * Features:
 * - Pagination (15 partners/page)
 * - Advanced search (organization_name, sector, country)
 * - Filters (partner_type, status)
 * - Export (CSV/Excel/PDF) with rate limiting
 * - Sorting (organization_name, sector, partner_type, contract_value, status)
 * - Stats cards with contract value totals
 * - Details modal
 * - WCAG 2.1 Level AA compliant
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Crown,
  Search,
  Filter,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  DollarSign,
  Building2,
  Mail,
  Phone,
  Globe,
  Award,
  X,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useOptimizedList } from '../../hooks/useOptimizedList';
import { exportService } from '../../services/exportService';
import { RATE_LIMITS, useRateLimit } from '../../middleware/rateLimiter';
import { logger } from '../../lib/logger';

interface Partner {
  id: string;
  organization_name: string;
  partner_type: 'organizer' | 'co_organizer' | 'official_sponsor' | 'delegated_organizer' | 'partner' | 'press_partner';
  sector: string;
  country: string;
  website: string | null;
  description: string;
  contact_info: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  sponsorship_level: string;
  contract_value: number;
  contributions: string[];
  established_year: number;
  employees: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  logo_url?: string;
}

export default function PartnersPageOptimized() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { checkLimit } = useRateLimit(undefined, RATE_LIMITS.EXPORT);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getAll('partners');
      const formattedData = data.map((item: any) => ({
        ...item,
        organization_name: item.organization_name || 'N/A',
        partner_type: item.partner_type || 'silver',
        sector: item.sector || 'N/A',
        country: item.country || 'N/A',
        description: item.description || 'N/A',
        contact_info: item.contact_info || { name: 'N/A', email: 'N/A', phone: 'N/A', position: 'N/A' },
        sponsorship_level: item.sponsorship_level || 'N/A',
        contract_value: item.contract_value || 0,
        contributions: item.contributions || [],
        established_year: item.established_year || new Date().getFullYear(),
        employees: item.employees || 'N/A',
        status: item.status || 'pending',
      }));
      setPartners(formattedData as Partner[]);
      logger.info('Partners loaded successfully', { count: formattedData.length });
    } catch (err) {
      logger.error('Error fetching partners', err as Error);
      setError('Échec du chargement des partenaires. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const {
    paginatedItems,
    filteredItems,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    sortField,
    sortDirection,
    toggleSort,
  } = useOptimizedList<Partner>({
    items: partners,
    itemsPerPage: 15,
    searchFields: ['organization_name', 'sector', 'country'],
    initialSortField: 'organization_name',
    initialSortDirection: 'asc',
    filterFn: (partner, filters) => {
      if (filters.partner_type && partner.partner_type !== filters.partner_type) {return false;}
      if (filters.status && partner.status !== filters.status) {return false;}
      return true;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getPartnerTypeBadge = (type: string) => {
    const badges = {
      organizer: { label: 'Organisateur', color: 'bg-purple-100 text-purple-800' },
      co_organizer: { label: 'Co-Organisateur', color: 'bg-indigo-100 text-indigo-800' },
      official_sponsor: { label: 'Sponsor Officiel', color: 'bg-yellow-100 text-yellow-800' },
      delegated_organizer: { label: 'Org. Délégué', color: 'bg-blue-100 text-blue-800' },
      partner: { label: 'Partenaire', color: 'bg-gray-100 text-gray-600' },
      press_partner: { label: 'Partenaire Presse', color: 'bg-orange-100 text-orange-800' }
    };
    const badge = badges[type as keyof typeof badges] || badges.silver;
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actif</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactif</Badge>;
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const formatContractValue = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleViewDetails = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDetails(true);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!checkLimit()) {
      alert('Limite d\'export atteinte. Veuillez réessayer plus tard.');
      return;
    }

    try {
      await exportService.exportPartners(filteredItems, format);
      logger.info('Partners exported', { format, count: filteredItems.length });
    } catch (error) {
      logger.error('Export failed', error as Error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  const renderSortIcon = (field: keyof Partner) => {
    if (sortField !== field) {return null;}
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Partenaires</h1>
              <p className="text-gray-600 mt-2">
                Administration complète des partenaires et sponsors SIB
              </p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_PARTNER}>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Créer Partenaire
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Partenaires</p>
                  <p className="text-3xl font-bold text-gray-900">{partners.length}</p>
                </div>
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-3xl font-bold text-green-600">
                    {partners.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sponsors Officiels</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {partners.filter(p => ['official_sponsor', 'organizer'].includes(p.partner_type)).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatContractValue(partners.reduce((sum, p) => sum + p.contract_value, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {partners.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un partenaire..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filters.partner_type || ''}
                    onChange={(e) => setFilter('partner_type', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Tous les types</option>
                    <option value="organizer">Organisateur</option>
                    <option value="co_organizer">Co-Organisateur</option>
                    <option value="official_sponsor">Sponsor Officiel</option>
                    <option value="delegated_organizer">Org. Délégué</option>
                    <option value="partner">Partenaire</option>
                    <option value="press_partner">Partenaire Presse</option>
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilter('status', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600 mr-4">
                  {totalItems} partenaire{totalItems > 1 ? 's' : ''}
                </p>
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Partners Table */}
        <Card>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSort('organization_name')}
                    >
                      Organisation {renderSortIcon('organization_name')}
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSort('partner_type')}
                    >
                      Type {renderSortIcon('partner_type')}
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSort('sector')}
                    >
                      Secteur {renderSortIcon('sector')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pays</th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSort('contract_value')}
                    >
                      Valeur Contrat {renderSortIcon('contract_value')}
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSort('status')}
                    >
                      Statut {renderSortIcon('status')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucun partenaire trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((partner, index) => (
                      <motion.tr
                        key={partner.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{partner.organization_name}</p>
                              <p className="text-sm text-gray-600">{partner.contact_info.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getPartnerTypeBadge(partner.partner_type)}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{partner.sector}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{partner.country}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-green-600">
                            {formatContractValue(partner.contract_value)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(partner.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(partner)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={15}
              onPageChange={goToPage}
              showItemsCount={true}
            />
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedPartner.organization_name}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      {getPartnerTypeBadge(selectedPartner.partner_type)}
                      {getStatusBadge(selectedPartner.status)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Informations Générales</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Secteur</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPartner.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Pays</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPartner.country}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Site Web</p>
                          <a
                            href={selectedPartner.website || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {selectedPartner.website || 'N/A'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Principal</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Nom</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPartner.contact_info.name}</p>
                          <p className="text-xs text-gray-600">{selectedPartner.contact_info.position}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPartner.contact_info.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Téléphone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPartner.contact_info.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
                  <p className="text-sm text-gray-700">{selectedPartner.description}</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contributions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.contributions.map((contribution) => (
                      <Badge key={contribution} variant="info">{contribution}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Valeur du Contrat</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatContractValue(selectedPartner.contract_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Date de Création</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedPartner.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
