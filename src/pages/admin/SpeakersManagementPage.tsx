import { useState, useEffect } from 'react';
import { ArrowLeft, User, Plus, Edit, Trash2, Search, Save, X, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';
import { useSalon } from '../../contexts/SalonContext';

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
  const { currentSalon } = useSalon();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', title: '', company: '', bio: '', photo_url: '', sort_order: 0,
  });

  useEffect(() => { fetchSpeakers(); }, [currentSalon]);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('speakers').select('*').order('sort_order', { ascending: true });
      if (currentSalon) {
        if (currentSalon.is_default) {
          query = query.or(`salon_id.eq.${currentSalon.id},salon_id.is.null`);
        } else {
          query = query.eq('salon_id', currentSalon.id);
        }
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === '42P01') { setSpeakers([]); }
        else { throw error; }
      } else { setSpeakers(data as Speaker[]); }
    } catch { toast.error('Erreur lors de la récupération des intervenants'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ first_name: '', last_name: '', title: '', company: '', bio: '', photo_url: '', sort_order: speakers.length });
    setModalOpen(true);
  };

  const openEdit = (s: Speaker) => {
    setEditingId(s.id);
    setForm({ first_name: s.first_name, last_name: s.last_name, title: s.title, company: s.company, bio: s.bio || '', photo_url: s.photo_url || '', sort_order: s.sort_order });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error('Prénom et nom sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        title: form.title.trim(),
        company: form.company.trim(),
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        ...(currentSalon ? { salon_id: currentSalon.id } : {}),
      };
      if (editingId) {
        const { error } = await supabase.from('speakers').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Intervenant mis à jour');
      } else {
        const { error } = await supabase.from('speakers').insert(payload);
        if (error) throw error;
        toast.success('Intervenant ajouté');
      }
      setModalOpen(false);
      await fetchSpeakers();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer "${name}" ?`)) return;
    try {
      const { error } = await supabase.from('speakers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Intervenant supprimé');
      setSpeakers(prev => prev.filter(s => s.id !== id));
    } catch { toast.error('Erreur lors de la suppression'); }
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
            <Button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
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
            {searchTerm ? 'Aucun résultat.' : 'Aucun intervenant. Cliquez sur "Nouveau Speaker" pour en ajouter un.'}
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
                  <motion.tr key={speaker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {speaker.photo_url
                          ? <img className="h-10 w-10 rounded-full object-cover" src={speaker.photo_url} alt="" />
                          : <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{speaker.first_name[0]}{speaker.last_name[0]}</div>
                        }
                        <span className="text-sm font-medium text-gray-900">{speaker.first_name} {speaker.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{speaker.title}</div>
                      <div className="text-sm text-gray-500">{speaker.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{speaker.sort_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEdit(speaker)} className="text-blue-600 hover:text-blue-900 mr-4 p-1 hover:bg-blue-50 rounded" title="Modifier">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(speaker.id, `${speaker.first_name} ${speaker.last_name}`)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" title="Supprimer">
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

      {/* Modal Créer / Modifier */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Modifier l\'intervenant' : 'Nouvel intervenant'}
                  </h3>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                      <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Mohammed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="BENCHAÂBANE" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Fonction</label>
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Directeur Général" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise / Organisation</label>
                    <input value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ministère du Bâtiment" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                    <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Courte biographie…" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL photo</label>
                    <input value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://…" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                    <input value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})} type="number" min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Annuler</Button>
                    <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
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

