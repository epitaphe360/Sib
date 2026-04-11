import { useState, useEffect } from 'react';
import { ArrowLeft, User, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';

interface Speaker {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
}

export default function SpeakersManagementPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('speakers').select('*').order('sort_order', { ascending: true });
      if (error) {
        if (error.code === '42P01') {
          console.warn("Table speakers absente");
          setSpeakers([]);
        } else {
          throw error;
        }
      } else {
        setSpeakers(data as Speaker[]);
      }
    } catch (err: any) {
      toast.error("Erreur lors de la récupération des intervenants");
    } finally {
      setLoading(false);
    }
  };

  const filtered = speakers.filter(s => 
    `${s.first_name} ${s.last_name} ${s.company} ${s.title}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-800 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Intervenants</h1>
                <p className="text-gray-600 mt-1">Ajoutez, modifiez ou supprimez les speakers des conférences</p>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Plus className="h-5 w-5 mr-2" /> Nouveau Speaker
            </Button>
          </div>
        </div>

        <div className="mb-6 relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Rechercher par nom, entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow text-gray-500">
            Aucun intervenant trouvé.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intervenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre & Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((speaker, index) => (
                  <motion.tr key={speaker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0">
                          <img className="h-10 w-10 rounded-full object-cover" src={speaker.photo_url || 'https://via.placeholder.com/150'} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{speaker.first_name} {speaker.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-semibold">{speaker.title}</div>
                      <div className="text-sm text-gray-500">{speaker.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {speaker.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

