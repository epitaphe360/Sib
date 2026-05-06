import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2, Mail, Phone, User, ArrowLeft,
  CheckCircle, AlertCircle, Loader2, Copy, RefreshCw, Printer
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import type { StandCollaborator } from '../../types';

const COMPANY_NAME_FIELD = 'company';

// Génère un mot de passe aléatoire sécurisé
function generatePassword(): string {
  // eslint-disable-next-line no-secrets/no-secrets
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  let pwd = '';
  for (let i = 0; i < 10; i++) {pwd += chars.charAt(Math.floor(Math.random() * chars.length));}
  return pwd;
}

interface ExhibitorTeamPageProps {
  userType?: 'exhibitor' | 'partner';
}

export default function ExhibitorTeamPage({ userType = 'exhibitor' }: ExhibitorTeamPageProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [collaborators, setCollaborators] = useState<StandCollaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  // Données de l'exposant
  const [exhibitorId, setExhibitorId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [standNumber, setStandNumber] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: 'Exposant',
  });

  const fetchExhibitor = useCallback(async () => {
    if (!user?.id) {return;}
    if (userType === 'partner') {
      const { data } = await (supabase as any)
        .from('partners')
        .select('id, organization_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setExhibitorId(data.id);
        setCompanyName(data.organization_name || user?.profile?.[COMPANY_NAME_FIELD] || '');
      }
    } else {
      const { data } = await (supabase as any)
        .from('exhibitors')
        .select('id, company_name, stand_number')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setExhibitorId(data.id);
        setCompanyName(data.company_name || user?.profile?.[COMPANY_NAME_FIELD] || '');
        setStandNumber(data.stand_number || '');
      }
    }
  }, [user, userType]);

  const fetchCollaborators = useCallback(async () => {
    if (!user?.id) {return;}
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('stand_collaborators')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {throw error;}
      setCollaborators(data || []);
    } catch {
      toast.error(t('team.load_error'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExhibitor();
    fetchCollaborators();
  }, [fetchExhibitor, fetchCollaborators]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !exhibitorId) {return;}
    setIsSubmitting(true);

    const tempPassword = generatePassword();
    const emailLower = form.email.toLowerCase().trim();

    try {
      // 1. Vérifier que l'email n'existe pas déjà
      const { data: existing } = await (supabase as any)
        .from('stand_collaborators')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();
      if (existing) {
        toast.error(t('team.email_exists'));
        return;
      }

      // 2. Créer le compte auth via Admin API (Edge Function)
      const { data: authData, error: authError } = await (supabase as any).functions.invoke('create-collaborator-account', {
        body: {
          email: emailLower,
          password: tempPassword,
          first_name: form.first_name,
          last_name: form.last_name,
          company_name: companyName,
          stand_number: standNumber,
          owner_id: user.id,
          exhibitor_id: exhibitorId,
        },
      });

      let authUserId: string | null = authData?.user_id || null;

      // Si la fonction Edge n'existe pas encore, on insère sans auth_user_id
      if (authError) {
        console.warn('Edge function non disponible, insertion sans compte auth:', authError.message);
        authUserId = null;
      }

      // 3. Insérer le collaborateur en base
      const { error: insertError } = await (supabase as any)
        .from('stand_collaborators')
        .insert({
          owner_id: user.id,
          owner_type: userType === 'partner' ? 'partner' : 'exhibitor',
          ...(userType === 'partner' ? { partner_id: exhibitorId } : { exhibitor_id: exhibitorId }),
          first_name: form.first_name,
          last_name: form.last_name,
          email: emailLower,
          phone: form.phone || null,
          position: form.position,
          auth_user_id: authUserId,
          temp_password: tempPassword,
          status: 'active',
          badge_generated: false,
        });

      if (insertError) {throw insertError;}

      toast.success(`${t('team.collab_added')} ${tempPassword}`);
      setForm({ first_name: '', last_name: '', email: '', phone: '', position: 'Exposant' });
      setShowForm(false);
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err?.message || t('team.create_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('team.confirm_delete'))) {return;}
    setDeletingId(id);
    try {
      const { error } = await (supabase as any)
        .from('stand_collaborators')
        .update({ status: 'inactive' })
        .eq('id', id);
      if (error) {throw error;}
      toast.success(t('team.collab_deactivated'));
      fetchCollaborators();
    } catch {
      toast.error(t('team.delete_error'));
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied'));
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintAllBadges = useCallback(() => {    const active = collaborators.filter(c => c.status === 'active');
    if (active.length === 0) {
      toast.error(t('team.no_active_print'));
      return;
    }
    if (!user?.id) {
      toast.error(t('common.not_logged_in'));
      return;
    }
    const url = `/print/badges-equipe?owner_id=${encodeURIComponent(user.id)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [collaborators, user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            to={userType === 'partner' ? ROUTES.PARTNER_DASHBOARD : ROUTES.EXHIBITOR_DASHBOARD}
            className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back_dashboard')}
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userType === 'partner' ? t('team.title_partner') : t('team.title_exhibitor')}
                </h1>
                <p className="text-sm text-gray-500">
                  {companyName && <span className="font-medium text-indigo-600">{companyName}</span>}
                  {standNumber && <span className="ml-2 text-gray-400">• {t('team.stand')} {standNumber}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <Plus className="h-4 w-4" />
              {t('team.add_collab')}
            </button>
            {collaborators.some(c => c.status === 'active') && (
              <button
                onClick={() => handlePrintAllBadges()}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
              >
                <Printer className="h-4 w-4" />
                {t('team.print_badges')}
              </button>
            )}
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl border border-indigo-100 shadow-lg p-6 mb-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                {t('team.new_collab')}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.first_name')} *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.last_name')} *</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Nom de famille"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')} *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phone')}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="+212 6 xx xx xx xx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('team.position')}</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Exposant, Commercial, Technicien..."
                  />
                </div>
                <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <strong>ℹ️ {t('team.info_title')}</strong> {t('team.email_info')}
                </div>
                <div className="sm:col-span-2 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {isSubmitting ? t('team.creating') : t('team.create_account')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des collaborateurs */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : collaborators.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('team.no_collabs')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('team.no_collabs_desc')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" /> {t('team.add_first_collab')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{collaborators.length} {collaborators.length > 1 ? t('team.collabs_plural') : t('team.collab_singular')}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintAllBadges()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                  title="Imprimer tous les badges"
                >
                  <Printer className="h-3.5 w-3.5" /> {t('team.print_badges')}
                </button>
                <button onClick={fetchCollaborators} className="text-gray-400 hover:text-gray-600 transition">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            {collaborators.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm ${c.status === 'inactive' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{c.first_name} {c.last_name}</div>
                    <div className="text-xs text-gray-500">{c.position} — {companyName}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-sm text-gray-600 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{c.email}</span>
                    <button onClick={() => copyToClipboard(c.email)} className="text-gray-300 hover:text-indigo-500">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Badge statut */}
                  {c.status === 'active' ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3" /> {t('team.status_active')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <AlertCircle className="h-3 w-3" /> {t('team.status_inactive')}
                    </span>
                  )}

                  {/* Bouton supprimer */}
                  {c.status === 'active' && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

