import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { deadlinePenalty, deadlineState } from '../lib/deadlines';
import { queueEmailPayload } from '../lib/emailTemplates';

interface Row {
  id: string;
  request_id: string;
  supplier_id: string;
  expected_date: string;
  actual_date: string | null;
  reminded_at: string | null;
  late_notified_at: string | null;
}

export default function LabDeadlinesPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<Row[]>([]);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    if (!orgId) return;
    const [dl, settings] = await Promise.all([
      labSchema().from('supplier_deadlines').select('id,request_id,supplier_id,expected_date,actual_date,reminded_at,late_notified_at').eq('organization_id', orgId),
      labSchema().from('settings').select('penalty_percent_per_day').eq('organization_id', orgId).maybeSingle(),
    ]);
    if (dl.error) setError(dl.error.message);
    else setRows((dl.data ?? []) as Row[]);
    if (settings.data?.penalty_percent_per_day != null) setRate(Number(settings.data.penalty_percent_per_day));
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Délais sous-traitants</h1>
      <p className="text-xs text-slate-500">Pénalité configurable : {rate} % / jour. Mention contractuelle dans les e-mails.</p>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <table className="min-w-full text-sm rounded-xl border bg-white">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="px-4 py-2">Attendu</th><th className="px-4 py-2">État</th><th className="px-4 py-2">Pénalité est.</th><th className="px-4 py-2"></th></tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const state = deadlineState(row.expected_date, row.actual_date);
            const pen = deadlinePenalty(1000, row.expected_date, row.actual_date, rate);
            return (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{row.expected_date}</td>
                <td className="px-4 py-2">{state}</td>
                <td className="px-4 py-2">{pen.days} j · {pen.amount}</td>
                <td className="px-4 py-2">
                  {state === 'due_soon' && !row.reminded_at && (
                    <Button type="button" onClick={async () => {
                      if (!orgId) return;
                      await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'supplier_reminder', 'supplier', {
                        po: row.id.slice(0, 8), date: row.expected_date, rate: String(rate),
                      }));
                      await labSchema().from('supplier_deadlines').update({ reminded_at: new Date().toISOString() }).eq('id', row.id);
                      setMessage('Rappel envoyé en file');
                      await load();
                    }}>Rappel</Button>
                  )}
                  {state === 'late' && !row.late_notified_at && (
                    <Button type="button" variant="destructive" onClick={async () => {
                      if (!orgId) return;
                      await labSchema().from('email_messages').insert(queueEmailPayload(orgId, 'supplier_late', 'supplier', {
                        po: row.id.slice(0, 8), date: row.expected_date, rate: String(rate),
                      }));
                      await labSchema().from('supplier_deadlines').update({
                        late_notified_at: new Date().toISOString(),
                        delay_days: pen.days,
                        penalty_rate: rate,
                        penalty_amount: pen.amount,
                      }).eq('id', row.id);
                      setMessage('Retard notifié');
                      await load();
                    }}>Notifier retard</Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
