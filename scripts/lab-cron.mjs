/**
 * Queue due quote follow-ups and supplier deadline notices.
 * Does not send mail — flush with lab-email-worker.mjs.
 */
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createSupabaseServerClient } = require('../server/supabaseNodeClient.cjs');

function isFollowupDue(row, now) {
  if (!row.sent_at || row.followup_sent_at || !row.followup_due_at) return false;
  return new Date(row.followup_due_at).getTime() <= now.getTime();
}

function deadlineState(expected, actual, now) {
  const end = actual ? new Date(actual) : now;
  const lateMs = end.getTime() - new Date(expected).getTime();
  if (actual) return lateMs > 0 ? 'late' : 'ok';
  if (lateMs > 0) return 'late';
  const remaining = Math.ceil((new Date(expected).getTime() - now.getTime()) / 86_400_000);
  return remaining <= 2 ? 'due_soon' : 'ok';
}

export function pickDueFollowups(quotes, now = new Date()) {
  return (quotes || []).filter((q) => isFollowupDue(q, now));
}

export function pickDeadlineActions(rows, now = new Date()) {
  return (rows || []).flatMap((row) => {
    const state = deadlineState(row.expected_date, row.actual_date, now);
    if (state === 'due_soon' && !row.reminded_at) return [{ id: row.id, action: 'remind' }];
    if (state === 'late' && !row.late_notified_at) return [{ id: row.id, action: 'late' }];
    return [];
  });
}

export async function runLabCron({ dryRun = false } = {}) {
  const url = process.env.VITE_LAB_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { queued: 0, error: 'missing_supabase_admin' };
  const supabase = createSupabaseServerClient(url, key);
  const now = new Date();
  let queued = 0;

  const quotes = await supabase.schema('lab').from('quotes')
    .select('id,organization_id,quote_number,sent_at,followup_due_at,followup_sent_at,survey_token')
    .is('followup_sent_at', null)
    .not('followup_due_at', 'is', null)
    .limit(100);
  if (quotes.error) return { queued: 0, error: quotes.error.message };

  for (const quote of pickDueFollowups(quotes.data, now)) {
    if (!dryRun) {
      await supabase.schema('lab').from('email_messages').insert({
        organization_id: quote.organization_id,
        template_key: 'quote_followup',
        recipient: 'client',
        subject: `Relance devis ${quote.quote_number}`,
        body: `Avez-vous reçu le devis ${quote.quote_number} ? Sondage: /lab/quote-survey/${quote.survey_token ?? ''}`,
        status: 'queued',
        provider: 'resend',
      });
      await supabase.schema('lab').from('quotes').update({ followup_sent_at: now.toISOString() }).eq('id', quote.id);
    }
    queued += 1;
  }

  const deadlines = await supabase.schema('lab').from('supplier_deadlines')
    .select('id,organization_id,expected_date,actual_date,reminded_at,late_notified_at')
    .limit(200);
  if (deadlines.error) return { queued, error: deadlines.error.message };

  for (const action of pickDeadlineActions(deadlines.data, now)) {
    const row = deadlines.data.find((d) => d.id === action.id);
    if (!row) continue;
    if (!dryRun) {
      const late = action.action === 'late';
      await supabase.schema('lab').from('email_messages').insert({
        organization_id: row.organization_id,
        template_key: late ? 'supplier_late' : 'supplier_reminder',
        recipient: 'supplier',
        subject: late ? `Delay notice ${row.id.slice(0, 8)}` : `Reminder ${row.id.slice(0, 8)}`,
        body: `Deadline ${row.expected_date}`,
        status: 'queued',
        provider: 'resend',
      });
      await supabase.schema('lab').from('supplier_deadlines').update(
        late ? { late_notified_at: now.toISOString() } : { reminded_at: now.toISOString() },
      ).eq('id', row.id);
    }
    queued += 1;
  }

  const invoices = await supabase.schema('lab').from('client_invoices')
    .select('id,organization_id,invoice_number,status,amount_due')
    .in('status', ['IMPAYEE', 'EN_ATTENTE'])
    .limit(100);
  if (!invoices.error) {
    for (const inv of invoices.data || []) {
      if (!dryRun) {
        await supabase.schema('lab').from('email_messages').insert({
          organization_id: inv.organization_id,
          template_key: 'payment_reminder',
          recipient: 'client',
          subject: `Rappel paiement ${inv.invoice_number}`,
          body: `Impayé ${inv.amount_due ?? ''}`,
          status: 'queued',
          provider: 'resend',
        });
      }
      queued += 1;
    }
  }

  return { queued, dryRun };
}

const isMain = process.argv[1] && process.argv[1].endsWith('lab-cron.mjs');
if (isMain) {
  runLabCron({ dryRun: process.argv.includes('--dry-run') })
    .then((r) => {
      console.log(JSON.stringify(r));
      if (r.error) process.exit(1);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
