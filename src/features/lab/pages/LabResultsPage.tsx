import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { resultSchema } from '../schemas';
import { detectResultAnomalies, correctionDueAt } from '../lib/resultReview';
import { canTransition } from '../lib/status';
import { getAiProvider } from '../lib/aiProvider';

export default function LabResultsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [requests, setRequests] = useState<{ id: string; dossier_number: string }[]>([]);
  const [rows, setRows] = useState<{ id: string; analysis_name: string; value: string | null; ai_summary: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(resultSchema), mode: 'onChange' });

  async function load() {
    if (!orgId) return;
    const [req, res] = await Promise.all([
      labSchema().from('client_requests').select('id,dossier_number').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('analysis_results').select('id,analysis_name,value,ai_summary').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }),
    ]);
    setRequests((req.data ?? []) as { id: string; dossier_number: string }[]);
    setRows((res.data ?? []) as typeof rows);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Résultats</h1>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="rounded-xl border border-slate-200 bg-white p-5 grid sm:grid-cols-2 gap-3" onSubmit={form.handleSubmit(async (v) => {
        if (!orgId) return;
        const issues = detectResultAnomalies({
          analysisName: v.analysis_name, value: v.value, unit: v.unit, method: v.method,
        });
        const ai = await getAiProvider().detectResultAnomalies(`${v.analysis_name} ${v.value} ${v.unit}`);
        const summary = [...issues, ...ai.anomalies].join(' · ') || 'Aucune anomalie automatique';
        const { error: iErr } = await labSchema().from('analysis_results').insert({
          organization_id: orgId,
          request_id: v.request_id,
          sample_id: v.sample_id || null,
          analysis_name: v.analysis_name,
          value: v.value,
          unit: v.unit,
          method: v.method,
          uncertainty: v.uncertainty || null,
          accreditation: v.accreditation || null,
          ai_summary: `IA (aide): ${summary}`,
        });
        if (iErr) { setError(iErr.message); return; }
        const req = await labSchema().from('client_requests').select('status').eq('id', v.request_id).maybeSingle();
        if (req.data?.status && canTransition(req.data.status as never, 'RESULTS_RECEIVED')) {
          await labSchema().from('client_requests').update({ status: 'RESULTS_RECEIVED' }).eq('id', v.request_id);
        }
        if (canTransition('RESULTS_RECEIVED', 'AI_REVIEW')) {
          await labSchema().from('client_requests').update({ status: 'AI_REVIEW' }).eq('id', v.request_id);
        }
        void correctionDueAt;
        setMessage('Résultat rattaché — l’IA n’a pas validé');
        form.reset();
        await load();
      })}>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" {...form.register('request_id')}>
          <option value="">Dossier</option>
          {requests.map((r) => <option key={r.id} value={r.id}>{r.dossier_number}</option>)}
        </select>
        <Input placeholder="Analyse" {...form.register('analysis_name')} />
        <Input placeholder="Valeur" {...form.register('value')} />
        <Input placeholder="Unité" {...form.register('unit')} />
        <Input placeholder="Méthode" {...form.register('method')} />
        <Input placeholder="Incertitude" {...form.register('uncertainty')} />
        <Button type="submit" disabled={!form.formState.isValid}>Enregistrer</Button>
      </form>
      <ul className="rounded-xl border border-slate-200 bg-white divide-y">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3 text-sm">
            <span className="font-medium">{r.analysis_name}</span> = {r.value}
            <p className="text-xs text-slate-500">{r.ai_summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
