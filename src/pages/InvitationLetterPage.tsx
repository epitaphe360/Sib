import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowLeft, Plus, Clock, CheckCircle, XCircle,
  Loader2, User, Building, Mail, Phone, Globe, Passport,
  Calendar, Languages, Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

type InvitationStatus = 'pending' | 'approved' | 'rejected';

interface InvitationLetter {
  id: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_company: string;
  recipient_nationality: string;
  recipient_email: string;
  visit_purpose: string;
  visit_dates: string[];
  letter_language: 'fr' | 'ar' | 'en';
  status: InvitationStatus;
  admin_note?: string;
  created_at: string;
}

const SALON_DATES = [
  { value: '2026-11-25', label: 'Mercredi 25 Novembre 2026' },
  { value: '2026-11-26', label: 'Jeudi 26 Novembre 2026' },
  { value: '2026-11-27', label: 'Vendredi 27 Novembre 2026' },
  { value: '2026-11-28', label: 'Samedi 28 Novembre 2026' },
  { value: '2026-11-29', label: 'Dimanche 29 Novembre 2026' },
];

const COUNTRIES = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Angola', 'Arabie Saoudite',
  'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahreïn', 'Bangladesh',
  'Belgique', 'Bénin', 'Biélorussie', 'Bolivie', 'Bosnie-Herzégovine', 'Brésil', 'Bulgarie',
  'Burkina Faso', 'Burundi', 'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine',
  'Chypre', 'Colombie', 'Comores', 'Congo (Brazzaville)', 'Congo (RDC)', 'Corée du Sud',
  'Costa Rica', "Côte d'Ivoire", 'Croatie', 'Cuba', 'Danemark', 'Djibouti', 'Égypte', 'Émirats Arabes Unis',
  'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Éthiopie', 'Finlande', 'France', 'Gabon',
  'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Guatemala', 'Guinée', 'Guinée équatoriale',
  'Haïti', 'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande',
  'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie', 'Kazakhstan', 'Kenya', 'Kirghizistan',
  'Kosovo', 'Koweït', 'Laos', 'Liban', 'Libéria', 'Libye', 'Lituanie', 'Luxembourg',
  'Madagascar', 'Malaisie', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Mauritanie', 'Maurice',
  'Mexique', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique', 'Myanmar',
  'Namibie', 'Népal', 'Nicaragua', 'Niger', 'Nigéria', 'Norvège', 'Nouvelle-Zélande',
  'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Pays-Bas',
  'Pérou', 'Philippines', 'Pologne', 'Portugal', 'Qatar', 'République Tchèque', 'Roumanie',
  'Royaume-Uni', 'Russie', 'Rwanda', 'Sénégal', 'Serbie', 'Sierra Leone', 'Singapour',
  'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse',
  'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Togo', 'Tunisie', 'Turkménistan',
  'Turquie', 'Ukraine', 'Uruguay', 'Venezuela', 'Vietnam', 'Yémen', 'Zambie', 'Zimbabwe',
];

const NATIONALITIES = [
  'Afghane', 'Algérienne', 'Allemande', 'Angolaise', 'Saoudienne', 'Argentine', 'Australienne',
  'Autrichienne', 'Azerbaïdjanaise', 'Bahreïnie', 'Bangladaise', 'Belge', 'Béninoise',
  'Biélorusse', 'Bolivienne', 'Brésilienne', 'Bulgare', 'Burkinabé', 'Cambodgienne',
  'Camerounaise', 'Canadienne', 'Chilienne', 'Chinoise', 'Colombienne', 'Comorienne',
  'Congolaise', 'Sud-Coréenne', 'Ivoirienne', 'Croate', 'Cubaine', 'Danoise', 'Djiboutienne',
  'Égyptienne', 'Émiratie', 'Équatorienne', 'Espagnole', 'Estonienne', 'Éthiopienne',
  'Finlandaise', 'Française', 'Gabonaise', 'Ghanéenne', 'Grecque', 'Guinéenne', 'Haïtienne',
  'Hongroise', 'Indienne', 'Indonésienne', 'Irakienne', 'Iranienne', 'Irlandaise', 'Israélienne',
  'Italienne', 'Jamaïcaine', 'Japonaise', 'Jordanienne', 'Kazakhe', 'Kenyane', 'Koweïtienne',
  'Laotienne', 'Libanaise', 'Libyenne', 'Lituanienne', 'Luxembourgeoise', 'Malgache',
  'Malaisienne', 'Malienne', 'Maltaise', 'Marocaine', 'Mauritanienne', 'Mauricienne',
  'Mexicaine', 'Mongole', 'Mozambicaine', 'Namibienne', 'Népalaise', 'Néerlandaise',
  'Nigériane', 'Nigérienne', 'Norvégienne', 'Néo-Zélandaise', 'Omanaise', 'Ougandaise',
  'Ouzbèke', 'Pakistanaise', 'Palestinienne', 'Panaméenne', 'Paraguayenne', 'Péruvienne',
  'Philippine', 'Polonaise', 'Portugaise', 'Qatarie', 'Roumaine', 'Britannique', 'Russe',
  'Rwandaise', 'Sénégalaise', 'Serbe', 'Singapourienne', 'Slovaque', 'Slovène', 'Somalienne',
  'Soudanaise', 'Sri-Lankaise', 'Suédoise', 'Suisse', 'Syrienne', 'Tadjike', 'Tanzanienne',
  'Tchadienne', 'Thaïlandaise', 'Togolaise', 'Tunisienne', 'Turkmène', 'Turque', 'Ukrainienne',
  'Uruguayenne', 'Vénézuélienne', 'Vietnamienne', 'Yéménite', 'Zambienne', 'Zimbabwéenne',
  'Sud-Africaine',
];

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
];

