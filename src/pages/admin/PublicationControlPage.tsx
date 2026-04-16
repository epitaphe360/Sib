import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  CheckCircle,
  Users,
  Building2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Partner {
  id: string;
  company_name: string;
  partnership_level: string;
  is_published: boolean;
  contact_info: { email: string } | null;
}

interface Exhibitor {
  id: string;
  company_name: string;
  category: string;
  sector: string;
  is_published: boolean;
  contact_info: { email: string } | null;
}

export default function PublicationControlPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'partners' | 'exhibitors'>('partners');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      // Load partners
      console.log('ðŸ”  [PublicationControl] Chargement des partenaires...');
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('id, company_name, partnership_level, is_published, contact_info')
        .order('company_name');

      console.log('ðŸ“Š [PublicationControl] Partenaires reÃ us:', {
        count: partnersData?.length || 0,
        error: partnersError?.message,
        data: partnersData
      });

      if (partnersError) {
        console.error('â Œ Erreur partners:', partnersError);
        throw partnersError;
      }
      setPartners(partnersData || []);

      // Load exhibitors
      console.log('ðŸ”  [PublicationControl] Chargement des exposants...');
      const { data: exhibitorsData, error: exhibitorsError } = await supabase
        .from('exhibitors')
        .select('id, company_name, category, sector, is_published, contact_info')
        .order('company_name');

      console.log('ðŸ“Š [PublicationControl] Exposants reÃ us:', {
        count: exhibitorsData?.length || 0,
        error: exhibitorsError?.message,
        data: exhibitorsData
      });

      if (exhibitorsError) {
        console.error('â Œ Erreur exhibitors:', exhibitorsError);
        throw exhibitorsError;
      }
      setExhibitors(exhibitorsData || []);
    } catch (error) {
      console.error('â Œ [PublicationControl] Error loading data:', error);
      toast.error('Erreur lors du chargement des donnÃ es');
    } finally {
      setLoading(false);
    }
  }

  async function togglePartnerPublication(partnerId: string, currentStatus: boolean) {
    setProcessing(partnerId);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { error } = await supabase
        .from('partners')
        // @ts-expect-error - Supabase type inference limitation
        .update({ is_published: !currentStatus } as any)
        .eq('id', partnerId);

      if (error) {throw error;}

      setPartners(prev =>
        prev.map(p => (p.id === partnerId ? { ...p, is_published: !currentStatus } : p))
      );

      toast.success(
        !currentStatus ? 'Partenaire publiÃ  âœ…' : 'Partenaire masquÃ  ðŸ”’'
      );
    } catch (error) {
      console.error('Error toggling partner:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setProcessing(null);
    }
  }

  async function toggleExhibitorPublication(exhibitorId: string, currentStatus: boolean) {
    setProcessing(exhibitorId);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { error } = await supabase
        .from('exhibitors')
        // @ts-expect-error - Supabase type inference limitation
        .update({ is_published: !currentStatus } as any)
        .eq('id', exhibitorId);

      if (error) {throw error;}

      setExhibitors(prev =>
        prev.map(e => (e.id === exhibitorId ? { ...e, is_published: !currentStatus } : e))
      );

      toast.success(
        !currentStatus ? 'Exposant publiÃ  âœ…' : 'Exposant masquÃ  ðŸ”’'
      );
    } catch (error) {
      console.error('Error toggling exhibitor:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setProcessing(null);
    }
  }

  async function toggleAllPartners(publish: boolean) {
    if (!confirm(`ÃŠtes-vous sÃ»r de vouloir ${publish ? 'PUBLIER' : 'MASQUER'} TOUS les partenaires ?`)) {
      return;
    }

    setProcessing('all-partners');
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      // Get all partner IDs first
      const { data: allPartners, error: fetchError } = await supabase
        .from('partners')
        .select('id');

      if (fetchError) {throw fetchError;}

      if (!allPartners || allPartners.length === 0) {
        toast.info('Aucun partenaire Ã  modifier');
        setProcessing(null);
        return;
      }

      console.log(`ðŸ”„ Mise Ã  jour de ${allPartners.length} partenaires...`);

      // Update using a valid condition that matches all records
      const { error } = await supabase
        .from('partners')
        // @ts-expect-error - Supabase type inference limitation
        .update({ is_published: publish } as any)
        .in('id', allPartners.map((p: any) => p.id));

      if (error) {throw error;}

      await loadData();
      toast.success(
        publish
          ? `âœ… ${allPartners.length} partenaires sont maintenant publiÃ s`
          : `ðŸ”’ ${allPartners.length} partenaires sont maintenant masquÃ s`
      );
    } catch (error) {
      console.error('Error toggling all partners:', error);
      toast.error('Erreur lors de la modification globale');
    } finally {
      setProcessing(null);
    }
  }

  async function toggleAllExhibitors(publish: boolean) {
    if (!confirm(`ÃŠtes-vous sÃ»r de vouloir ${publish ? 'PUBLIER' : 'MASQUER'} TOUS les exposants ?`)) {
      return;
    }

    setProcessing('all-exhibitors');
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      // Get all exhibitor IDs first
      const { data: allExhibitors, error: fetchError } = await supabase
        .from('exhibitors')
        .select('id');

      if (fetchError) {throw fetchError;}

      if (!allExhibitors || allExhibitors.length === 0) {
        toast.info('Aucun exposant Ã  modifier');
        setProcessing(null);
        return;
      }

      console.log(`ðŸ”„ Mise Ã  jour de ${allExhibitors.length} exposants...`);

      // Update using a valid condition that matches all records
      const { error } = await supabase
        .from('exhibitors')
        // @ts-expect-error - Supabase type inference limitation
        .update({ is_published: publish } as any)
        .in('id', allExhibitors.map((e: any) => e.id));

      if (error) {throw error;}

      await loadData();
      toast.success(
        publish
          ? `âœ… ${allExhibitors.length} exposants sont maintenant publiÃ s`
          : `ðŸ”’ ${allExhibitors.length} exposants sont maintenant masquÃ s`
      );
    } catch (error) {
      console.error('Error toggling all exhibitors:', error);
      toast.error('Erreur lors de la modification globale');
    } finally {
      setProcessing(null);
    }
  }

  const filteredPartners = partners.filter(p =>
    p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contact_info?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExhibitors = exhibitors.filter(e =>
    e.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.contact_info?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const partnersStats = {
    total: partners.length,
    published: partners.filter(p => p.is_published).length,
    hidden: partners.filter(p => !p.is_published).length
  };

  const exhibitorsStats = {
    total: exhibitors.length,
    published: exhibitors.filter(e => e.is_published).length,
    hidden: exhibitors.filter(e => !e.is_published).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ContrÃ le de Publication
          </h1>
          <p className="text-gray-600">
            GÃ rez la visibilitÃ  des partenaires et exposants sur le site public
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'partners'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 className="h-5 w-5 mr-2" />
            Partenaires ({partnersStats.total})
          </button>
          <button
            onClick={() => setActiveTab('exhibitors')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'exhibitors'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Exposants ({exhibitorsStats.total})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'partners' ? partnersStats.total : exhibitorsStats.total}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">PubliÃ s</p>
                <p className="text-2xl font-bold text-green-900">
                  {activeTab === 'partners' ? partnersStats.published : exhibitorsStats.published}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">MasquÃ s</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {activeTab === 'partners' ? partnersStats.hidden : exhibitorsStats.hidden}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* Global Controls - PARTENAIRES */}
        {activeTab === 'partners' && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-300">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    ContrÃ le Global PARTENAIRES
                  </h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                    {partnersStats.total} profils
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium ml-12">
                  âš  Activer ou dÃ sactiver <span className="font-bold text-purple-700">TOUS LES {partnersStats.total} PARTENAIRES</span> en un seul clic
                </p>
                <p className="text-xs text-gray-500 ml-12 mt-1">
                  âš ï   Cette action affecte UNIQUEMENT les partenaires (pas les exposants)
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => toggleAllPartners(true)}
                  disabled={processing === 'all-partners'}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 font-bold"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  âœ“ Tout Publier ({partnersStats.total})
                </Button>
                <Button
                  onClick={() => toggleAllPartners(false)}
                  disabled={processing === 'all-partners'}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-3 font-bold"
                >
                  <EyeOff className="h-5 w-5 mr-2" />
                  ðŸ”’ Tout Masquer ({partnersStats.total})
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Global Controls - EXPOSANTS */}
        {activeTab === 'exhibitors' && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    ContrÃ le Global EXPOSANTS
                  </h3>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    {exhibitorsStats.total} profils
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium ml-12">
                  âš  Activer ou dÃ sactiver <span className="font-bold text-emerald-700">TOUS LES {exhibitorsStats.total} EXPOSANTS</span> en un seul clic
                </p>
                <p className="text-xs text-gray-500 ml-12 mt-1">
                  âš ï   Cette action affecte UNIQUEMENT les exposants (pas les partenaires)
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => toggleAllExhibitors(true)}
                  disabled={processing === 'all-exhibitors'}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 font-bold"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  âœ“ Tout Publier ({exhibitorsStats.total})
                </Button>
                <Button
                  onClick={() => toggleAllExhibitors(false)}
                  disabled={processing === 'all-exhibitors'}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-3 font-bold"
                >
                  <EyeOff className="h-5 w-5 mr-2" />
                  ðŸ”’ Tout Masquer ({exhibitorsStats.total})
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Partners List */}
        {activeTab === 'partners' && (
          <div className="space-y-3">
            {filteredPartners.map(partner => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {partner.company_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {partner.partnership_level} â   {partner.contact_info?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {partner.is_published ? (
                        <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          PubliÃ 
                        </span>
                      ) : (
                        <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          MasquÃ 
                        </span>
                      )}

                      <button
                        onClick={() => togglePartnerPublication(partner.id, partner.is_published)}
                        disabled={processing === partner.id}
                        className={`p-2 rounded-lg transition-colors ${
                          partner.is_published
                            ? 'bg-red-100 hover:bg-red-200 text-red-600'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                      >
                        {partner.is_published ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredPartners.length === 0 && (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun partenaire trouvÃ </p>
              </Card>
            )}
          </div>
        )}

        {/* Exhibitors List */}
        {activeTab === 'exhibitors' && (
          <div className="space-y-3">
            {filteredExhibitors.map(exhibitor => (
              <motion.div
                key={exhibitor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {exhibitor.company_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {exhibitor.category} â   {exhibitor.sector} â   {exhibitor.contact_info?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {exhibitor.is_published ? (
                        <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          PubliÃ 
                        </span>
                      ) : (
                        <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          MasquÃ 
                        </span>
                      )}

                      <button
                        onClick={() =>
                          toggleExhibitorPublication(exhibitor.id, exhibitor.is_published)
                        }
                        disabled={processing === exhibitor.id}
                        className={`p-2 rounded-lg transition-colors ${
                          exhibitor.is_published
                            ? 'bg-red-100 hover:bg-red-200 text-red-600'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                      >
                        {exhibitor.is_published ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredExhibitors.length === 0 && (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun exposant trouvÃ </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
