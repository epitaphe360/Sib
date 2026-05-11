import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Tag, Crown, Building2, Handshake, Pencil, Check, X,
  RefreshCw, AlertCircle, Save, DollarSign, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

// ── Types ────────────────────────────────────────────────────────────────────

interface PricingRow {
  id: string;
  category: 'visitor' | 'exhibitor' | 'partner';
  level: string;
  label: string;
  description: string | null;
  amount: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

const CATEGORY_META = {
  visitor:  { label: 'Visiteurs VIP',    icon: Crown,     color: '#7c3aed', bg: '#f5f3ff' },
  exhibitor:{ label: 'Exposants',        icon: Building2, color: '#0ea5e9', bg: '#f0f9ff' },
  partner:  { label: 'Partenaires',      icon: Handshake, color: '#10b981', bg: '#f0fdf4' },
} as const;

const CURRENCY_LABELS: Record<string, string> = {
  EUR: '€ EUR', MAD: 'MAD', USD: '$ USD',
};

// ── Cellule éditable ─────────────────────────────────────────────────────────

interface EditCellProps {
  row: PricingRow;
  onSaved: (updated: PricingRow) => void;
}

function EditableRow({ row, onSaved }: Readonly<EditCellProps>) {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(row.amount));
  const [currency, setCurrency] = useState(row.currency);
  const [saving, setSaving] = useState(false);

  const cancel = () => { setAmount(String(row.amount)); setCurrency(row.currency); setEditing(false); };

  const save = async () => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) { toast.error('Montant invalide'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .update({ amount: parsed, currency, updated_at: new Date().toISOString(), updated_by: user?.id ?? null })
        .eq('id', row.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Aucune ligne mise à jour — ID introuvable');
      toast.success(`Prix mis à jour : ${row.label}`);
      onSaved(data as PricingRow);
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const meta = CATEGORY_META[row.category];

  return (
    <motion.tr
      layout
      className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
    >
      {/* Label */}
      <td className="py-3.5 px-4">
        <div className="flex items-start gap-2">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 mt-0.5"
            style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
          >
            <Tag className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{row.label}</p>
            {row.description && <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>}
          </div>
        </div>
      </td>

      {/* Niveau */}
      <td className="py-3.5 px-4">
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{row.level}</span>
      </td>

      {/* Montant */}
      <td className="py-3.5 px-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {Object.entries(CURRENCY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            {row.amount === 0 ? (
              <span className="text-xs text-gray-400 italic">Sur devis / Gratuit</span>
            ) : (
              <span className="text-base font-bold" style={{ color: meta.color }}>
                {row.amount.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-500">{row.currency}</span>
              </span>
            )}
          </div>
        )}
      </td>

      {/* Dernière MÀJ */}
      <td className="py-3.5 px-4 text-xs text-gray-400">
        {new Date(row.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
            <button onClick={cancel} className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-3.5 h-3.5" /> Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
        )}
      </td>
    </motion.tr>
  );
}

// ── Tableau par catégorie ─────────────────────────────────────────────────────

function CategorySection({
  category,
  rows,
  onRowSaved,
}: Readonly<{
  category: 'visitor' | 'exhibitor' | 'partner';
  rows: PricingRow[];
  onRowSaved: (updated: PricingRow) => void;
}>) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: `${meta.color}30` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4" style={{ background: meta.bg, borderBottom: `1px solid ${meta.color}20` }}>
        <span className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
          <Icon className="w-5 h-5" style={{ color: meta.color }} />
        </span>
        <div>
          <h2 className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</h2>
          <p className="text-xs text-gray-400">{sorted.length} tarif{sorted.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Offre</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Niveau</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mis à jour</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <EditableRow key={row.id} row={row} onSaved={onRowSaved} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AdminPricingPage() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('category')
        .order('sort_order');
      if (error) throw error;
      setRows((data ?? []) as PricingRow[]);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRowSaved = useCallback((updated: PricingRow) => {
    setRows(prev => prev.map(r => r.id === updated.id ? updated : r));
  }, []);

  const byCategory = (cat: 'visitor' | 'exhibitor' | 'partner') => rows.filter(r => r.category === cat);

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* En-tête */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {/* Retour */}
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au Tableau de bord
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Gestion des Tarifs</h1>
                <p className="text-sm text-gray-500 mt-0.5">Configurez les prix d'inscription pour chaque profil SIB 2026</p>
              </div>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Info banner */}
          <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Les modifications sont enregistrées immédiatement dans la base de données.
              Les prix affichés ici sont ceux proposés aux utilisateurs lors de leur inscription.
              Un montant de <strong>0</strong> s'affichera comme "Sur devis / Gratuit".
            </p>
          </div>
        </motion.div>

        {/* Contenu */}
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Chargement des tarifs…</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-700 mb-1">Erreur de chargement</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <p className="text-xs text-gray-400">
              Si la table <code>pricing_config</code> n'existe pas encore, appliquez la migration{' '}
              <code>20260509000003_pricing_config.sql</code> dans Supabase.
            </p>
            <button onClick={load} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
              Réessayer
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(['visitor', 'exhibitor', 'partner'] as const).map(cat => (
              byCategory(cat).length > 0 ? (
                <CategorySection
                  key={cat}
                  category={cat}
                  rows={byCategory(cat)}
                  onRowSaved={handleRowSaved}
                />
              ) : null
            ))}

            {rows.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Save className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun tarif configuré.</p>
                <p className="text-xs mt-1">Appliquez la migration SQL pour initialiser les données.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
