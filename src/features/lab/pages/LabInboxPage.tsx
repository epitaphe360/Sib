import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { classifyInboundEmail } from '../lib/emailQueue';
import { extractRequestDraftFromEmail } from '../lib/emailToRequest';
import { LabAlert, LabCard, LabEmpty, LabPage, LabTable, LabTh } from '../components/LabUi';

export default function LabInboxPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; message_id: string; classification: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm({ defaultValues: { message_id: '', subject: '', body: '' } });

  async function load() {
    if (!orgId) return;
    const { data } = await labSchema().from('processed_emails')
      .select('id,message_id,classification').eq('organization_id', orgId).order('processed_at', { ascending: false }).limit(50);
    setRows((data ?? []) as typeof rows);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <LabPage
      kicker="Étape 1 · secours"
      title="E-mails entrants"
      subtitle="Classification BDC / devis / rapport. Un e-mail libre devient une fiche structurée — jamais une source opérationnelle brute."
    >
      {message && <LabAlert>{message}</LabAlert>}
      {error && <LabAlert tone="err">{error}</LabAlert>}
      <LabCard>
        <form className="space-y-2" onSubmit={form.handleSubmit(async (v) => {
          if (!orgId) return;
          const classification = classifyInboundEmail(v.subject, v.body);
          const { error: iErr } = await labSchema().from('processed_emails').insert({
            organization_id: orgId, message_id: v.message_id, classification,
          });
          if (iErr) { setError(iErr.message); return; }
          form.reset();
          await load();
        })}>
          <Input placeholder="message_id" {...form.register('message_id', { required: true })} />
          <Input placeholder="Sujet" {...form.register('subject')} />
          <Input placeholder="Extrait" {...form.register('body')} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Classer</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                if (!orgId) return;
                const v = form.getValues();
                const draft = extractRequestDraftFromEmail(v.subject, v.body);
                if (draft.missing.length) {
                  setMessage(`Champs manquants : ${draft.missing.join(', ')}. Compléter avant traitement aval.`);
                }
                const { data, error: rpcError } = await labSchema().rpc('submit_public_request', {
                  p_org_slug: 'elitech',
                  p_company_name: draft.company_name || 'À compléter',
                  p_contact_name: draft.contact_name || 'À compléter',
                  p_email: draft.email || 'incomplet@elitech.local',
                  p_phone: draft.phone || '600000000',
                  p_country_code: '+212',
                  p_product_name: draft.product_name || 'À compléter',
                  p_matrix: null,
                  p_sample_type: null,
                  p_sample_count: 1,
                  p_urgency: null,
                  p_deadline: null,
                  p_accreditation_required: false,
                  p_notes: draft.notes,
                  p_analyses: draft.analyses ? draft.analyses.split(/[,;]/).map((s) => s.trim()) : ['À qualifier'],
                });
                if (rpcError) { setError(rpcError.message); return; }
                await labSchema().from('client_requests').update({ origin: 'EMAIL' }).eq('id', data);
                setMessage(`Fiche structurée créée (${data}). Manquants : ${draft.missing.join(', ') || 'aucun'}.`);
              }}
            >
              Créer fiche structurée
            </Button>
          </div>
        </form>
      </LabCard>
      <LabTable>
        <thead className="bg-[#f7f4ee]">
          <tr><LabTh>Classe</LabTh><LabTh>Message</LabTh></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#f0eadb]">
              <td className="px-4 py-2">{r.classification}</td>
              <td className="px-4 py-2 text-slate-500">{r.message_id}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={2}><LabEmpty>Aucun e-mail classé</LabEmpty></td></tr>}
        </tbody>
      </LabTable>
    </LabPage>
  );
}
