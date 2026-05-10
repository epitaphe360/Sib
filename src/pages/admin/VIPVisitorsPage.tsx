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
  Trash2,
  Phone,
  Globe,
  User,
  CreditCard,
  X,
  UserPlus,
  MapPin,
} from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
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
  status?: string;
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
  const [profileDrawer, setProfileDrawer] = useState<VIPVisitor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingVisitor, setIsAddingVisitor] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    country: '',
    level: 'vip' as const,
    paymentStatus: 'pending' as 'pending' | 'approved' | 'manual_admin',
    amount: '300',
  });

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
        .eq('visitor_level', 'vip')
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
          status: user.status,
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

  const checkEmailExists = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError(null);
      return;
    }
    setEmailChecking(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', trimmed)
        .maybeSingle();
      if (error) { throw error; }
      if (data) {
        setEmailError('Cet email est déjà utilisé par un compte existant.');
      } else {
        setEmailError(null);
      }
    } catch {
      setEmailError(null);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleAddVIPVisitor = async () => {
    const { firstName, lastName, email, phone, level } = addForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      toast.error('Prénom, nom, email et téléphone sont obligatoires');
      return;
    }
    if (emailError) {
      toast.error('Corrigez l\'email avant de continuer.');
      return;
    }
    setIsAddingVisitor(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await SupabaseService.createUser({
        type: 'visitor',
        name: fullName,
        email: email.trim().toLowerCase(),
        status: 'active',
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: addForm.phone,
          company: addForm.company,
          position: addForm.position,
          country: addForm.country || 'Maroc',
        },
      } as any);
      // Mettre à jour visitor_level après création
      const { error: lvlErr } = await (await import('../../lib/supabase')).supabase
        .from('users')
        .update({ visitor_level: level, status: 'active' })
        .eq('email', email.trim().toLowerCase());
      if (lvlErr) { console.warn('Niveau non mis à jour:', lvlErr.message); }

      // Créer la demande de paiement selon le statut choisi
      const { data: createdUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      if (createdUser?.id) {
        const amountNum = parseFloat(addForm.amount) || 300;
        await supabase.from('payment_requests').insert({
          user_id: createdUser.id,
          amount: amountNum,
          currency: 'MAD',
          status: addForm.paymentStatus === 'manual_admin' ? 'approved' : addForm.paymentStatus,
          payment_method: addForm.paymentStatus === 'manual_admin' ? 'manual_admin' : 'bank_transfer',
          validated_at: addForm.paymentStatus !== 'pending' ? new Date().toISOString() : null,
        });
      }
      toast.success(`✅ Visiteur VIP "${fullName}" créé avec succès !`);
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', company: '', position: '', country: '', level: 'vip', paymentStatus: 'pending', amount: '300' });
      setEmailError(null);
      fetchVIPVisitors();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la création du visiteur');
    } finally {
      setIsAddingVisitor(false);
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
      {/* Modal Ajouter Visiteur VIP */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowAddModal(false); setEmailError(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{t('vip_visitors.creer_un_visiteur_vip', 'Créer un Visiteur VIP')}</h2>
              </div>
              <button onClick={() => { setShowAddModal(false); setEmailError(null); }} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Niveau VIP */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{t('vip_visitors.niveau_dacces', 'Niveau d\'accès')}</label>
                <div className="flex gap-3">
                  <div className="flex-1 py-2 rounded-lg text-sm font-semibold border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-center">
                    <Crown className="w-3.5 h-3.5 inline mr-1" />
                    VIP
                  </div>
                </div>
              </div>

              {/* Prénom & Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.prenom', 'Prénom')}<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="Jean"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.nom', 'Nom')}<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Dupont"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.email', 'Email')}<span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  {emailChecking && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{t('vip_visitors.verification', 'Vérification...')}</span>
                  )}
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={e => { setAddForm(f => ({ ...f, email: e.target.value })); setEmailError(null); }}
                    onBlur={e => checkEmailExists(e.target.value)}
                    placeholder="jean.dupont@example.com"
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 ${
                      emailError
                        ? 'border-red-400 focus:ring-red-300 bg-red-50'
                        : 'border-gray-300 focus:ring-yellow-400 focus:border-yellow-400'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span>&#9888;</span> {emailError}
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.telephone', 'Téléphone')}<span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+212 6 00 00 00 00"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
              </div>

              {/* Entreprise & Poste */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.entreprise', 'Entreprise')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={addForm.company}
                      onChange={e => setAddForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="Nom de société"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.poste', 'Poste')}</label>
                  <input
                    type="text"
                    value={addForm.position}
                    onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))}
                    placeholder="Directeur, DG…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
              </div>

              {/* Pays */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.pays', 'Pays')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={addForm.country}
                    onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="Maroc"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
              </div>

              {/* Statut du paiement */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{t('vip_visitors.statut_du_paiement', 'Statut du paiement')}</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {([
                    { value: 'pending',      label: 'En attente',  color: 'amber',  icon: '⏳' },
                    { value: 'approved',     label: 'Payé',        color: 'green',  icon: '✅' },
                    { value: 'manual_admin', label: 'Offert',      color: 'blue',   icon: '🎁' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAddForm(f => ({ ...f, paymentStatus: opt.value }))}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border-2 transition-colors text-center ${
                        addForm.paymentStatus === opt.value
                          ? opt.color === 'amber'  ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : opt.color === 'green'  ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-base">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {addForm.paymentStatus !== 'pending' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('vip_visitors.montant_mad', 'Montant (MAD)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.amount}
                      onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                      placeholder="300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => { setShowAddModal(false); setEmailError(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddVIPVisitor}
                disabled={isAddingVisitor || !addForm.firstName || !addForm.lastName || !addForm.email}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                  addForm.level === 'vip' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAddingVisitor ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Création...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Créer le visiteur {addForm.level.toUpperCase()}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      {profileDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setProfileDrawer(null)} />
          {/* Panel */}
          <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('vip_visitors.profil_visiteur_vip', 'Profil Visiteur VIP')}</h2>
              </div>
              <button onClick={() => setProfileDrawer(null)} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="flex flex-col items-center gap-3 py-6 px-5 border-b border-gray-100">
              {profileDrawer.profile?.photoUrl ? (
                <img src={profileDrawer.profile.photoUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-4 ring-yellow-200" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-yellow-100 ring-4 ring-yellow-200 flex items-center justify-center">
                  <span className="text-yellow-700 font-bold text-2xl">{profileDrawer.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{profileDrawer.name}</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium mt-1 ${
                  profileDrawer.visitor_level === 'vip' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Crown className="h-3 w-3" />
                  {profileDrawer.visitor_level?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4 flex-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('vip_visitors.informations_personnelles', 'Informations personnelles')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t('vip_visitors.email', 'Email')}</p>
                    <p className="font-medium text-gray-800">{profileDrawer.email}</p>
                  </div>
                </div>
                {profileDrawer.profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{t('vip_visitors.telephone', 'Téléphone')}</p>
                      <p className="font-medium text-gray-800">{profileDrawer.profile.phone}</p>
                    </div>
                  </div>
                )}
                {profileDrawer.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{t('vip_visitors.societe', 'Société')}</p>
                      <p className="font-medium text-gray-800">{profileDrawer.company}</p>
                    </div>
                  </div>
                )}
                {profileDrawer.position && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{t('vip_visitors.poste', 'Poste')}</p>
                      <p className="font-medium text-gray-800">{profileDrawer.position}</p>
                    </div>
                  </div>
                )}
                {profileDrawer.profile?.country && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{t('vip_visitors.pays', 'Pays')}</p>
                      <p className="font-medium text-gray-800">{profileDrawer.profile.country}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t('vip_visitors.inscrit_le', 'Inscrit le')}</p>
                    <p className="font-medium text-gray-800">{new Date(profileDrawer.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('vip_visitors.transactions', 'Transactions')}</h3>
                {profileDrawer.payments && profileDrawer.payments.length > 0 ? (
                  <div className="space-y-2">
                    {profileDrawer.payments.map((pay) => (
                      <div key={pay.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{pay.amount} {pay.currency}</p>
                            <p className="text-xs text-gray-400">{pay.payment_method || 'virement'} · {new Date(pay.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pay.status === 'approved' ? 'bg-green-100 text-green-700' :
                          pay.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {pay.status === 'approved' ? 'Validé' : pay.status === 'rejected' ? 'Refusé' : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">{t('vip_visitors.aucune_transaction_enregistree', 'Aucune transaction enregistrée')}</p>
                )}
              </div>

              {/* Statut actuel */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('vip_visitors.statut_du_compte', 'Statut du compte')}</h3>
                <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${
                  profileDrawer.status === 'active' ? 'bg-green-100 text-green-700' :
                  profileDrawer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {profileDrawer.status === 'active' ? <CheckCircle className="h-4 w-4" /> :
                   profileDrawer.status === 'rejected' ? <XCircle className="h-4 w-4" /> :
                   <Clock className="h-4 w-4" />}
                  {profileDrawer.status === 'active' ? 'Compte actif' :
                   profileDrawer.status === 'rejected' ? 'Compte refusé' :
                   'En attente de validation'}
                </span>
              </div>
            </div>

            {/* Actions */}
            {(() => {
              const p = profileDrawer.payments?.[0];
              const isProcessing = processing === profileDrawer.id;
              const isApproved = p?.status === 'approved' || (!p && profileDrawer.status === 'active');
              const isRejected = p?.status === 'rejected';
              return (
                <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3">
                  {!isApproved && (
                    <button
                      disabled={isProcessing}
                      onClick={async () => {
                        if (p) {await validatePayment(p.id, profileDrawer.id);}
                        else {await validateVisitorDirectly(profileDrawer.id);}
                        setProfileDrawer(prev => prev ? { ...prev, status: 'active' } : null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isProcessing ? 'En cours...' : 'Valider'}
                    </button>
                  )}
                  {!isRejected && (
                    <button
                      disabled={isProcessing}
                      onClick={async () => {
                        if (p) {await rejectPayment(p.id, profileDrawer.id);}
                        else {await rejectVisitorDirectly(profileDrawer.id);}
                        setProfileDrawer(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-300 hover:bg-red-50 disabled:opacity-50 text-red-600 text-sm font-medium py-2.5 rounded-lg transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      {isProcessing ? 'En cours...' : 'Refuser'}
                    </button>
                  )}
                  {isApproved && !isRejected && (
                    <p className="flex-1 text-center text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Visiteur déjà validé
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
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
              Liste complète des visiteurs VIP avec statut de paiement et détails.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un visiteur VIP
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
                    <dt className="text-sm font-medium text-yellow-800 truncate">{t('vip_visitors.total_vips', 'Total VIPs')}</dt>
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
                    <dt className="text-sm font-medium text-green-800 truncate">{t('vip_visitors.paiements_valides', 'Paiements Validés')}</dt>
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
                    <dt className="text-sm font-medium text-blue-800 truncate">{t('vip_visitors.nouveaux_30j', 'Nouveaux (30j)')}</dt>
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
                          if (p?.status === 'approved' || (!p && visitor.status === 'active')) {
                            return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />{t('vip_visitors.valide', 'Validé')}</Badge>;
                          }
                          if (p?.status === 'rejected') {return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />{t('vip_visitors.refuse', 'Refusé')}</Badge>;}
                          return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />{t('vip_visitors.en_attente', 'En attente')}</Badge>;
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
                          <span className="text-gray-400 text-xs italic">{t('vip_visitors.aucune_transaction', 'Aucune transaction')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const p = visitor.payments?.[0];
                          const isProcessing = processing === visitor.id;
                          return (
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Voir Profil */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProfileDrawer(visitor)}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                title="Voir le profil complet"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Profil
                              </Button>
                              {/* Valider */}
                              {p?.status !== 'approved' && !(p === undefined && visitor.status === 'active') && (
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
                                  <span className="text-xs text-red-600 font-medium">{t('vip_visitors.confirmer', 'Confirmer ?')}</span>
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