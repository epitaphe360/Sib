import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { followupDueAt, isFollowupDue } from '../lib/quoteFollowup';
import { canTransition } from '../lib/status';
import { LAB_ROUTES } from '../routes';
import { queueEmailPayload } from '../lib/emailTemplates';
import { can } from '../rbac';
import { confirmLabAction, LabAlert, LabEmpty, LabPage, LabTable, LabTh } from '../components/LabUi';

interface QuoteRow {
  id: string;
  quote_number: string;
  amount: number;
  currency: string;
  status: string;
  sent_at: string | null;
  followup_due_at: string | null;
  followup_sent_at: string | null;
  survey_token: string | null;
  request_id: string;
  validated_by: string | null;
}

export default function LabQuotesPage() {
  const { activeOrg, role, userId } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [followupDays, setFollowupDays] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    if (!orgId) return;
    const [quotes, settings] = await Promise.all([
      labSchema().from('quotes').select('id,quote_number,amount,currency,status,sent_at,followup_due_at,followup_sent_at,survey_token,request_id,validated_by')
        .eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(50),
      labSchema().from('settings').select('quote_followup_days').eq('organization_id', orgId).maybeSingle(),
    ]);
    if (quotes.error) setError(quotes.error.message);
    else setRows((quotes.data ?? []) as QuoteRow[]);
    if (settings.data?.quote_followup_days) setFollowupDays(Number(settings.data.quote_followup_days));
  }

  useEffect(() => { void load(); }, [orgId]);

  async function validateQuote(row: QuoteRow) {
    if (!orgId || !userId) return;
    if (!can(role, 'quotes.validate')) { setError('Seule Madame Zineb (validation) peut valider'); return; }
    if (!confirmLabAction(`Valider le devis ${row.quote_number} avant envoi ?`)) return;
    const { error: uErr } = await labSchema().from('quotes').update({
      status: 'validated',
      validated_by: userId,
    }).eq('id', row.id);
    if (uErr) { setError(uErr.message); return; }
    setMessage(`Devis ${row.quote_number} validé — prêt à envoyer`);
    await load();
  }

  async function sendQuote(row: QuoteRow) {
    if (!orgId) return;
    if (!row.validated_by && row.status !== 'validated') {
      setError('Validation Zineb requise avant envoi');
      return;
    }
    if (!confirmLabAction(`Envoyer le devis ${row.quote_number} au client ?`)) return;
    const sentAt = new Date();
    const due = followupDueAt(sentAt, followupDays);
    const { error: uErr } = await labSchema().from('quotes').update({
      status: 'sent',
      sent_at: sentAt.toISOString(),
      followup_due_at: due.toISOString(),
    }).eq('id', row.id);
    if (uErr) { setError(uErr.message); return; }
    await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'client_quote', 'client', {
      quote: row.quote_number,
      amount: String(row.amount),
    }));
    const req = await labSchema().from('client_requests').select('status').eq('id', row.request_id).maybeSingle();
    const current = req.data?.status as string | undefined;
    if (current && canTransition(current as never, 'CLIENT_QUOTE_SENT')) {
      await labSchema().from('client_requests').update({ status: 'CLIENT_QUOTE_SENT' }).eq('id', row.request_id);
    } else if (current && canTransition(current as never, 'WAITING_CLIENT_RESPONSE')) {
      await labSchema().from('client_requests').update({ status: 'WAITING_CLIENT_RESPONSE' }).eq('id', row.request_id);
    }
    setMessage(`Devis ${row.quote_number} mis en file d’envoi`);
    await load();
  }

  async function sendFollowup(row: QuoteRow) {
    if (!orgId) return;
    const { error: uErr } = await labSchema().from('quotes').update({
      followup_sent_at: new Date().toISOString(),
    }).eq('id', row.id);
    if (uErr) { setError(uErr.message); return; }
    await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'quote_followup', 'client', {
      quote: row.quote_number,
      link: `/lab/quote-survey/${row.survey_token ?? ''}`,
    }));
    setMessage(`Relance ${row.quote_number} (sondage /lab/quote-survey/${row.survey_token})`);
    await load();
  }

  return (
    <LabPage kicker="Étape 3–4" title="Devis" subtitle={`Relance auto après ${followupDays} j. Prix jamais modifié automatiquement.`}>
      {message && <LabAlert>{message}</LabAlert>}
      {error && <LabAlert tone="err">{error}</LabAlert>}
      <LabTable>
        <thead className="bg-[#f7f4ee] text-left text-slate-500">
            <tr>
              <LabTh>N°</LabTh>
              <LabTh>Montant</LabTh>
              <LabTh>Statut</LabTh>
              <LabTh></LabTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={LAB_ROUTES.ADMIN_QUOTE.replace(':id', row.id)}>{row.quote_number}</Link>
                </td>
                <td className="px-4 py-2">{row.amount} {row.currency}</td>
                <td className="px-4 py-2">{row.status}</td>
                <td className="px-4 py-2 space-x-2">
                  {row.status === 'draft' && (
                    <Button type="button" onClick={() => void validateQuote(row)}>Zineb valider</Button>
                  )}
                  {(row.status === 'validated' || row.validated_by) && row.status !== 'sent' && (
                    <Button type="button" onClick={() => void sendQuote(row)}>Envoyer</Button>
                  )}
                  {isFollowupDue({
                    sentAt: row.sent_at,
                    followupDueAt: row.followup_due_at,
                    followupSentAt: row.followup_sent_at,
                  }) && (
                    <Button type="button" variant="secondary" onClick={() => void sendFollowup(row)}>Relancer</Button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4}><LabEmpty>Aucun devis</LabEmpty></td></tr>}
          </tbody>
      </LabTable>
    </LabPage>
  );
}
