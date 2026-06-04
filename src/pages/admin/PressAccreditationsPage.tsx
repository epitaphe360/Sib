import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Building, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';

interface PressAccreditation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  media_name: string;
  media_type: string;
  job_title: string;
  country: string;
  coverage_plan: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminPressAccreditationsPage() {
  const [accreditations, setAccreditations] = useState<PressAccreditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAccreditations();
  }, []);

  const fetchAccreditations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('press_accreditations').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') {
          console.warn("Table press_accreditations absente");
          setAccreditations([]);
        } else {
          throw error;
        }
      } else {
        setAccreditations(data as PressAccreditation[]);
      }
    } catch (err: any) {
      toast.error("Erreur lors de la récupération des accréditations");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('press_accreditations').update({ status: newStatus }).eq('id', id);
      if (error && error.code !== '42P01') {throw error;}

      setAccreditations(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      toast.success(newStatus === 'approved' ? 'Accréditation validée' : 'Accréditation refusée');
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filtered = accreditations.filter(a => filterStatus === 'all' || a.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Camera className="w-8 h-8 text-blue-800 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Accréditations Presse</h1>
                <p className="text-gray-600 mt-1">Gérez les demandes de badges pour les journalistes</p>
              </div>
            </div>

            {/* Filter */}
            <select
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente ({accreditations.filter(a => a.status === 'pending').length})</option>
              <option value="approved">Validées ({accreditations.filter(a => a.status === 'approved').length})</option>
              <option value="rejected">Refusées</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Aucune demande trouvée pour ce filtre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(acc => (
              <motion.div key={acc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`p-6 border-t-4 h-full flex flex-col ${acc.status === 'approved' ? 'border-t-green-500' : acc.status === 'rejected' ? 'border-t-red-500' : 'border-t-blue-500'}`}>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {acc.first_name} {acc.last_name}
                      </h3>
                      <p className="text-sm font-medium text-blue-700">{acc.job_title}</p>
                    </div>
                    {acc.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200 font-medium">En attente</span>}
                    {acc.status === 'approved' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Validée</span>}
                    {acc.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200 flex items-center"><XCircle className="h-3 w-3 mr-1"/> Refusée</span>}
                  </div>

                  <div className="space-y-2 mb-4 flex-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="flex items-center text-gray-700"><Building className="h-4 w-4 mr-2 text-gray-400"/> <strong>{acc.media_name}</strong> ({acc.media_type})</p>
                    <p className="flex items-center text-gray-600"><Globe className="h-4 w-4 mr-2 text-gray-400"/> {acc.country}</p>
                    <p className="flex items-center text-gray-600"><Mail className="h-4 w-4 mr-2 text-gray-400"/> {acc.email}</p>
                    <p className="flex items-center text-gray-600"><Phone className="h-4 w-4 mr-2 text-gray-400"/> {acc.phone}</p>
                  </div>

                  {acc.coverage_plan && (
                    <div className="mb-4 text-sm px-3 py-2 bg-blue-50 text-blue-900 rounded border border-blue-100">
                      <strong>Plan de couverture :</strong>
                      <p className="mt-1 line-clamp-3 text-xs opacity-90">{acc.coverage_plan}</p>
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex gap-2 border-t text-sm">
                    {acc.status === 'pending' ? (
                      <>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(acc.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Accepter
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleUpdateStatus(acc.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Refuser
                        </Button>
                      </>
                    ) : acc.status === 'rejected' ? (
                      <Button variant="outline" className="w-full text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(acc.id, 'approved')}>
                         Changer en Approuvé
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(acc.id, 'rejected')}>
                         Changer en Refusé
                      </Button>
                    )}
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

