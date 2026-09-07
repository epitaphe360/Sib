import { Link } from 'react-router-dom';
import { LAB_JOURNEY, journeyState, journeyStepForStatus } from '../lib/journey';
import {
  LAB_CASE_PHASES,
  canOpenPhase,
  dossierPhaseForStatus,
  phaseRailState,
} from '../lib/dossierPhases';
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
          <p className="mt-2 text-xs leading-relaxed text-white/80">{step.summary}</p>
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
    <ol className="lab-journey-rail">
      {LAB_JOURNEY.map((step) => {
        const state = journeyState(step.n, current);
        const href = hrefForStep?.(step.n);
        const cls = tone === 'light'
          ? state === 'current'
            ? 'border-[#0e5f73] bg-cyan-50 text-[#0e5f73]'
            : state === 'done'
              ? 'border-[#d4af37] bg-[#f4ead0] text-[#6b4e0b]'
              : 'border-[#c9bea8] bg-white text-[#0B1F33]'
          : state === 'current'
            ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
            : state === 'done'
              ? 'border-amber-300/50 bg-amber-300/15 text-amber-100'
              : 'border-white/20 bg-white/10 text-white/80';
        const inner = (
          <>
            <span className="text-[11px] font-bold tabular-nums">{String(step.n).padStart(2, '0')}</span>
            <span className="max-w-[7.5rem] truncate sm:max-w-[11rem]">{tone === 'light' ? step.short : step.title}</span>
          </>
        );
        return (
          <li key={step.n} className="shrink-0">
            {href ? (
              <Link to={href} className={`flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${cls}`}>
                {inner}
              </Link>
            ) : (
              <span className={`flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${cls}`}>{inner}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** 10-phase dossier rail. Portail + dashboard are not case states. */
export function LabCaseRail({
  status,
  viewPhase,
  onOpen,
}: {
  status?: DossierStatus | string | null;
  viewPhase?: number;
  onOpen?: (phase: number) => void;
}) {
  const current = dossierPhaseForStatus(status);
  const viewing = viewPhase ?? current;
  return (
    <ol className="lab-case-rail" aria-label="Phases du dossier">
      {LAB_CASE_PHASES.map((phase) => {
        const state = phaseRailState(phase.n, current);
        const open = canOpenPhase(phase.n, current);
        const active = viewing === phase.n;
        return (
          <li key={phase.n} className="lab-case-rail-item">
            <button
              type="button"
              disabled={!open}
              aria-current={state === 'current' ? 'step' : undefined}
              aria-label={`${phase.n}. ${phase.title}${state === 'locked' ? ' (verrouillée)' : ''}`}
              onClick={() => open && onOpen?.(phase.n)}
              className={`lab-case-dot lab-case-dot-${state}${active ? ' is-viewing' : ''}`}
            >
              {state === 'done' ? '✓' : String(phase.n)}
            </button>
            {(state === 'current' || active) && (
              <span className="lab-case-dot-label">{phase.short}</span>
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
