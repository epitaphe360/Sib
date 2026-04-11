import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, Handshake, MapPin, Globe, CheckCircle, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';
import { useTranslation } from '../../hooks/useTranslation';

interface PartnerUI {
  id: string;
  name: string;
  partner_tier: string;
  category: string;
  sector?: string;
  description: string;
  logo?: string;
  website?: string;
  country: string;
  verified: boolean;
  featured: boolean;
  contributions: string[];
}

export default function PartnerManagementPage() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<PartnerUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.getPartners();
      setPartners(data);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      toast.error('Impossible de récupérer la liste des partenaires.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${name}" ? Cette action est irréversible.`)) {
      try {
        const { error } = await supabase
          .from('partners')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Supprimer immédiatement du state local
        setPartners(partners.filter(p => p.id !== id));
        
        toast.success('Partenaire supprimé avec succès');
        // Ensuite faire un refresh complet
        setTimeout(() => fetchPartners(), 500);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || partner.partner_tier === filterTier;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && partner.verified) ||
                         (filterStatus === 'featured' && partner.featured);
    return matchesSearch && matchesTier && matchesStatus;
  });

  const tiers = Array.from(new Set(partners.map(p => p.partner_tier)));
  const verifiedCount = partners.filter(p => p.verified).length;
  const featuredCount = partners.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back_to_dashboard')}
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.partners_management')}</h1>
              <p className="mt-2 text-gray-600">{t('admin.manage_partners_desc')}</p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_PARTNER}>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-5 w-5 mr-2" />
                {t('admin.new_partner')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.total_partners')}</p>
                <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Handshake className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vérifiés</p>
                <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mis en avant</p>
                <p className="text-2xl font-bold text-yellow-600">{featuredCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Niveaux</p>
                <p className="text-2xl font-bold text-purple-600">{tiers.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un partenaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white w-full sm:min-w-[200px] sm:w-auto"
              >
                <option value="all">Tous les niveaux</option>
                {tiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white w-full sm:min-w-[150px] sm:w-auto"
              >
                <option value="all">Tous les statuts</option>
                <option value="verified">Vérifiés</option>
                <option value="featured">Mis en avant</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Partners List */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des partenaires...</p>
          </Card>
        ) : filteredPartners.length === 0 ? (
          <Card className="p-12 text-center">
            <Handshake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterTier !== 'all' || filterStatus !== 'all' ? 'Aucun partenaire trouvé' : 'Aucun partenaire'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterTier !== 'all' || filterStatus !== 'all'
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par créer votre premier partenaire'}
            </p>
            {!searchTerm && filterTier === 'all' && filterStatus === 'all' && (
              <Link to={ROUTES.ADMIN_CREATE_PARTNER}>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un partenaire
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {partner.logo && (
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="w-24 h-24 object-contain mb-3 rounded bg-white border border-gray-200 p-2"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {partner.name}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant={partner.verified ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {partner.verified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                        {partner.featured && (
                          <Badge variant="warning" className="text-xs">
                            ⭐ Mis en avant
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm font-medium bg-purple-50 text-purple-800 p-2 rounded-md">
                      <Star className="h-4 w-4 mr-2" />
                      Pack: {partner.partner_tier ? partner.partner_tier.charAt(0).toUpperCase() + partner.partner_tier.slice(1) : 'Standard'}
                    </div>
                    {partner.country && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                        {partner.country}
                      </div>
                    )}
                    {partner.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-indigo-500" />
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 truncate">
                          {partner.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {partner.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {partner.description}
                    </p>
                  )}

                  {partner.contributions && partner.contributions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Contributions:</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.contributions.slice(0, 3).map((contrib, idx) => (
                          <Badge key={idx} variant="default" className="text-xs">
                            {contrib}
                          </Badge>
                        ))}
                        {partner.contributions.length > 3 && (
                          <Badge variant="default" className="text-xs">
                            +{partner.contributions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`${ROUTES.ADMIN_CREATE_PARTNER}?edit=${partner.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(partner.id, partner.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
