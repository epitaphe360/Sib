import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { pickTemplateKind, reportReadiness } from '../lib/reportReadiness';
import { canTransition } from '../lib/status';
import { buildLabReportPdf, downloadBlob } from '../lib/reportPdf';
import { queueEmailPayload } from '../lib/emailTemplates';

interface RequestRow {
  id: string;
  dossier_number: string;
  company_name: string;
  analysis_kind: 'PHYSICO_CHIMIQUE' | 'MICROBIOLOGIQUE' | 'MIXTE' | null;
  status: string;
}

export default function LabReportsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [reports, setReports] = useState<{ id: string; request_id: string; sent_at: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    if (!orgId) return;
    const [req, rep] = await Promise.all([
      labSchema().from('client_requests').select('id,dossier_number,company_name,analysis_kind,status').eq('organization_id', orgId).is('deleted_at', null),
      labSchema().from('reports').select('id,request_id,sent_at').eq('organization_id', orgId).is('deleted_at', null),
    ]);
    setRows((req.data ?? []) as RequestRow[]);
    setReports((rep.data ?? []) as typeof reports);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold text-[#071422]">Rapports</h1>
      <p className="text-sm text-slate-500">Étape 8 — gabarit selon le type d’analyse. PDF versionné.</p>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows.filter((r) => ['APPROVED', 'REPORT_GENERATION', 'REPORT_SENT'].includes(r.status)).map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">{r.dossier_number} · {r.company_name}</p>
            <p className="text-xs text-slate-500">Gabarit {pickTemplateKind(r.analysis_kind)}</p>
          </div>
          <Button type="button" onClick={async () => {
            if (!orgId) return;
            const samples = await labSchema().from('samples').select('code').eq('request_id', r.id);
            const results = await labSchema().from('analysis_results').select('analysis_name,value,unit,method').eq('request_id', r.id);
            const reviews = await labSchema().from('result_reviews').select('decision,level').eq('organization_id', orgId);
            const check = reportReadiness({
              client: !!r.company_name,
              sample: (samples.data ?? []).length > 0,
              sampleCode: (samples.data ?? []).every((s) => !!s.code),
              methods: (results.data ?? []).every((x) => !!x.method),
              results: (results.data ?? []).length > 0,
              units: (results.data ?? []).every((x) => !!x.unit),
              dates: true,
              validations: (reviews.data ?? []).some((v) => v.level === 'FINAL' && v.decision === 'ACCEPTER'),
            });
            if (!check.ok) { setError(`Mentions manquantes: ${check.missing.join(', ')}`); return; }
            const tpl = await labSchema().from('report_templates').select('id')
              .eq('organization_id', orgId).eq('analysis_kind', pickTemplateKind(r.analysis_kind)).eq('is_active', true).maybeSingle();
            const blob = buildLabReportPdf({
              kind: pickTemplateKind(r.analysis_kind),
              dossier: r.dossier_number,
              client: r.company_name,
              sampleCodes: (samples.data ?? []).map((s) => s.code),
              results: (results.data ?? []).map((x) => ({
                analysis_name: x.analysis_name,
                value: x.value,
                unit: x.unit,
                method: x.method,
              })),
            });
            downloadBlob(blob, `${r.dossier_number}.pdf`);
            const { data, error: iErr } = await labSchema().from('reports').insert({
              organization_id: orgId, request_id: r.id, template_id: tpl.data?.id ?? null,
              delivery_status: 'stored', storage_path: `${r.dossier_number}.pdf`,
            }).select('id').maybeSingle();
            if (iErr || !data) { setError(iErr?.message ?? 'Génération impossible'); return; }
            await labSchema().from('client_requests').update({ status: 'REPORT_GENERATION' }).eq('id', r.id);
            setMessage('PDF généré et rapport stocké au portail');
            await load();
          }}>Générer</Button>
          <Button type="button" variant="secondary" onClick={async () => {
            if (!orgId) return;
            const existing = reports.find((rep) => rep.request_id === r.id);
            if (!existing) { setError('Générer d’abord'); return; }
            await labSchema().from('reports').update({
              sent_at: new Date().toISOString(), recipient: r.company_name, delivery_status: 'queued',
            }).eq('id', existing.id);
            await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'report_ready', r.company_name, {
              dossier: r.dossier_number,
            }));
            if (canTransition(r.status as never, 'REPORT_SENT')) {
              await labSchema().from('client_requests').update({ status: 'REPORT_SENT' }).eq('id', r.id);
            }
            setMessage('Notification d’envoi en file');
            await load();
          }}>Notifier le client</Button>
        </div>
      ))}
    </div>
  );
}
