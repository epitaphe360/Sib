import { type ButtonHTMLAttributes, type CSSProperties, type FormEvent, type ReactNode, useState } from 'react';
import { clsx } from 'clsx';
import { LAB_THEME } from '../theme/tokens';

export function LabPublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="lab-root lab-public">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-full border"
              style={{ borderColor: LAB_THEME.gold, background: 'rgba(16,185,129,0.15)' }}
              aria-hidden
            >
              <span className="text-lg">⚙</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{LAB_THEME.brand}</p>
              <p className="lab-display text-sm text-white/80">Laboratoire</p>
            </div>
          </div>
          <p className="hidden text-right text-xs italic text-white/50 sm:block">{LAB_THEME.slogan}</p>
        </header>
        <div className="lab-gold-line my-6" />
        {children}
      </div>
    </div>
  );
}

export function LabGlass({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`lab-glass rounded-2xl ${className}`}>{children}</div>;
}

export function LabBtn({
  children,
  type = 'button',
  disabled,
  tone = 'gold',
  onClick,
  className = '',
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  tone?: 'gold' | 'cyan' | 'ghost' | 'danger';
  onClick?: () => void;
  className?: string;
}) {
  const styles: Record<string, CSSProperties> = {
    gold: { background: LAB_THEME.gold, color: '#071422' },
    cyan: { background: LAB_THEME.cyan, color: '#071422' },
    ghost: { background: 'transparent', color: LAB_THEME.ink, border: '1px solid rgba(255,255,255,0.2)' },
    danger: { background: '#be123c', color: '#fff' },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40 ${className}`}
      style={styles[tone]}
    >
      {children}
    </button>
  );
}

export function LabField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/55">{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-300">{error}</span>}
    </label>
  );
}

export function labInputClass(extra = '') {
  return `h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-300 ${extra}`;
}

export function LabConfirm({
  title,
  body,
  confirmLabel = 'Confirmer',
  tone = 'gold',
  onConfirm,
  children,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  tone?: 'gold' | 'danger';
  onConfirm: () => void | Promise<void>;
  children: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {children(() => setOpen(true))}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form className="lab-glass w-full max-w-md rounded-2xl p-6 space-y-4" onSubmit={submit}>
            <h3 className="lab-display text-2xl text-white">{title}</h3>
            <p className="text-sm text-white/70">{body}</p>
            <div className="flex justify-end gap-2">
              <LabBtn tone="ghost" onClick={() => setOpen(false)}>Annuler</LabBtn>
              <LabBtn type="submit" tone={tone === 'danger' ? 'danger' : 'gold'} disabled={busy}>
                {busy ? '…' : confirmLabel}
              </LabBtn>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export function confirmLabAction(message: string): boolean {
  return window.confirm(message);
}

export function LabPage({
  kicker,
  title,
  subtitle,
  actions,
  children,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {kicker && (
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#c9a45c]">{kicker}</p>
          )}
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#071422]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function LabCard({
  children,
  className,
  padding = 'md',
}: {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md';
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[#e8e2d4] bg-white/90 shadow-[0_1px_0_rgba(201,164,92,0.18),0_18px_40px_-28px_rgba(7,20,34,0.45)]',
        padding === 'md' && 'p-5',
        padding === 'sm' && 'p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LabKpi({
  label,
  value,
  hint,
  tone = 'navy',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'navy' | 'gold' | 'cyan' | 'rose';
}) {
  const tones = {
    navy: 'from-[#071422] to-[#0b1f3a] text-white',
    gold: 'from-[#c9a45c] to-[#e8d5a3] text-[#071422]',
    cyan: 'from-[#0b1f3a] to-[#12324f] text-cyan-100',
    rose: 'from-[#3a1520] to-[#5a2030] text-rose-100',
  };
  return (
    <div className={clsx('rounded-2xl bg-gradient-to-br p-4 shadow-sm', tones[tone])}>
      <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
    </div>
  );
}

export function LabBadge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'slate' | 'gold' | 'cyan' | 'green' | 'amber' | 'rose' | 'fr' | 'en';
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    gold: 'bg-[#f4ead0] text-[#7a5a16]',
    cyan: 'bg-cyan-50 text-cyan-800',
    green: 'bg-emerald-50 text-emerald-800',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-800',
    fr: 'bg-blue-50 text-blue-800',
    en: 'bg-indigo-50 text-indigo-800',
  };
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function LabTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e8e2d4] bg-white">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function LabTh({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
      {children}
    </th>
  );
}

export function LabEmpty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-400">{children}</p>;
}

export function LabAlert({
  tone = 'ok',
  children,
}: {
  tone?: 'ok' | 'err' | 'warn';
  children: ReactNode;
}) {
  const tones = {
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    err: 'border-rose-200 bg-rose-50 text-rose-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
  };
  return <p className={clsx('rounded-xl border px-3 py-2 text-sm', tones[tone])}>{children}</p>;
}

export function LabGhostButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex h-10 items-center justify-center rounded-xl border border-[#e8e2d4] bg-white px-4 text-sm text-[#071422] transition hover:border-[#c9a45c]',
        props.className,
      )}
    />
  );
}
