import { useState } from 'react';
import { LabBtn, LabField, labControlClass } from './LabUi';
import { identifyMissing, emptyDraft, type QualificationDraft } from '../lib/qualificationDraft';
import { labSchema } from '../services/labClient';

function asDraft(value: unknown): Partial<QualificationDraft> {
  return (value && typeof value === 'object') ? value as Partial<QualificationDraft> : {};
}

export function LabQualificationRecap({
  requestId,
  qualification,
  iceStatus,
  canEdit,
  onSaved,
}: {
  requestId: string;
  qualification?: Record<string, unknown> | null;
  iceStatus?: string | null;
  canEdit: boolean;
  onSaved?: () => void;
}) {
  const q = asDraft(qualification);
  const [ice, setIce] = useState(String(q.ice ?? ''));
  const [analyses, setAnalyses] = useState(String(q.analyses_souhaitees ?? ''));
  const [message, setMessage] = useState<string | null>(null);
  const gaps = identifyMissing({
    ...emptyDraft(),
    ...q,
    ice,
    analyses_souhaitees: analyses,
  } as QualificationDraft);

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-sm text-[#0B1F33] sm:grid-cols-2">
        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Type client</dt><dd>{String(q.type_client ?? '—')}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">ICE</dt><dd>{ice || iceStatus || 'à compléter avant facturation'}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Échantillon</dt><dd>{String(q.produit_exact || q.nom_commercial || '—')} · {String(q.type_echantillon || '')}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Objectif</dt><dd>{String(q.objectif_analytique || '—')}</dd></div>
        <div className="sm:col-span-2"><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Analyses citées</dt><dd>{q.analyses_inconnues ? 'À qualifier (client ne sait pas)' : (analyses || '—')}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Prélèvement</dt><dd>{String(q.prelevement_par || '—')}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">Délai</dt><dd>{String(q.urgence || '—')} {q.date_souhaitee ? `· ${q.date_souhaitee}` : ''}</dd></div>
      </dl>
      {gaps.filter((g) => g.severity !== 'optional').length > 0 && (
        <ul className="list-disc pl-5 text-sm text-[#6b4e0b]">
          {gaps.filter((g) => g.severity !== 'optional').map((g) => <li key={g.code}>{g.label}</li>)}
        </ul>
      )}
      {canEdit && (
        <div className="space-y-3 rounded-xl border border-[#c9bea8] bg-white p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b4e0b]">Compléter avant devis</p>
          <LabField label="ICE" tone="light">
            <input className={labControlClass()} value={ice} onChange={(e) => setIce(e.target.value)} />
          </LabField>
          <LabField label="Analyses (validation laboratoire)" tone="light">
            <input className={labControlClass()} value={analyses} onChange={(e) => setAnalyses(e.target.value)} />
          </LabField>
          <LabBtn
            tone="navy"
            onClick={async () => {
              const next = { ...q, ice, analyses_souhaitees: analyses, analyses_inconnues: analyses.trim().length < 2 };
              const { error } = await labSchema().from('client_requests').update({
                qualification: next,
                ice_status: ice.trim() ? 'FOURNI' : 'A_COMPLETER_AVANT_FACTURATION',
              }).eq('id', requestId);
              setMessage(error ? error.message : 'Fiche mise à jour. La validation technique reste humaine.');
              onSaved?.();
            }}
          >
            Enregistrer les corrections
          </LabBtn>
          {message && <p className="text-sm text-emerald-800">{message}</p>}
        </div>
      )}
    </div>
  );
}
