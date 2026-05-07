import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, Send, RefreshCw, Search, CheckCircle2,
  XCircle, Loader2, AlertTriangle, ArrowLeft, Copy, Check,
  Eye, EyeOff, Users, Building2, Handshake, ChevronDown, ChevronUp,
  Mail, Shield,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';
import { useAuthStore } from '../../store/authStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string;
  type: 'exhibitor' | 'partner';
  company?: string;
  lastSentAt?: string | null;
  status: 'idle' | 'sending' | 'done' | 'error';
  lastPassword?: string;
}

type SendResult = {
  userId: string;
  success: boolean;
  password?: string;
  emailSent?: boolean;
  error?: string;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function CopyButton({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-[#C9A84C] hover:text-[#e8c55a] transition-colors"
      title="Copier"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminCredentialsPage() {
  const { user } = useAuthStore();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'exhibitor' | 'partner'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [expandedLog, setExpandedLog] = useState(false);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // ── Chargement des utilisateurs ──────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, type, company_name, created_at')
        .in('type', ['exhibitor', 'partner'])
        .order('type')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRows(
        (data ?? []).map((u: any) => ({
          id: u.id,
          email: u.email ?? '',
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email?.split('@')[0] || '—',
          type: u.type,
          company: u.company_name,
          lastSentAt: null,
          status: 'idle',
        }))
      );
    } catch (err: any) {
      toast.error('Erreur lors du chargement : ' + (err?.message ?? err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Chargement log audit ────────────────────────────────────────────────
  const loadAuditLog = useCallback(async () => {
    const { data } = await supabase
      .from('admin_audit_log')
      .select('*')
      .eq('action', 'send_credentials')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setAuditLog(data);
  }, []);

  useEffect(() => {
    loadUsers();
    loadAuditLog();
  }, [loadUsers, loadAuditLog]);

  // ── Envoi accès pour un utilisateur ─────────────────────────────────────
  const sendCredentials = useCallback(async (rowId: string): Promise<SendResult> => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return { userId: rowId, success: false, error: 'Utilisateur introuvable' };

    setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: 'sending' } : r));

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const { data, error } = await supabase.functions.invoke('send-credentials', {
        body: { userId: row.id, email: row.email, name: row.name },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (error || !data?.success) {
        throw new Error(data?.error ?? error?.message ?? 'Erreur inconnue');
      }

      setRows(prev =>
        prev.map(r =>
          r.id === rowId
            ? { ...r, status: 'done', lastSentAt: new Date().toISOString(), lastPassword: data.password }
            : r
        )
      );

      return { userId: rowId, success: true, password: data.password, emailSent: data.emailSent };
    } catch (err: any) {
      setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: 'error' } : r));
      return { userId: rowId, success: false, error: err?.message ?? 'Erreur' };
    }
  }, [rows]);

  // ── Envoi individuel ─────────────────────────────────────────────────────
  const handleSendOne = async (rowId: string) => {
    const result = await sendCredentials(rowId);
    if (result.success) {
      toast.success(`Accès envoyé${result.emailSent ? ' par email' : ''} ✓`);
      loadAuditLog();
    } else {
      toast.error('Échec : ' + result.error);
    }
  };

  // ── Envoi groupé ─────────────────────────────────────────────────────────
  const handleBulkSend = async () => {
    if (selected.size === 0) return;
    setIsBulkSending(true);
    let ok = 0;
    let fail = 0;

    for (const id of Array.from(selected)) {
      const result = await sendCredentials(id);
      result.success ? ok++ : fail++;
    }

    setIsBulkSending(false);
    setSelected(new Set());
    const failSuffix = fail > 0 ? ', ' + fail + ' échec(s)' : '';
    toast.success(ok + ' envoi(s) réussi(s)' + failSuffix);
    loadAuditLog();
  };

  // ── Sélection ────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visible = filtered.map(r => r.id);
    if (visible.every(id => selected.has(id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible));
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Filtrage ─────────────────────────────────────────────────────────────
  const filtered = rows.filter(r => {
    const matchType = filterType === 'all' || r.type === filterType;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.company ?? '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const allVisibleSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));

  // ── Guard ────────────────────────────────────────────────────────────────
  if (user?.type !== 'admin') {
    return (
      <div className="min-h-screen bg-[#07101e] flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Accès restreint</h2>
          <p className="text-white/50 mb-6">Réservé aux administrateurs.</p>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="text-[#C9A84C] hover:underline text-sm">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -5%, #0f2240 0%, #07101e 55%, #04080f 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#C9A84C] transition-colors mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex-shrink-0">
              <KeyRound className="h-7 w-7 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Gestion des accès</h1>
              <p className="text-white/40 text-sm mt-1">
                Générez et envoyez les mots de passe aux exposants et partenaires.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Barre d'outils */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 mb-5 flex flex-wrap gap-3 items-center"
        >
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, société…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
          </div>

          {/* Filtre type */}
          <div className="flex gap-1.5">
            {([['all', 'Tous', Users], ['exhibitor', 'Exposants', Building2], ['partner', 'Partenaires', Handshake]] as const).map(
              ([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => setFilterType(value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filterType === value
                      ? 'bg-[#C9A84C] text-[#0F2034]'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              )
            )}
          </div>

          <button
            onClick={loadUsers}
            className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Barre de sélection groupée */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 p-3.5 flex items-center justify-between gap-3">
                <span className="text-[#C9A84C] text-sm font-semibold">
                  {selected.size} utilisateur(s) sélectionné(s)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(new Set())}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                  >
                    Désélectionner
                  </button>
                  <button
                    onClick={handleBulkSend}
                    disabled={isBulkSending}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C9A84C] text-[#0F2034] font-bold text-xs hover:bg-[#e8c55a] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isBulkSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Envoyer à tous ({selected.size})
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tableau */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur overflow-hidden mb-8"
        >
          {/* Entête tableau */}
          <div className="grid grid-cols-[40px_1fr_180px_100px_140px_130px] gap-2 px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/10">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="rounded accent-[#C9A84C] cursor-pointer"
              />
            </div>
            <div>Utilisateur</div>
            <div>Email</div>
            <div>Rôle</div>
            <div>Dernier envoi</div>
            <div className="text-right">Action</div>
          </div>

          {/* Contenu du tableau */}
          {(() => {
            if (isLoading) {
              return (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
                </div>
              );
            }
            if (filtered.length === 0) {
              return (
                <div className="text-center py-16 text-white/30">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              );
            }
            return (
            <div className="divide-y divide-white/5">
              {filtered.map(row => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`grid grid-cols-[40px_1fr_180px_100px_140px_130px] gap-2 px-4 py-3.5 items-center hover:bg-white/[0.03] transition-colors ${
                    selected.has(row.id) ? 'bg-[#C9A84C]/5' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded accent-[#C9A84C] cursor-pointer"
                    />
                  </div>

                  {/* Nom + société */}
                  <div className="min-w-0">
                    <p className="text-white/90 font-medium text-sm truncate">{row.name}</p>
                    {row.company && (
                      <p className="text-white/35 text-xs truncate">{row.company}</p>
                    )}
                    {/* Mot de passe généré */}
                    {row.lastPassword && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-[#C9A84C]/80 font-mono">
                          {showPasswords.has(row.id)
                            ? row.lastPassword
                            : '•'.repeat(row.lastPassword.length)}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(row.id)}
                          className="text-white/25 hover:text-white/60 transition-colors"
                        >
                          {showPasswords.has(row.id)
                            ? <EyeOff className="h-3 w-3" />
                            : <Eye className="h-3 w-3" />}
                        </button>
                        <CopyButton text={row.lastPassword} />
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="min-w-0">
                    <p className="text-white/50 text-xs truncate">{row.email}</p>
                  </div>

                  {/* Type */}
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      row.type === 'exhibitor'
                        ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                    }`}>
                      {row.type === 'exhibitor' ? <Building2 className="h-3 w-3" /> : <Handshake className="h-3 w-3" />}
                      {row.type === 'exhibitor' ? 'Exposant' : 'Partenaire'}
                    </span>
                  </div>

                  {/* Dernier envoi */}
                  <div>
                    {(() => {
                      if (row.status === 'done') {
                        return (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Envoyé
                          </span>
                        );
                      }
                      if (row.status === 'error') {
                        return (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <XCircle className="h-3.5 w-3.5" /> Échec
                          </span>
                        );
                      }
                      if (row.lastSentAt) {
                        return (
                          <span className="text-white/35 text-xs">
                            {new Date(row.lastSentAt).toLocaleDateString('fr-FR')}
                          </span>
                        );
                      }
                      return <span className="text-white/20 text-xs">—</span>;
                    })()}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSendOne(row.id)}
                      disabled={row.status === 'sending'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B365D] border border-[#C9A84C]/20 text-[#C9A84C] text-xs font-semibold hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {row.status === 'sending' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {row.status === 'done' ? 'Renvoyer' : 'Envoyer'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            );
          })()}
        </motion.div>

        {/* Journal d'audit */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
        >
          <button
            onClick={() => setExpandedLog(v => !v)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2 text-white/60 font-semibold text-sm">
              <Mail className="h-4 w-4 text-[#C9A84C]" />
              Journal d'envoi ({auditLog.length})
            </div>
            {expandedLog ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </button>

          <AnimatePresence>
            {expandedLog && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/10 divide-y divide-white/5 max-h-64 overflow-y-auto">
                  {auditLog.length === 0 ? (
                    <p className="text-center text-white/25 text-sm py-8">Aucun envoi enregistré</p>
                  ) : (
                    auditLog.map((log) => (
                      <div key={log.id ?? log.created_at} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <span className="text-white/70">{log.target_email}</span>
                          {log.metadata?.name && (
                            <span className="text-white/30 text-xs ml-2">({log.metadata.name})</span>
                          )}
                        </div>
                        <span className="text-white/30 text-xs">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info sécurité */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border border-amber-600/20 bg-amber-900/10">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300/70 text-xs leading-relaxed">
            Les mots de passe générés sont alphanumériques (sans caractères spéciaux) et envoyés directement par email.
            Ils remplacent immédiatement le mot de passe précédent. L'utilisateur n'est pas obligé de le changer.
          </p>
        </div>

      </div>
    </div>
  );
}
