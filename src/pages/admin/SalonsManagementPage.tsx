import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit, Trash2, Search, Star, StarOff,
  ToggleLeft, ToggleRight, Calendar, MapPin, Image, Save,
  X, Upload, ChevronUp, ChevronDown
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import MobilePreview from '../../components/admin/MobilePreview';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Salon } from '../../contexts/SalonContext';

// ─── Formulaire vide ──────────────────────────────────────────────────────────

const emptyForm = (): Omit<Salon, 'id' | 'created_at' | 'updated_at'> => ({
  name: '',
  slug: '',
  logo_url: null,
  cover_url: null,
  description: null,
  location: null,
  date_debut: null,
  date_fin: null,
  is_active: true,
  is_default: false,
  sort_order: 0,
  config: {},
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(iso: string | null): string {
  if (!iso) {return '—';}
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function SalonsManagementPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── Chargement ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase!
        .from('salons')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {throw error;}
      setSalons((data || []) as Salon[]);
    } catch (err: any) {
      toast.error('Impossible de charger les salons : ' + (err.message ?? err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Upload image ──────────────────────────────────────────────────────────────

  const uploadImage = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { error } = await supabase!.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast.error('Erreur upload : ' + error.message); return null; }
    const { data } = supabase!.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageChange = async (
    field: 'logo_url' | 'cover_url',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {return;}
    const path = `salons/${Date.now()}_${field}_${file.name}`;
    const url = await uploadImage(file, 'public', path);
    if (url) {setForm(prev => ({ ...prev, [field]: url }));}
  };

  // ── Ouvrir modal (création / édition) ────────────────────────────────────────

  const openCreate = () => {
    setEditingSalon(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (salon: Salon) => {
    setEditingSalon(salon);
    setForm({
      name: salon.name,
      slug: salon.slug,
      logo_url: salon.logo_url,
      cover_url: salon.cover_url,
      description: salon.description,
      location: salon.location,
      date_debut: salon.date_debut,
      date_fin: salon.date_fin,
      is_active: salon.is_active,
      is_default: salon.is_default,
      sort_order: salon.sort_order,
      config: salon.config,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSalon(null);
    setForm(emptyForm());
  };

  // ── Soumission ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Le nom et le slug sont obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingSalon) {
        const { error } = await supabase!
          .from('salons')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingSalon.id);
        if (error) {throw error;}
        toast.success('Salon mis à jour.');
      } else {
        const { error } = await supabase!
          .from('salons')
          .insert([{ ...form }]);
        if (error) {throw error;}
        toast.success('Salon créé.');
      }
      closeModal();
      await fetchSalons();
    } catch (err: any) {
      toast.error('Erreur : ' + (err.message ?? err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toggle is_active / is_default ────────────────────────────────────────────

  const toggleField = async (salon: Salon, field: 'is_active' | 'is_default') => {
    try {
      const newValue = !salon[field];
      const update: Partial<Salon> = { [field]: newValue };
      // Un seul salon peut être défaut — désactiver les autres
      if (field === 'is_default' && newValue) {
        await supabase!.from('salons').update({ is_default: false }).neq('id', salon.id);
      }
      const { error } = await supabase!.from('salons').update(update).eq('id', salon.id);
      if (error) {throw error;}
      toast.success(`Salon ${field === 'is_active' ? (newValue ? 'activé' : 'désactivé') : (newValue ? 'défini par défaut' : 'retiré par défaut')}.`);
      await fetchSalons();
    } catch (err: any) {
      toast.error('Erreur : ' + (err.message ?? err));
    }
  };

  // ── Modifier sort_order ───────────────────────────────────────────────────────

  const moveSalon = async (salon: Salon, direction: 'up' | 'down') => {
    const idx = salons.findIndex(s => s.id === salon.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= salons.length) {return;}
    const other = salons[swapIdx];
    try {
      await Promise.all([
        supabase!.from('salons').update({ sort_order: other.sort_order }).eq('id', salon.id),
        supabase!.from('salons').update({ sort_order: salon.sort_order }).eq('id', other.id),
      ]);
      await fetchSalons();
    } catch (err: any) {
      toast.error('Erreur : ' + (err.message ?? err));
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────────

  const handleDelete = async (salon: Salon) => {
    if (!window.confirm(`Supprimer le salon "${salon.name}" ? Cette action est irréversible.`)) {return;}
    try {
      const { error } = await supabase!.from('salons').delete().eq('id', salon.id);
      if (error) {throw error;}
      toast.success('Salon supprimé.');
      await fetchSalons();
    } catch (err: any) {
      toast.error('Erreur : ' + (err.message ?? err));
    }
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────────

  const filtered = salons.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.location ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = salons.filter(s => s.is_active).length;
  const defaultSalon = salons.find(s => s.is_default);

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des salons</h1>
              <p className="mt-2 text-gray-600">Gérez les éditions multi-tenant : création, activation, ordre d&apos;affichage.</p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau salon
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900">{salons.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Actifs</p>
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Salon par défaut</p>
            <p className="text-lg font-semibold text-blue-700 truncate">{defaultSalon?.name ?? '—'}</p>
          </Card>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
          </div>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucun salon trouvé.</div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((salon, idx) => (
                <motion.div
                  key={salon.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, delay: idx * 0.03 }}
                >
                  <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Logo */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {salon.logo_url
                        ? <img src={salon.logo_url} alt={salon.name} className="w-full h-full object-contain" />
                        : <Image className="h-8 w-8 text-gray-300" />
                      }
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-gray-900 truncate">{salon.name}</h2>
                        <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{salon.slug}</code>
                        {salon.is_default && (
                          <Badge variant="info" className="text-xs">Défaut</Badge>
                        )}
                        <Badge variant={salon.is_active ? 'success' : 'secondary'} className="text-xs">
                          {salon.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        {salon.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{salon.location}</span>
                        )}
                        {(salon.date_debut || salon.date_fin) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(salon.date_debut)} → {formatDate(salon.date_fin)}
                          </span>
                        )}
                        <span className="text-gray-400">ordre : {salon.sort_order}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Réordonner */}
                      <button
                        onClick={() => moveSalon(salon, 'up')}
                        disabled={idx === 0}
                        title="Monter"
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveSalon(salon, 'down')}
                        disabled={idx === filtered.length - 1}
                        title="Descendre"
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {/* Toggle actif */}
                      <button
                        onClick={() => toggleField(salon, 'is_active')}
                        title={salon.is_active ? 'Désactiver' : 'Activer'}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                      >
                        {salon.is_active
                          ? <ToggleRight className="h-5 w-5 text-green-500" />
                          : <ToggleLeft className="h-5 w-5 text-gray-400" />
                        }
                      </button>

                      {/* Définir par défaut */}
                      <button
                        onClick={() => toggleField(salon, 'is_default')}
                        title={salon.is_default ? 'Retirer le rôle par défaut' : 'Définir par défaut'}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                      >
                        {salon.is_default
                          ? <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                          : <StarOff className="h-5 w-5 text-gray-400" />
                        }
                      </button>

                      {/* Éditer */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(salon)}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Éditer
                      </Button>

                      {/* Supprimer */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(salon)}
                        className="gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ─── Modal Création / Édition ─────────────────────────────────────────── */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <form onSubmit={handleSubmit}>
                {/* Header modal */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingSalon ? 'Modifier le salon' : 'Créer un salon'}
                  </h2>
                  <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row">
                  {/* Left: Form fields */}
                  <div className="flex-1 px-6 py-5 space-y-5 min-w-0">

                  {/* Nom + Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          name: e.target.value,
                          slug: editingSalon ? prev.slug : slugify(e.target.value),
                        }))}
                        placeholder="SIB 2026"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={e => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                        placeholder="sib-2026"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={form.description ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value || null }))}
                      placeholder="Salon international du bâtiment…"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Lieu + Ordre */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                      <input
                        type="text"
                        value={form.location ?? ''}
                        onChange={e => setForm(prev => ({ ...prev, location: e.target.value || null }))}
                        placeholder="Alger, Palais des Expositions"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d&apos;affichage</label>
                      <input
                        type="number"
                        min={0}
                        value={form.sort_order}
                        onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                      <input
                        type="date"
                        value={form.date_debut ? form.date_debut.slice(0, 10) : ''}
                        onChange={e => setForm(prev => ({ ...prev, date_debut: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                      <input
                        type="date"
                        value={form.date_fin ? form.date_fin.slice(0, 10) : ''}
                        onChange={e => setForm(prev => ({ ...prev, date_fin: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <div className="flex items-center gap-3">
                      {form.logo_url && (
                        <img src={form.logo_url} alt="logo" className="h-14 w-14 rounded-lg object-contain border border-gray-200 bg-gray-50" />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="gap-1"
                      >
                        <Upload className="h-4 w-4" />
                        {form.logo_url ? 'Changer' : 'Uploader'}
                      </Button>
                      {form.logo_url && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, logo_url: null }))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Supprimer
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageChange('logo_url', e)}
                      />
                    </div>
                  </div>

                  {/* Cover */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                    <div className="flex items-center gap-3">
                      {form.cover_url && (
                        <img src={form.cover_url} alt="cover" className="h-14 w-28 rounded-lg object-cover border border-gray-200 bg-gray-50" />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => coverInputRef.current?.click()}
                        className="gap-1"
                      >
                        <Upload className="h-4 w-4" />
                        {form.cover_url ? 'Changer' : 'Uploader'}
                      </Button>
                      {form.cover_url && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, cover_url: null }))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Supprimer
                        </button>
                      )}
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageChange('cover_url', e)}
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">Actif</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.is_default}
                        onChange={e => setForm(prev => ({ ...prev, is_default: e.target.checked }))}
                        className="w-4 h-4 rounded text-yellow-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">Salon par défaut</span>
                    </label>
                  </div>

                </div>
                  {/* Right: Mobile preview */}
                  <div className="hidden lg:flex flex-shrink-0 w-[320px] border-l border-gray-100 bg-gray-50/50 items-start justify-center py-6 px-4">
                    <MobilePreview
                      name={form.name}
                      logo_url={form.logo_url}
                      cover_url={form.cover_url}
                      description={form.description}
                      location={form.location}
                      date_debut={form.date_debut}
                      date_fin={form.date_fin}
                      is_active={form.is_active}
                    />
                  </div>
                </div>
                {/* Footer modal */}
                <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Enregistrement…' : editingSalon ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
