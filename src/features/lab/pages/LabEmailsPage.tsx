import { useEffect, useState } from 'react';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { EMAIL_TEMPLATE_KEYS } from '../lib/emailTemplates';

export default function LabEmailsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<{ id: string; template_key: string; subject: string; status: string; recipient: string }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    void labSchema().from('email_messages').select('id,template_key,subject,status,recipient')
      .eq('organization_id', orgId).order('created_at', { ascending: false }).limit(80)
      .then(({ data }) => setRows((data ?? []) as typeof rows));
  }, [orgId]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">File e-mails</h1>
      <p className="text-xs text-slate-500">Templates : {EMAIL_TEMPLATE_KEYS.join(', ')}. Envoi serveur : npm run lab:flush-emails ou POST /api/lab/flush-emails.</p>
      <ul className="rounded-xl border bg-white divide-y text-sm">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-2">{r.status} · {r.template_key} · {r.subject} → {r.recipient}</li>
        ))}
      </ul>
    </div>
  );
}
