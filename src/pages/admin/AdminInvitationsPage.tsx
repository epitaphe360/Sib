import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock, Loader2, Search, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

interface InvitationLetter {
  id: string;
  requester_id: string;
  requester_type: string;
  requester_company: string;
  recipient_first_name: string;
  recipient_last_name: string;
  recipient_company: string;
  recipient_nationality: string;
  recipient_passport_no: string;
  recipient_email: string;
  visit_dates: string[];
  letter_language: string;
  visit_purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

const SALON_DATES: Record<string, string> = {
  '2026-11-25': '25 Nov.',
  '2026-11-26': '26 Nov.',
  '2026-11-27': '27 Nov.',
  '2026-11-28': '28 Nov.',
  '2026-11-29': '29 Nov.',
};

export default function AdminInvitationsPage() {
  const [letters, setLetters] = useState<InvitationLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    try {
      let q = (supabase as any).from('invitation_letters').select('*').order('created_at', { ascending: false });
      if (statusFilter !== 'all') {q = q.eq('status', statusFilter);}
      const { data, error } = await q;
      if (error) {throw error;}
      setLetters(data || []);
    } catch {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLetters(); }, [fetchLetters]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await (supabase as any)
        .from('invitation_letters')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {throw error;}
      toast.success('Demande approuvée ! Un email sera envoyé au demandeur.');
      fetchLetters();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNote.trim()) {
      toast.error('Veuillez indiquer le motif du refus');
      return;
    }
    setProcessingId(id);
    try {
      const { error } = await (supabase as any)
        .from('invitation_letters')
        .update({ status: 'rejected', admin_note: rejectNote, processed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {throw error;}
      toast.success('Demande refusée. Le demandeur sera notifié.');
      setShowRejectForm(null);
      setRejectNote('');
      fetchLetters();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = letters.filter(l => {
    const q = search.toLowerCase();
    return !q || l.recipient_first_name.toLowerCase().includes(q) ||
      l.recipient_last_name.toLowerCase().includes(q) ||
      l.recipient_company.toLowerCase().includes(q) ||
      l.requester_company?.toLowerCase().includes(q);
  });

  const counts = {
    all: letters.length,
    pending: letters.filter(l => l.status === 'pending').length,
    approved: letters.filter(l => l.status === 'approved').length,
    rejected: letters.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Tableau de Bord
      </Link>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-600 p-3 rounded-xl">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Lettres d'Invitation</h1>
          <p className="text-sm text-gray-500">Approuvez ou refusez les demandes de lettres d'invitation</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
          >
            {s === 'pending' && <Clock className="h-3.5 w-3.5" />}
            {s === 'approved' && <CheckCircle className="h-3.5 w-3.5" />}
            {s === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
            {s === 'all' ? 'Tout' : s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvées' : 'Refusées'}
            <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full ml-1">{counts[s]}</span>
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune demande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(letter => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    {/* Destinataire */}
                    <div className="font-bold text-gray-900">
                      {letter.recipient_first_name} {letter.recipient_last_name}
                    </div>
                    <div className="text-sm text-gray-500">{letter.recipient_company} — {letter.recipient_nationality}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Demandé par <strong>{letter.requester_company}</strong> ({letter.requester_type}) •{' '}
                      {new Date(letter.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {letter.visit_dates.map(d => (
                        <span key={d} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          {SALON_DATES[d] || d}
                        </span>
                      ))}
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">
                        {letter.letter_language}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1 ${
                      letter.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      letter.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {letter.status === 'approved' && <CheckCircle className="h-3.5 w-3.5" />}
                      {letter.status === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                      {letter.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                      {letter.status === 'approved' ? 'Approuvée' : letter.status === 'rejected' ? 'Refusée' : 'En attente'}
                    </span>
                    <button
                      onClick={() => setExpandedId(expandedId === letter.id ? null : letter.id)}
                      className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
                    >
                      {expandedId === letter.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      Détails
                    </button>
                  </div>
                </div>

                {/* Détails étendus */}
                {expandedId === letter.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                      <div>
                        <span className="text-gray-400 block text-xs">Passeport</span>
                        <span className="font-medium">{letter.recipient_passport_no}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs">Email</span>
                        <span className="font-medium">{letter.recipient_email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs">Objet</span>
                        <span className="font-medium">{letter.visit_purpose}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions pour demandes en attente */}
                {letter.status === 'pending' && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprove(letter.id)}
                      disabled={!!processingId}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      {processingId === letter.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Approuver
                    </button>
                    <button
                      onClick={() => setShowRejectForm(showRejectForm === letter.id ? null : letter.id)}
                      className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      <XCircle className="h-4 w-4" />
                      Refuser
                    </button>
                  </div>
                )}

                {/* Formulaire de refus */}
                {showRejectForm === letter.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Motif du refus (obligatoire)..."
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-300"
                    />
                    <button
                      onClick={() => handleReject(letter.id)}
                      disabled={!!processingId}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {processingId === letter.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer'}
                    </button>
                  </div>
                )}

                {/* Note admin si refusé */}
                {letter.status === 'rejected' && letter.admin_note && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                    <strong>Motif :</strong> {letter.admin_note}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
