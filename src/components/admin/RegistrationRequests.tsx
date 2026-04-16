import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
import { CheckCircle, XCircle, Clock, User, Building, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface RegistrationRequest {
  id: string;
  user_id: string;
  user_type: 'exhibitor' | 'partner' | 'visitor';
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  position?: string;
  phone: string;
  profile_data: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export default function RegistrationRequests() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.getRegistrationRequests(
        filter === 'all' ? undefined : filter
      );
      setRequests(data);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: RegistrationRequest) => {
    if (!user) {return;}

    try {
      // 1. Mettre à jour le statut de la demande
      await SupabaseService.updateRegistrationRequestStatus(
        request.id,
        'approved',
        user.id
      );

      // 2. Envoyer l'email de validation à l'utilisateur (ne pas bloquer si échec)
      try {
        await SupabaseService.sendValidationEmail({
          email: request.email,
          firstName: request.first_name,
          lastName: request.last_name,
          companyName: request.company_name || '',
          status: 'approved'
        });
        toast.success(`Demande approuvée et email envoyé à ${request.first_name} ${request.last_name}`);
      } catch (emailError) {
        console.warn('⚠️ Email non envoyé:', emailError);
        toast.success(`Demande approuvée pour ${request.first_name} ${request.last_name} (email non envoyé)`);
      }

      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (request: RegistrationRequest) => {
    if (!user || !rejectionReason.trim()) {
      toast.error('Veuillez indiquer une raison de rejet');
      return;
    }

    try {
      // 1. Mettre à jour le statut de la demande
      await SupabaseService.updateRegistrationRequestStatus(
        request.id,
        'rejected',
        user.id,
        rejectionReason
      );

      // 2. Envoyer l'email de rejet à l'utilisateur (ne pas bloquer si échec)
      try {
        await SupabaseService.sendValidationEmail({
          email: request.email,
          firstName: request.first_name,
          lastName: request.last_name,
          companyName: request.company_name || '',
          status: 'rejected'
        });
        toast.success(`Demande rejetée et email envoyé à ${request.first_name} ${request.last_name}`);
      } catch (emailError) {
        console.warn('⚠️ Email non envoyé:', emailError);
        toast.success(`Demande rejetée pour ${request.first_name} ${request.last_name} (email non envoyé)`);
      }

      fetchRequests();
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast.error('Erreur lors du rejet');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</Badge>;
      case 'approved':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeté</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      exhibitor: 'Exposant',
      partner: 'Partenaire',
      visitor: 'Visiteur'
    };
    return <Badge variant="info">{labels[type as keyof typeof labels] || type}</Badge>;
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demandes d'Inscription</h2>
          <p className="text-gray-600 mt-1">
            Gérez les demandes d'inscription des exposants et partenaires
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" size="lg" className="text-lg">
            {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          <Clock className="w-4 h-4 mr-2" />
          En attente ({requests.filter(r => r.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Toutes
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approuvées
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejetées
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sib-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des demandes...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Aucune demande d'inscription trouvée</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold">
                          {request.first_name} {request.last_name}
                        </h3>
                        {getTypeBadge(request.user_type)}
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        {request.company_name && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            <span>{request.company_name}</span>
                          </div>
                        )}
                        {request.position && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{request.position}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${request.email}`} className="text-sib-primary hover:underline">
                            {request.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{request.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(request.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>

                      {request.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Raison du rejet :</strong> {request.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold mb-4">
              Rejeter la demande de {selectedRequest.first_name} {selectedRequest.last_name}
            </h3>
            <p className="text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet :
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-sib-primary focus:border-transparent"
              placeholder="Raison du rejet..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedRequest)}
                disabled={!rejectionReason.trim()}
              >
                Confirmer le rejet
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
