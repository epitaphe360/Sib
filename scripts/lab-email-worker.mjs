/**
 * Flush queued lab.email_messages.
 * Prefers RESEND_API_KEY, falls back to SMTP_PASS/nodemailer.
 * Service role stays server-side only.
 */
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createSupabaseServerClient } = require('../server/supabaseNodeClient.cjs');

const url = process.env.VITE_LAB_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const limit = Number(process.env.LAB_EMAIL_BATCH || 25);

export function pickQueued(rows, max = 25) {
  return (rows || []).filter((r) => r.status === 'queued' && r.recipient && r.subject).slice(0, max);
}

async function sendResend(from, row) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [row.recipient],
      subject: row.subject,
      text: row.body || row.subject,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function sendSmtp(from, row) {
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from,
    to: row.recipient,
    subject: row.subject,
    text: row.body || row.subject,
  });
}

export async function flushLabEmails({ dryRun = false } = {}) {
  if (!url || !key) return { flushed: 0, error: 'missing_supabase_admin' };
  const supabase = createSupabaseServerClient(url, key);
  const { data, error } = await supabase.schema('lab')
    .from('email_messages')
    .select('id,recipient,subject,body,status')
    .eq('status', 'queued')
    .limit(limit);
  if (error) return { flushed: 0, error: error.message };
  const rows = pickQueued(data, limit);
  const from = process.env.LAB_FROM_EMAIL || 'zineb@laboratoire.ma';
  let flushed = 0;
  for (const row of rows) {
    try {
      if (!dryRun) {
        if (process.env.RESEND_API_KEY) await sendResend(from, row);
        else if (process.env.SMTP_PASS) await sendSmtp(from, row);
        else throw new Error('no_email_provider');
        await supabase.schema('lab').from('email_messages').update({ status: 'sent' }).eq('id', row.id);
      }
      flushed += 1;
    } catch (err) {
      if (!dryRun) {
        await supabase.schema('lab').from('email_messages').update({ status: 'failed' }).eq('id', row.id);
      }
      console.error(row.id, err instanceof Error ? err.message : err);
    }
  }
  return { flushed, dryRun };
}

const isMain = process.argv[1] && process.argv[1].endsWith('lab-email-worker.mjs');
if (isMain) {
  flushLabEmails({ dryRun: process.argv.includes('--dry-run') })
    .then((r) => {
      console.log(JSON.stringify(r));
      if (r.error) process.exit(1);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
