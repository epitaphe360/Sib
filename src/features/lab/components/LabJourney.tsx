import { Link } from 'react-router-dom';
import { LAB_JOURNEY, journeyState, journeyStepForStatus } from '../lib/journey';
import type { DossierStatus } from '../types';
import { LAB_THEME } from '../theme/tokens';

export function LabJourneyGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {LAB_JOURNEY.map((step) => (
        <article key={step.n} className="lab-glass lab-step-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold"
              style={{ background: LAB_THEME.goldMuted, color: LAB_THEME.goldSoft }}
            >
              {String(step.n).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-300">{step.actor}</span>
          </div>
          <h3 className="lab-display mt-3 text-lg leading-tight text-white">{step.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-white/65">{step.summary}</p>
        </article>
      ))}
    </div>
  );
}

export function LabJourneyRail({
  status,
  hrefForStep,
  tone = 'dark',
}: {
  status?: DossierStatus | string | null;
  hrefForStep?: (n: number) => string | undefined;
  tone?: 'dark' | 'light';
}) {
  const current = journeyStepForStatus(status);
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1">
      {LAB_JOURNEY.map((step) => {
        const state = journeyState(step.n, current);
        const href = hrefForStep?.(step.n);
        const cls = tone === 'light'
          ? state === 'current'
            ? 'border-cyan-600 bg-cyan-50 text-cyan-800'
            : state === 'done'
              ? 'border-amber-400 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-white text-slate-500'
          : state === 'current'
            ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
            : state === 'done'
              ? 'border-amber-300/40 bg-amber-300/10 text-amber-100'
              : 'border-white/10 bg-white/5 text-white/50';
        const inner = (
          <>
            <span className="text-[10px] font-semibold">{String(step.n).padStart(2, '0')}</span>
            <span className="hidden max-w-[9rem] truncate sm:inline">{step.title}</span>
          </>
        );
        return (
          <li key={step.n}>
            {href ? (
              <Link to={href} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${cls}`}>
                {inner}
              </Link>
            ) : (
              <span className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${cls}`}>{inner}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function LabDossierTrack({ step }: { step: number }) {
  return (
    <div className="flex gap-1">
      {LAB_JOURNEY.map((s) => {
        const state = journeyState(s.n, step);
        return (
          <span
            key={s.n}
            title={`${String(s.n).padStart(2, '0')} ${s.title}`}
            className={`h-1.5 flex-1 rounded-full ${
              state === 'current' ? 'bg-cyan-500' : state === 'done' ? 'bg-amber-400' : 'bg-slate-200'
            }`}
          />
        );
      })}
    </div>
  );
}