const STATUS_CONFIG: Record<InvitationStatus, { color: string; Icon: React.FC<{className?: string}> }> = {
  pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  approved: { color: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle },
  rejected: { color: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
};

const emptyForm = {
  recipient_first_name: '',
  recipient_last_name: '',
  recipient_nationality: '',
  recipient_passport_no: '',
  recipient_passport_exp: '',
  recipient_company: '',
  recipient_position: '',
  recipient_email: '',
  recipient_phone: '',
  recipient_country: '',
  recipient_city: '',
  visit_purpose: '',
  visit_dates: [] as string[],
  letter_language: 'fr' as 'fr' | 'ar' | 'en',
};

interface InvitationLetterPageProps {
  userType: 'exhibitor' | 'partner';
}

export default function InvitationLetterPage({ userType }: InvitationLetterPageProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const dateLabelMap: Record<string, string> = {
    '2026-11-25': t('invitation.date_wed'),
    '2026-11-26': t('invitation.date_thu'),
    '2026-11-27': t('invitation.date_fri'),
    '2026-11-28': t('invitation.date_sat'),
    '2026-11-29': t('invitation.date_sun'),
  };
  const [letters, setLetters] = useState<InvitationLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [exhibitorData, setExhibitorData] = useState<{ company_name: string; stand_number: string; entity_id: string } | null>(null);

  const dashboardRoute = userType === 'exhibitor' ? ROUTES.EXHIBITOR_DASHBOARD : ROUTES.PARTNER_DASHBOARD;

  const fetchEntityData = useCallback(async () => {
    if (!user?.id) {return;}
    const table = userType === 'exhibitor' ? 'exhibitors' : 'partners';
    const nameField = userType === 'exhibitor' ? 'company_name' : 'organization_name';
    const { data } = await (supabase as any)
      .from(table)
      .select(`id, ${nameField}, stand_number`)
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setExhibitorData({
        entity_id: data.id,
        company_name: data[nameField] || '',
        stand_number: data.stand_number || '',
      });
    }
  }, [user, userType]);

  const fetchLetters = useCallback(async () => {
    if (!user?.id) {return;}
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('invitation_letters')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {throw error;}
      setLetters(data || []);
    } catch {
      toast.error(t('invitation.load_error'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntityData();
    fetchLetters();
  }, [fetchEntityData, fetchLetters]);

  const toggleDate = (date: string) => {
    setForm(f => ({
      ...f,
      visit_dates: f.visit_dates.includes(date)
        ? f.visit_dates.filter(d => d !== date)
        : [...f.visit_dates, date],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !exhibitorData) {return;}
    if (form.visit_dates.length === 0) {
      toast.error(t('invitation.select_date_error'));
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        requester_id: user.id,
        requester_type: userType,
        requester_company: exhibitorData.company_name,
        requester_stand: exhibitorData.stand_number,
        ...form,
        status: 'pending',
      };
      if (userType === 'exhibitor') {payload.exhibitor_id = exhibitorData.entity_id;}
      else {payload.partner_id = exhibitorData.entity_id;}

      const { error } = await (supabase as any).from('invitation_letters').insert(payload);
      if (error) {throw error;}
      toast.success(t('invitation.submit_success'));
      setForm(emptyForm);
      setShowForm(false);
      fetchLetters();
    } catch (err: any) {
      toast.error(err?.message || t('invitation.send_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={dashboardRoute} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back_dashboard')}
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('invitation.title')}</h1>
                <p className="text-sm text-gray-500">{t('invitation.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <Plus className="h-4 w-4" /> {t('invitation.new_request')}
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-indigo-100 shadow-lg p-6 mb-8 space-y-6"
            >
              <h2 className="text-lg font-bold text-gray-900 border-b pb-4">{t('invitation.recipient_info')}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Prénom & Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.first_name')} *</label>
                  <input type="text" required value={form.recipient_first_name}
                    onChange={e => setForm(f => ({ ...f, recipient_first_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.last_name')} *</label>
                  <input type="text" required value={form.recipient_last_name}
                    onChange={e => setForm(f => ({ ...f, recipient_last_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                {/* Nationalité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.nationality')} *</label>
                  <select required value={form.recipient_nationality}
                    onChange={e => setForm(f => ({ ...f, recipient_nationality: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    <option value="">{t('common.select')}</option>
                    {[...NATIONALITIES].sort((a, b) => a.localeCompare(b, 'fr')).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                {/* Pays & Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.country')} *</label>
                  <select required value={form.recipient_country}
                    onChange={e => setForm(f => ({ ...f, recipient_country: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    <option value="">{t('common.select')}</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.city')} *</label>
                  <input type="text" required value={form.recipient_city}
                    onChange={e => setForm(f => ({ ...f, recipient_city: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                {/* Passeport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.passport_no')} *</label>
                  <input type="text" required value={form.recipient_passport_no}
                    onChange={e => setForm(f => ({ ...f, recipient_passport_no: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="AB123456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.passport_exp')} *</label>
                  <input type="date" required value={form.recipient_passport_exp}
                    onChange={e => setForm(f => ({ ...f, recipient_passport_exp: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                {/* Société & Fonction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.company')} *</label>
                  <input type="text" required value={form.recipient_company}
                    onChange={e => setForm(f => ({ ...f, recipient_company: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.position')} *</label>
                  <input type="text" required value={form.recipient_position}
                    onChange={e => setForm(f => ({ ...f, recipient_position: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                {/* Email & Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.email')} *</label>
                  <input type="email" required value={form.recipient_email}
                    onChange={e => setForm(f => ({ ...f, recipient_email: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.phone')} *</label>
                  <input type="tel" required value={form.recipient_phone}
                    onChange={e => setForm(f => ({ ...f, recipient_phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 border-b pb-4 pt-2">{t('invitation.visit_info')}</h2>

              <div className="space-y-4">
                {/* Objet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('invitation.visit_purpose_label')} *</label>
                  <textarea required value={form.visit_purpose}
                    onChange={e => setForm(f => ({ ...f, visit_purpose: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder={t('invitation.visit_purpose_ph')} />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('invitation.visit_dates_label')} *</label>
                  <div className="flex flex-wrap gap-3">
                    {SALON_DATES.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDate(d.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          form.visit_dates.includes(d.value)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {dateLabelMap[d.value] ?? d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Langue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('invitation.letter_lang')}</label>
                  <div className="flex gap-3">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, letter_language: l.value as 'fr' | 'ar' | 'en' }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          form.letter_language === l.value
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {t(`invitation.lang_${l.value}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info demandeur (pré-rempli) */}
                {exhibitorData && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <strong>{t('invitation.from')}</strong> {exhibitorData.company_name}
                    {exhibitorData.stand_number && ` — ${t('invitation.stand')} ${exhibitorData.stand_number}`}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? t('invitation.sending') : t('invitation.send_request')}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Historique des demandes */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">{t('invitation.my_requests')}</h2>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
          ) : letters.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t('invitation.no_requests')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {letters.map(letter => {
                const cfg = STATUS_CONFIG[letter.status];
                const StatusIcon = cfg.Icon;
                return (
                  <div key={letter.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {letter.recipient_first_name} {letter.recipient_last_name}
                          <span className="text-gray-400 font-normal ml-2">— {letter.recipient_company}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{letter.visit_purpose.slice(0, 80)}...</div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {letter.visit_dates.map(d => dateLabelMap[d] ?? d).join(', ')}
                          <span className="ml-2 uppercase font-medium">{letter.letter_language}</span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {t(`invitation.status_${letter.status}`)}
                      </span>
                    </div>
                    {letter.admin_note && letter.status === 'rejected' && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                        <strong>{t('invitation.reject_reason')}</strong> {letter.admin_note}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-3">
                      {t('invitation.requested_on')} {new Date(letter.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

