import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { settingsSchema } from '../schemas';

export default function LabSettingsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [margin, setMargin] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const form = useForm({ resolver: zodResolver(settingsSchema), mode: 'onChange' });

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const [set, rule] = await Promise.all([
        labSchema().from('settings').select('*').eq('organization_id', orgId).maybeSingle(),
        labSchema().from('pricing_rules').select('margin_percent').eq('organization_id', orgId).eq('is_active', true).maybeSingle(),
      ]);
      if (set.data) {
        form.reset({
          penalty_percent_per_day: Number(set.data.penalty_percent_per_day),
          quote_followup_days: Number(set.data.quote_followup_days),
          document_retention_days: Number(set.data.document_retention_days),
          sample_code_pattern: set.data.sample_code_pattern,
          correction_hours: Number(set.data.correction_hours ?? 6),
        });
      }
      if (rule.data?.margin_percent != null) setMargin(Number(rule.data.margin_percent));
    })();
  }, [orgId]);

  return (
    <form className="max-w-lg space-y-3 rounded-xl border border-slate-200 bg-white p-5" onSubmit={form.handleSubmit(async (v) => {
      if (!orgId) return;
      const { error: uErr } = await labSchema().from('settings').update(v).eq('organization_id', orgId);
      if (uErr) { setError(uErr.message); return; }
      await labSchema().from('pricing_rules').update({ margin_percent: margin }).eq('organization_id', orgId).eq('is_active', true);
      setOk(true);
    })}>
      <h1 className="text-xl font-semibold text-[#0b1f3a]">Réglages labo</h1>
      <label className="text-sm">Marge % <Input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} /></label>
      <label className="text-sm">Pénalité % / jour <Input type="number" step="0.1" {...form.register('penalty_percent_per_day')} /></label>
      <label className="text-sm">Relance devis (j) <Input type="number" {...form.register('quote_followup_days')} /></label>
      <label className="text-sm">Conservation docs (j) <Input type="number" {...form.register('document_retention_days')} /></label>
      <label className="text-sm">Pattern code échantillon <Input {...form.register('sample_code_pattern')} /></label>
      <label className="text-sm">Délai correction (h) <Input type="number" {...form.register('correction_hours')} /></label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-700">Enregistré</p>}
      <Button type="submit" disabled={!form.formState.isValid}>Sauver</Button>
    </form>
  );
}
