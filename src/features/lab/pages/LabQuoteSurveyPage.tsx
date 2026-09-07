import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { labSchema } from '../services/labClient';
import { quoteSurveySchema } from '../schemas';

export default function LabQuoteSurveyPage() {
  const { token } = useParams();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(quoteSurveySchema),
    mode: 'onChange',
    defaultValues: { received: true, priceOk: true, delayOk: true, priceTooHigh: false },
  });

  if (done) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f4ee] text-emerald-800">Merci, votre retour est enregistré.</div>;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f4ee] px-4">
      <form
        className="w-full max-w-md space-y-3 rounded-3xl border border-[#e8e2d4] bg-white p-7 shadow-xl"
        onSubmit={form.handleSubmit(async (v) => {
          if (!token) return;
          const { error: rpcErr } = await labSchema().rpc('submit_quote_survey', {
            p_token: token,
            p_received: v.received,
            p_price_ok: v.priceOk,
            p_delay_ok: v.delayOk,
            p_price_too_high: v.priceTooHigh,
            p_comment: v.comment || null,
          });
          if (rpcErr) { setError(rpcErr.message); return; }
          setDone(true);
        })}
      >
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9a45c]">Étape 4</p>
        <h1 className="font-serif text-2xl text-[#071422]">Retour devis</h1>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('received')} /> Avez-vous reçu le devis ?</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('priceOk')} /> Prix satisfaisant</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('delayOk')} /> Délai acceptable</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('priceTooHigh')} /> Prix trop élevé</label>
        <textarea className="w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="Commentaire" {...form.register('comment')} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit">Envoyer</Button>
      </form>
    </div>
  );
}
