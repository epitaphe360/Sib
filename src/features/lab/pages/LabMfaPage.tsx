import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getLabClient, labSchema } from '../services/labClient';
import { useLabSessionStore } from '../store/labSessionStore';

export default function LabMfaPage() {
  const userId = useLabSessionStore((s) => s.userId);
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <div className="max-w-md space-y-3 rounded-xl border bg-white p-5">
      <h1 className="text-xl font-semibold text-[#0b1f3a]">MFA administrateur</h1>
      <p className="text-sm text-slate-500">Enrollment TOTP Supabase. La clé service n’est jamais utilisée ici.</p>
      <Button type="button" onClick={async () => {
        let auth;
        try { auth = getLabClient(); } catch { setError('Supabase indisponible'); return; }
        const { data, error: e } = await auth.auth.mfa.enroll({ factorType: 'totp' });
        if (e || !data) { setError(e?.message ?? 'Enrollment impossible'); return; }
        setFactorId(data.id);
        setQr(data.totp.qr_code);
      }}>Générer QR</Button>
      {qr && <img src={qr} alt="QR MFA" className="h-40 w-40" />}
      {factorId && (
        <form className="space-y-2" onSubmit={async (e) => {
          e.preventDefault();
          if (!factorId) return;
          const auth = getLabClient();
          const challenge = await auth.auth.mfa.challenge({ factorId });
          if (challenge.error) { setError(challenge.error.message); return; }
          const { error: vErr } = await auth.auth.mfa.verify({
            factorId,
            challengeId: challenge.data.id,
            code,
          });
          if (vErr) { setError(vErr.message); return; }
          if (userId) await labSchema().from('profiles').update({ mfa_ready: true }).eq('id', userId);
          setOk(true);
        }}>
          <Input inputMode="numeric" placeholder="Code à 6 chiffres" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Activer</Button>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-700">MFA activé</p>}
    </div>
  );
}
