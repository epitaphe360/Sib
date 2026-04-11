import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, Building2, MapPin, Globe, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';
import { Exhibitor } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

export default function ExhibitorManagementPage() {
  const { t } = useTranslation();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStandArea, setFilterStandArea] = useState<string>('all');

  useEffect(() => {
    fetchExhibitors();
  }, []);

  const fetchExhibitors = async () => {
    setIsLoading(true);
    try {
      // Requête directe Supabase sans joins complexes pour l'admin
      const { data, error } = await supabase!
        .from('exhibitors')
        .select('id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, stand_number, contact_info, created_at, updated_at')
        .order('company_name', { ascending: true });

      if (error) {
        console.error('❌ Erreur chargement exposants admin:', error);
        toast.error('Impossible de récupérer la liste des exposants.');
        return;
      }

      const mapped = (data || []).map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        companyName: e.company_name,
        category: e.category,
        sector: e.sector,
        description: e.description,
        logo: e.logo_url,
        website: e.website,
        verified: e.verified ?? false,
        featured: e.featured ?? false,
        isPublished: false,
        standNumber: e.stand_number,
        contactInfo: e.contact_info || {},
        products: [],
        miniSite: null,
        availability: [],
        certifications: [],
        markets: [],
      }));
      setExhibitors(mapped as unknown as Exhibitor[]);
      console.log(`✅ Admin: ${mapped.length} exposants chargés`);
    } catch (error) {
      console.error('Erreur lors du chargement des exposants:', error);
      toast.error('Impossible de récupérer la liste des exposants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'exposant "${name}" ? Cette action est irréversible.`)) {
      try {
        console.log('🗑️ [DELETE] Début suppression exposant:', { id, name });
        
        // Récupérer le token pour l'API admin serveur
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔑 [DELETE] Session récupérée:', {
          hasSession: !!session,
          hasToken: !!session?.access_token,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          tokenPreview: session?.access_token?.substring(0, 20) + '...'
        });

        if (!session?.access_token) {
          throw new Error('Pas de session active - veuillez vous reconnecter');
        }
        
        const apiUrl = `/api/admin/exhibitors/${id}`;
        console.log('📡 [DELETE] Appel API:', { method: 'DELETE', url: apiUrl });
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 [DELETE] Réponse HTTP:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });

        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textBody = await response.text();
          console.error('❌ [DELETE] Réponse non-JSON reçue:', textBody.substring(0, 500));
          throw new Error(`Le serveur a retourné du ${contentType || 'inconnu'} au lieu de JSON. L'API admin n'est peut-être pas déployée.`);
        }
        
        const result = await response.json();
        console.log('📦 [DELETE] Corps de la réponse:', result);
        
        if (!response.ok || !result.success) {
          console.error('❌ [DELETE] Échec:', { status: response.status, result });
          throw new Error(result.error || `Échec HTTP ${response.status}`);
        }
        
        console.log('✅ [DELETE] Suppression réussie:', result.deleted);
        
        // Supprimer immédiatement du state local
        setExhibitors(exhibitors.filter(e => e.id !== id));
        
        toast.success('Exposant supprimé avec succès');
        setTimeout(() => fetchExhibitors(), 500);
      } catch (error: any) {
        console.error('❌ [DELETE] Erreur complète:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        toast.error(`Erreur: ${error.message || 'Suppression échouée'}`);
      }
    }
  };

  const filteredExhibitors = exhibitors.filter(exhibitor => {
    const matchesSearch = exhibitor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibitor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exhibitor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && exhibitor.verified) ||
                         (filterStatus === 'unverified' && !exhibitor.verified);
    const matchesStandArea = filterStandArea === 'all' || (exhibitor.standArea && exhibitor.standArea.toString() === filterStandArea);
    return matchesSearch && matchesCategory && matchesStatus && matchesStandArea;
  });

  const categories = Array.from(new Set(exhibitors.map(e => e.category)));
  const standAreas = Array.from(new Set(exhibitors.map(e => e.standArea).filter(Boolean))).sort((a, b) => (a || 0) - (b || 0));
  const verifiedCount = exhibitors.filter(e => e.verified).length;

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
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.exhibitors_management')}</h1>
              <p className="mt-2 text-gray-600">{t('admin.manage_exhibitors_desc')}</p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_EXHIBITOR}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Plus className="h-5 w-5 mr-2" />
                {t('admin.new_exhibitor')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.total_exhibitors')}</p>
                <p className="text-2xl font-bold text-gray-900">{exhibitors.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('common.verified')}</p>
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
                <p className="text-sm text-gray-600">{t('common.categories')}</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('common.not_verified')}</p>
                <p className="text-2xl font-bold text-orange-600">{exhibitors.length - verifiedCount}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-orange-600" />
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
                placeholder="Rechercher un exposant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:min-w-[200px] sm:w-auto"
              >
                <option value="all">Tous les types d'abonnement</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:min-w-[150px] sm:w-auto"
              >
                <option value="all">Tous les statuts</option>
                <option value="verified">Vérifiés</option>
                <option value="unverified">Non vérifiés</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterStandArea}
                onChange={(e) => setFilterStandArea(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:min-w-[150px] sm:w-auto"
              >
                <option value="all">Toutes surfaces</option>
                {standAreas.map(area => (
                  <option key={area} value={area}>{area} m²</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Exhibitors List */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des exposants...</p>
          </Card>
        ) : filteredExhibitors.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? 'Aucun exposant trouvé' : 'Aucun exposant'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par créer votre premier exposant'}
            </p>
            {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
              <Link to={ROUTES.ADMIN_CREATE_EXHIBITOR}>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un exposant
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExhibitors.map((exhibitor, index) => (
              <motion.div
                key={exhibitor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {exhibitor.logo && (
                        <img 
                          src={exhibitor.logo} 
                          alt={exhibitor.companyName}
                          className="w-24 h-24 object-contain mb-3 rounded bg-white border border-gray-200 p-2"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {exhibitor.companyName}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant={exhibitor.verified ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {exhibitor.verified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                        {exhibitor.featured && (
                          <Badge variant="info" className="text-xs">
                            Mis en avant
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm font-medium bg-blue-50 text-blue-800 p-2 rounded-md">
                      <Filter className="h-4 w-4 mr-2" />
                      Type: {exhibitor.category}
                    </div>
                    
                    {(exhibitor.standNumber || exhibitor.standArea) && (
                      <div className="flex items-center text-sm font-medium bg-gray-50 text-gray-800 p-2 rounded-md">
                        <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {exhibitor.standNumber && `Stand ${exhibitor.standNumber}`}
                          {exhibitor.standNumber && exhibitor.standArea && ' - '}
                          {exhibitor.standArea && `${exhibitor.standArea} m²`}
                        </span>
                      </div>
                    )}

                    {exhibitor.contactInfo?.country && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        {exhibitor.contactInfo.country}
                      </div>
                    )}
                    {exhibitor.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        <a href={exhibitor.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">
                          {exhibitor.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {exhibitor.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {exhibitor.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`${ROUTES.ADMIN_CREATE_EXHIBITOR}?edit=${exhibitor.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(exhibitor.id, exhibitor.companyName)}
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
