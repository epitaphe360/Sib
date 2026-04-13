import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  User, 
  Users, 
  Globe,
  FileText,
  ExternalLink,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  Ban,
  ArrowLeft
} from 'lucide-react';

interface PaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  description?: string;
  metadata?: {
    subscriptionLevel?: string;
    standArea?: string;
    eventName?: string;
    eventDates?: string;
    partnerTier?: string;
  };
  transfer_reference?: string;
  transfer_date?: string;
  transfer_proof_url?: string;
  validated_by?: string;
  validated_at?: string;
  validation_notes?: string;
  created_at: string;
  updated_at?: string;
  users?: {
    name: string;
    email: string;
    type: 'visitor' | 'partner' | 'exhibitor' | 'admin';
    company_name?: string;
  };
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'processing';
type FilterUserType = 'all' | 'visitor' | 'partner' | 'exhibitor';

const STATUS_CONFIG = {
  pending: { 
    label: 'En attente', 
    icon: Clock, 
    bgColor: 'bg-amber-100', 
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300'
  },
  processing: { 
    label: 'En cours', 
    icon: RefreshCw, 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  approved: { 
    label: 'Approuvé', 
    icon: CheckCircle, 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  completed: { 
    label: 'Complété', 
    icon: CheckCircle, 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  proof_uploaded: { 
    label: 'Preuve recue', 
    icon: FileText, 
    bgColor: 'bg-indigo-100', 
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300'
  },
  rejected: { 
    label: 'Rejete', 
    icon: XCircle, 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-800',
    borderColor: 'border-red-300'
  },
  cancelled: { 
    label: 'Annule', 
    icon: Ban, 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300'
  },
  failed: { 
    label: 'Echoue', 
    icon: AlertCircle, 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-800',
    borderColor: 'border-red-300'
  }
};

const USER_TYPE_CONFIG = {
  visitor: { label: 'Visiteur', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  partner: { label: 'Partenaire', icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  exhibitor: { label: 'Exposant', icon: Building2, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  admin: { label: 'Admin', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-50' }
};

export default function PaymentValidationPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<FilterUserType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter, userTypeFilter]);

  async function loadRequests() {
    setLoading(true);
    setError(null);
    try {
      // Récupérer d'abord les payment_requests
      let query = supabase
        .from('payment_requests')
        .select('id, user_id, amount, currency, status, payment_method, transfer_reference, transfer_date, transfer_proof_url, validated_by, validated_at, validation_notes, created_at, updated_at')
        .order('created_at', { ascending: false })
        .range(0, 49);

      // Filtrer par statut
      if (filter !== 'all') {
        if (filter === 'approved') {
          query = query.in('status', ['approved', 'completed']);
        } else if (filter === 'pending') {
          // Inclure les demandes en attente ET celles avec preuve uploadee
          query = query.in('status', ['pending', 'proof_uploaded']);
        } else {
          query = query.eq('status', filter);
        }
      }

      const { data: paymentsData, error: queryError } = await query;

      if (queryError) {
        console.error('Erreur requête payment_requests:', queryError);
        throw queryError;
      }

      console.log('Payment requests trouvées:', paymentsData?.length || 0);

      // Si on a des paiements, récupérer les infos utilisateurs séparément
      let enrichedData: PaymentRequest[] = [];
      
      if (paymentsData && paymentsData.length > 0) {
        // Récupérer les user_ids uniques
        const userIds = [...new Set(paymentsData.map(p => p.user_id).filter(Boolean))];
        
        // Récupérer les infos utilisateurs
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, type, company_name')
          .in('id', userIds);

        if (usersError) {
          console.warn('Erreur chargement utilisateurs:', usersError);
        }

        // Créer un map des utilisateurs
        const usersMap = new Map(
          (usersData || []).map(u => [u.id, u])
        );

        // Enrichir les paiements avec les infos utilisateurs
        enrichedData = paymentsData.map(payment => ({
          ...payment,
          users: usersMap.get(payment.user_id) || null
        }));
      }

      // Filtrer par type d'utilisateur côté client
      let filteredData = enrichedData;
      if (userTypeFilter !== 'all') {
        filteredData = filteredData.filter(
          (req) => req.users?.type === userTypeFilter
        );
      }

      setRequests(filteredData);
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('Erreur chargement demandes:', err);
      setError((errorInfo.message as string) || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    const notes = prompt('Notes de validation (optionnel):');
    if (notes === null) return;

    setProcessing(requestId);
    try {
      // D'abord essayer la RPC si elle existe
      const { error: rpcError } = await supabase.rpc('approve_payment_request', {
        request_id: requestId,
        admin_id: user?.id,
        notes: notes || null
      });

      if (rpcError) {
        // Si la RPC n'existe pas, faire une mise à jour directe
        console.warn('RPC approve_payment_request non disponible, mise à jour directe');
        
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'approved',
            validated_by: user?.id,
            validated_at: new Date().toISOString(),
            validation_notes: notes || null
          })
          .eq('id', requestId);

        if (updateError) throw updateError;

        // Mettre à jour le statut utilisateur
        const request = requests.find(r => r.id === requestId);
        if (request?.user_id) {
          await supabase
            .from('users')
            .update({ status: 'active', payment_status: 'paid' })
            .eq('id', request.user_id);
        }
      }

      toast.success('Paiement approuvé avec succès !');
      loadRequests();
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      toast.error(`Erreur: ${(errorInfo.message as string) || String(err)}`);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(requestId: string) {
    const notes = prompt('Raison du rejet (obligatoire):');
    if (!notes) {
      toast.error('Veuillez indiquer une raison pour le rejet.');
      return;
    }

    setProcessing(requestId);
    try {
      const { error: rpcError } = await supabase.rpc('reject_payment_request', {
        request_id: requestId,
        admin_id: user?.id,
        notes: notes
      });

      if (rpcError) {
        console.warn('RPC reject_payment_request non disponible, mise à jour directe');
        
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'rejected',
            validated_by: user?.id,
            validated_at: new Date().toISOString(),
            validation_notes: notes
          })
          .eq('id', requestId);

        if (updateError) throw updateError;
      }

      toast.success('Demande rejetée.');
      loadRequests();
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      toast.error(`Erreur: ${(errorInfo.message as string) || String(err)}`);
    } finally {
      setProcessing(null);
    }
  }

  // Filtrer par recherche
  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      req.users?.name?.toLowerCase().includes(search) ||
      req.users?.email?.toLowerCase().includes(search) ||
      req.users?.company_name?.toLowerCase().includes(search) ||
      req.transfer_reference?.toLowerCase().includes(search) ||
      req.description?.toLowerCase().includes(search)
    );
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const proofUploadedCount = requests.filter(r => r.status === 'proof_uploaded').length;
  const approvedCount = requests.filter(r => ['approved', 'completed'].includes(r.status)).length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  };

  const getUserTypeConfig = (type: string) => {
    return USER_TYPE_CONFIG[type as keyof typeof USER_TYPE_CONFIG] || USER_TYPE_CONFIG.visitor;
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Validation des Paiements
                </h1>
                <p className="text-gray-500 mt-1">
                  Gérez les demandes de paiement en attente
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-semibold">
                <Clock className="w-4 h-4" />
                <span>{pendingCount} en attente</span>
              </div>
              {proofUploadedCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold animate-pulse">
                  <FileText className="w-4 h-4" />
                  <span>{proofUploadedCount} preuve(s) a verifier</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>{approvedCount} approuves</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
                <XCircle className="w-4 h-4" />
                <span>{rejectedCount} rejetes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('ui.search_by')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Statut du paiement
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Tous', icon: Globe },
                  { value: 'pending', label: 'En attente', icon: Clock },
                  { value: 'approved', label: 'Approuvés', icon: CheckCircle },
                  { value: 'rejected', label: 'Rejetés', icon: XCircle }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value as FilterStatus)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par type d'utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type d'utilisateur
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Tous', icon: Globe },
                  { value: 'visitor', label: 'Visiteurs', icon: User },
                  { value: 'partner', label: 'Partenaires', icon: Users },
                  { value: 'exhibitor', label: 'Exposants', icon: Building2 }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setUserTypeFilter(value as FilterUserType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      userTypeFilter === value
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton rafraîchir */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={loadRequests}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Liste des demandes */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chargement des demandes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune demande à afficher
            </h3>
            <p className="text-gray-500">
              {filter !== 'all' || userTypeFilter !== 'all' 
                ? 'Essayez de modifier les filtres pour voir plus de résultats.'
                : 'Les nouvelles demandes de paiement apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => {
              const statusConfig = getStatusConfig(request.status);
              const userTypeConfig = getUserTypeConfig(request.users?.type || 'visitor');
              const StatusIcon = statusConfig.icon;
              const UserTypeIcon = userTypeConfig.icon;

              return (
                <div
                  key={request.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 ${statusConfig.borderColor} hover:shadow-xl transition-shadow`}
                >
                  <div className="p-6">
                    {/* En-tête de la carte */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${userTypeConfig.bgColor}`}>
                          <UserTypeIcon className={`w-6 h-6 ${userTypeConfig.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">
                              {request.users?.name || 'Utilisateur'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${userTypeConfig.bgColor} ${userTypeConfig.color}`}>
                              {userTypeConfig.label}
                            </span>
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">{request.users?.email}</p>
                          {request.users?.company_name && (
                            <p className="text-gray-600 font-medium mt-1 flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {request.users.company_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-600">
                          {formatAmount(request.amount, request.currency)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1 justify-end">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Informations détaillées */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {request.reference && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Référence</p>
                          <p className="font-mono font-semibold text-gray-900">{request.reference}</p>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Méthode de paiement</p>
                        <p className="font-semibold text-gray-900">
                          {request.payment_method === 'bank_transfer' ? '🏦 Virement bancaire' :
                          request.payment_method === 'stripe' ? '💳 Carte bancaire' :
                           request.payment_method === 'paypal' ? '💰 PayPal' :
                           request.payment_method || 'Non spécifié'}
                        </p>
                      </div>

                      {request.metadata?.subscriptionLevel && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Abonnement</p>
                          <p className="font-semibold text-gray-900">
                            {request.metadata.subscriptionLevel}
                            {request.metadata.standArea && ` (${request.metadata.standArea}m²)`}
                          </p>
                        </div>
                      )}

                      {request.metadata?.partnerTier && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Niveau Partenaire</p>
                          <p className="font-semibold text-gray-900">
                            {request.metadata.partnerTier === 'gold' && '🥇 Sponsor Gold'}
                            {request.metadata.partnerTier === 'silver' && '🥈 Sponsor Silver'}
                            {request.metadata.partnerTier === 'official_sponsor' && '💎 Sponsor Officiel'}
                            {request.metadata.partnerTier === 'organizer' && '🏆 Organisateur'}
                            {!['gold', 'silver', 'official_sponsor', 'organizer'].includes(request.metadata.partnerTier) && request.metadata.partnerTier}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {request.description && (
                      <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-gray-900">{request.description}</p>
                      </div>
                    )}

                    {/* Justificatif */}
                    {request.transfer_proof_url && (
                      <div className="bg-purple-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Justificatif de paiement</p>
                          <p className="text-gray-900 font-medium">Document disponible</p>
                        </div>
                        <a
                          href={request.transfer_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir
                        </a>
                      </div>
                    )}

                    {/* Notes de validation */}
                    {request.validation_notes && (
                      <div className="bg-amber-50 rounded-xl p-4 mb-6">
                        <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">Notes de validation</p>
                        <p className="text-gray-900">{request.validation_notes}</p>
                      </div>
                    )}

                    {/* Date de validation */}
                    {request.validated_at && (
                      <div className="text-sm text-gray-500 mb-6">
                        Traité le {formatDate(request.validated_at)}
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {processing === request.id ? 'Traitement...' : 'Approuver le paiement'}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processing === request.id}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                        >
                          <XCircle className="w-5 h-5" />
                          {processing === request.id ? 'Traitement...' : 'Rejeter'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info debug - à supprimer en production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-800 text-gray-200 rounded-xl p-4 font-mono text-sm">
            <p className="text-gray-400 mb-2">🔧 Debug Info:</p>
            <p>Total requests in DB: {requests.length}</p>
            <p>Filtered count: {filteredRequests.length}</p>
            <p>Current filter: {filter} | User type: {userTypeFilter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
