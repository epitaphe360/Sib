import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { can } from '../rbac';
import { correctionDueAt, shouldEmailSupplierOnDoubleRefuse } from '../lib/resultReview';
import { canTransition } from '../lib/status';
import { confirmLabAction, LabAlert, LabCard, LabPage } from '../components/LabUi';

interface ResultRow {
  id: string;
  request_id: string;
  analysis_name: string;
  ai_summary: string | null;
  correction_due_at: string | null;
}

export default function LabValidationsPage() {
  const { activeOrg, role, userId } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('analysis_results').select('id,request_id,analysis_name,ai_summary,correction_due_at')
        .eq('organization_id', orgId).is('deleted_at', null);
      if (qErr) setError(qErr.message);
      else setRows((data ?? []) as ResultRow[]);
    })();
  }, [orgId]);

  async function decide(row: ResultRow, level: 'TECHNICAL' | 'FINAL', decision: 'ACCEPTER' | 'REFUSER') {
    if (!orgId) return;
    if (decision === 'REFUSER' && !comments[row.id]?.trim()) {
      setError('Motif obligatoire en cas de refus');
      return;
    }
    if (!confirmLabAction(`${level} — ${decision} ? Action auditée, non silencieuse.`)) return;
    const { error: iErr } = await labSchema().from('result_reviews').insert({
      organization_id: orgId, result_id: row.id, level, decision, comment: comments[row.id] || null, reviewer_id: userId,
    });
    if (iErr) { setError(iErr.message); return; }
    const next = level === 'TECHNICAL'
      ? (decision === 'ACCEPTER' ? 'TECHNICAL_REVIEW' : 'CORRECTION_REQUESTED')
      : (decision === 'ACCEPTER' ? 'APPROVED' : 'CORRECTION_REQUESTED');
    const req = await labSchema().from('client_requests').select('status').eq('id', row.request_id).maybeSingle();
    const current = req.data?.status as string | undefined;
    if (current && canTransition(current as never, next as never)) {
      await labSchema().from('client_requests').update({ status: next }).eq('id', row.request_id);
    } else if (current === 'AI_REVIEW' && level === 'TECHNICAL') {
      await labSchema().from('client_requests').update({ status: decision === 'ACCEPTER' ? 'TECHNICAL_REVIEW' : 'CORRECTION_REQUESTED' }).eq('id', row.request_id);
    } else if (level === 'FINAL' && decision === 'ACCEPTER') {
      await labSchema().from('client_requests').update({ status: 'APPROVED' }).eq('id', row.request_id);
    }
    if (decision === 'REFUSER') {
      const due = correctionDueAt(new Date(), 6);
      await labSchema().from('analysis_results').update({ correction_due_at: due.toISOString() }).eq('id', row.id);
    }
    const reviews = await labSchema().from('result_reviews').select('level,decision').eq('result_id', row.id);
    const tech = reviews.data?.find((r) => r.level === 'TECHNICAL')?.decision;
    const fin = reviews.data?.find((r) => r.level === 'FINAL')?.decision;
    if (tech && fin && shouldEmailSupplierOnDoubleRefuse(tech, fin)) {
      await labSchema().from('email_messages').insert({
        organization_id: orgId, template_key: 'result_correction', recipient: 'supplier',
        subject: `Correction required ${row.analysis_name}`, status: 'queued', provider: 'resend',
      });
      setMessage('Double refus : e-mail sous-traitant + délai 6 h');
    } else {
      setMessage(`${level} ${decision}`);
    }
  }

  return (
    <LabPage kicker="Étape 7" title="Triple contrôle" subtitle="Niveau 1 IA = aide uniquement. Tech puis Zineb. Double refus → e-mail + 6 h.">
      {message && <LabAlert>{message}</LabAlert>}
      {error && <LabAlert tone="err">{error}</LabAlert>}
      {rows.map((row) => (
        <LabCard key={row.id} className="space-y-2">
          <p className="font-medium">{row.analysis_name}</p>
          <p className="text-xs text-slate-500">{row.ai_summary ?? 'Pas encore d’avis IA'}</p>
          {row.correction_due_at && <p className="text-xs text-orange-600">Correction avant {new Date(row.correction_due_at).toLocaleString('fr-MA')}</p>}
          <Input placeholder="Motif si refus" value={comments[row.id] ?? ''} onChange={(e) => setComments((c) => ({ ...c, [row.id]: e.target.value }))} />
          <div className="flex flex-wrap gap-2">
            {can(role, 'results.review.technical') && (
              <>
                <Button type="button" onClick={() => void decide(row, 'TECHNICAL', 'ACCEPTER')}>Tech accepter</Button>
                <Button type="button" variant="destructive" onClick={() => void decide(row, 'TECHNICAL', 'REFUSER')}>Tech refuser</Button>
              </>
            )}
            {can(role, 'results.review.final') && (
              <>
                <Button type="button" onClick={() => void decide(row, 'FINAL', 'ACCEPTER')}>Zineb accepter</Button>
                <Button type="button" variant="destructive" onClick={() => void decide(row, 'FINAL', 'REFUSER')}>Zineb refuser</Button>
              </>
            )}
          </div>
        </LabCard>
      ))}
    </LabPage>
  );
}
