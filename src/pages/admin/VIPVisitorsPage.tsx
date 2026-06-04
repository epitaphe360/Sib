import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import {
  Crown,
  Search,
  Download,
  Calendar,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface VIPVisitor {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  created_at: string;
  visitor_level: string;
  profile?: {
    country?: string;
    phone?: string;
    photoUrl?: string;
  };
  payments?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method?: string;
    created_at: string;
  }[];
}

export default function VIPVisitorsPage() {
  const { t } = useTranslation();
  const [visitors, setVisitors] = useState<VIPVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchVIPVisitors();
  }, []);

  const fetchVIPVisitors = async () => {
    setLoading(true);
    try {
      // 1. Fetch VIP Users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'visitor')
        .in('visitor_level', ['premium', 'vip'])
        .order('created_at', { ascending: false });

      if (usersError) {throw usersError;}

      // 2. Fetch Payment info for these users
      const userIds = usersData.map(u => u.id);

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_requests')
        .select('*')
        .in('user_id', userIds)
        .order('created_at', { ascending: false }); // Tous statuts : pending, approved, rejected

      if (paymentsError) {
        console.warn('Could not fetch payments', paymentsError);
      }

      // 3. Merge Data
      const mergedData = usersData.map(user => {
        const userPayments = paymentsData?.filter(p => p.user_id === user.id) || [];
        // Sort payments by date desc
        userPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          id: user.id,
          name: user.name || 'N/A',
          email: user.email,
          company: user.profile?.company,
          position: user.profile?.position,
          created_at: user.created_at,
          visitor_level: user.visitor_level,
          profile: user.profile,
          payments: userPayments
        };
      });

      setVisitors(mergedData);
    } catch (error) {
      console.error('Error fetching VIP visitors:', error);
      toast.error('Erreur lors du chargement des visiteurs VIP');
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = async (paymentId: string, userId: string) => {
    setProcessing(userId);
    try {
      const { error: payErr } = await supabase
        .from('payment_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', paymentId);
      if (payErr) {throw payErr;}
      const { error: userErr } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);
      if (userErr) {throw userErr;}
      toast.success('✅ Paiement validé et compte activé');
      fetchVIPVisitors();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la validation');
    } finally {
      setProcessing(null);
    }
  };

  const rejectPayment = async (paymentId: string, userId: string) => {
    setProcessing(userId);
    try {
      const { error: payErr } = await supabase
        .from('payment_requests')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', paymentId);
      if (payErr) {throw payErr;}
      const { error: userErr } = await supabase
        .from('users')
        .update({ visitor_level: 'free', status: 'pending' })
        .eq('id', userId);
      if (userErr) {throw userErr;}
      toast.success('🚫 Paiement refusé');
      fetchVIPVisitors();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du refus');
    } finally {
      setProcessing(null);
    }
  };

  // Valider un visiteur VIP sans transaction (confirmation manuelle)
  const validateVisitorDirectly = async (userId: string) => {
    setProcessing(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);
      if (error) {throw error;}
      const { error: pErr } = await supabase.from('payment_requests').insert({
        user_id: userId,
        amount: 300,
        currency: 'EUR',
        status: 'approved',
        payment_method: 'manual_admin',
        reviewed_at: new Date().toISOString(),
      });
      if (pErr) {console.warn('Transaction manuelle non créée:', pErr.message);}
      toast.success('✅ Visiteur VIP validé manuellement');
      fetchVIPVisitors();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la validation');
    } finally {
      setProcessing(null);
    }
  };

  // Refuser un visiteur VIP sans transaction (remettre en standard)
  const rejectVisitorDirectly = async (userId: string) => {
    setProcessing(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ visitor_level: 'free', status: 'pending' })
        .eq('id', userId);
      if (error) {throw error;}
      toast.success('🚫 Visiteur rétrogradé en Standard');
      fetchVIPVisitors();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du refus');
    } finally {
      setProcessing(null);
    }
  };

  const deleteVisitor = async (userId: string) => {
    setProcessing(userId);
    try {
      await supabase.from('payment_requests').delete().eq('user_id', userId);
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) {throw error;}
      toast.success('🗑️ Visiteur supprimé');
      setConfirmDelete(null);
      setVisitors(prev => prev.filter(v => v.id !== userId));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setProcessing(null);
    }
  };

  const filteredVisitors = visitors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Nom', 'Email', 'Société', 'Poste', 'Date Inscription', 'Niveau', 'Paiement', 'Montant', 'Date Paiement'];
    const csvContent = [
      headers.join(';'),
      ...filteredVisitors.map(v => {
        const lastPayment = v.payments?.[0];
        return [
          `"${v.name}"`,
          `"${v.email}"`,
          `"${v.company || ''}"`,
          `"${v.position || ''}"`,
          `"${new Date(v.created_at).toLocaleDateString()}"`,
          `"${v.visitor_level}"`,
          `"${lastPayment ? lastPayment.status : 'N/A'}"`,
          `"${lastPayment ? `${lastPayment.amount} ${lastPayment.currency}` : ''}"`,
          `"${lastPayment ? new Date(lastPayment.created_at).toLocaleDateString() : ''}"`
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vip_visitors_sib2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>

        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
              <span className="bg-yellow-100 p-2 rounded-lg">
                <Crown className="h-8 w-8 text-yellow-600" />
              </span>
              Gestion des Visiteurs VIP
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Liste complète des visiteurs Premium/VIP avec statut de paiement et détails.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-yellow-800 truncate">Total VIPs</dt>
                    <dd className="text-3xl font-bold text-yellow-900">{visitors.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-green-800 truncate">Paiements Validés</dt>
                    <dd className="text-3xl font-bold text-green-900">
                      {visitors.filter(v => v.payments && v.payments.length > 0).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
           <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-800 truncate">Nouveaux (30j)</dt>
                    <dd className="text-3xl font-bold text-blue-900">
                      {visitors.filter(v => {
                        const date = new Date(v.created_at);
                        const monthAgo = new Date();
                        monthAgo.setDate(monthAgo.getDate() - 30);
                        return date >= monthAgo;
                      }).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and List */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visiteur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Société / Poste
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Inscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut Paiement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails Transaction
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      Chargement des données...
                    </td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      Aucun visiteur VIP trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <motion.tr
                      key={visitor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                             {visitor.profile?.photoUrl ? (
                               <img className="h-10 w-10 rounded-full object-cover" src={visitor.profile.photoUrl} alt="" />
                             ) : (
                               <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                 <span className="text-yellow-800 font-bold text-sm">
                                   {visitor.name.charAt(0).toUpperCase()}
                                 </span>
                               </div>
                             )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {visitor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                           <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                           {visitor.company || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{visitor.position || 'Visiteur'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visitor.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const p = visitor.payments?.[0];
                          if (!p) {return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;}
                          if (p.status === 'approved') {return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Validé</Badge>;}
                          if (p.status === 'rejected') {return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />Refusé</Badge>;}
                          return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.payments && visitor.payments.length > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {visitor.payments[0].amount} {visitor.payments[0].currency}
                            </span>
                            <span className="text-xs text-gray-400">
                              {visitor.payments[0].payment_method || 'virement'} · {new Date(visitor.payments[0].created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Aucune transaction</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const p = visitor.payments?.[0];
                          const isProcessing = processing === visitor.id;
                          return (
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Valider */}
                              {p?.status !== 'approved' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() => p ? validatePayment(p.id, visitor.id) : validateVisitorDirectly(visitor.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {isProcessing ? '...' : 'Valider'}
                                </Button>
                              )}
                              {/* Refuser */}
                              {p?.status !== 'rejected' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() => p ? rejectPayment(p.id, visitor.id) : rejectVisitorDirectly(visitor.id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {isProcessing ? '...' : 'Refuser'}
                                </Button>
                              )}
                              {/* Supprimer */}
                              {confirmDelete === visitor.id ? (
                                <>
                                  <span className="text-xs text-red-600 font-medium">Confirmer ?</span>
                                  <Button
                                    size="sm"
                                    disabled={isProcessing}
                                    onClick={() => deleteVisitor(visitor.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    {isProcessing ? '...' : 'Oui'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmDelete(null)}
                                  >
                                    Non
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  onClick={() => setConfirmDelete(visitor.id)}
                                  className="border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-600"
                                  title="Supprimer ce visiteur"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}