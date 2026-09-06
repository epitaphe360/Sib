import { type ButtonHTMLAttributes, type CSSProperties, type FormEvent, type ReactNode, useState } from 'react';
import { clsx } from 'clsx';
import { LAB_THEME } from '../theme/tokens';

export function LabPublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="lab-root lab-public">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
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
              <p className="lab-display text-sm text-white">Laboratoire</p>
            </div>
          </div>
          <p className="hidden text-right text-xs italic text-white/75 sm:block">{LAB_THEME.slogan}</p>
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
  tone?: 'gold' | 'cyan' | 'ghost' | 'navy' | 'danger';
  onClick?: () => void;
  className?: string;
}) {
  const styles: Record<string, CSSProperties> = {
    gold: { background: LAB_THEME.gold, color: LAB_THEME.navy },
    cyan: { background: LAB_THEME.cyan, color: LAB_THEME.navy },
    navy: { background: LAB_THEME.navyMid, color: '#fff' },
    ghost: { background: 'transparent', color: LAB_THEME.inkOnDark, border: '1px solid rgba(255,255,255,0.35)' },
    danger: { background: LAB_THEME.rose, color: '#fff' },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-40 sm:w-auto ${className}`}
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
  tone = 'dark',
}: {
  label: string;
  error?: string;
  children: ReactNode;
  tone?: 'dark' | 'light';
}) {
  return (
    <label className="block space-y-1.5">
      <span
        className={clsx(
          'block text-[11px] font-semibold uppercase tracking-[0.16em]',
          tone === 'light' ? 'text-[#0B1F33]' : 'text-white/80',
        )}
      >
        {label}
      </span>
      {children}
      {error && (
        <span className={clsx('block text-xs font-medium', tone === 'light' ? 'text-red-700' : 'text-rose-300')}>
          {error}
        </span>
      )}
    </label>
  );
}

export function labInputClass(extra = '') {
  return `h-11 w-full rounded-lg border border-white/35 bg-white/10 px-3 text-sm text-white placeholder:text-white/55 outline-none focus:border-cyan-300 ${extra}`;
}

export function labControlClass(extra = '') {
  return `h-11 w-full rounded-lg border border-[#8a7d68] bg-white px-3 text-sm text-[#0B1F33] placeholder:text-[#5c6b7d] outline-none focus:border-[#0e5f73] focus:ring-2 focus:ring-[#22d3ee]/30 ${extra}`;
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
            <p className="text-sm text-white/80">{body}</p>
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {kicker && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6b4e0b]">{kicker}</p>
          )}
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#0B1F33]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#3d4f63]">{subtitle}</p>}
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
        'w-full rounded-2xl border border-[#c9bea8] bg-[#fffdf8] text-[#0B1F33] shadow-[0_1px_0_rgba(201,164,92,0.18),0_18px_40px_-28px_rgba(7,20,34,0.45)]',
        padding === 'md' && 'p-4 sm:p-5',
        padding === 'sm' && 'p-3 sm:p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LabSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <LabCard className="space-y-4">
      <div>
        <h2 className="lab-display text-2xl font-semibold text-[#0B1F33]">{title}</h2>
        {hint && <p className="mt-1 text-sm leading-relaxed text-[#3d4f63]">{hint}</p>}
      </div>
      {children}
    </LabCard>
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
      <p className="text-[11px] uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-80">{hint}</p>}
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
    slate: 'bg-slate-200 text-slate-800',
    gold: 'bg-[#f4ead0] text-[#6b4e0b]',
    cyan: 'bg-cyan-100 text-cyan-900',
    green: 'bg-emerald-100 text-emerald-900',
    amber: 'bg-amber-100 text-amber-950',
    rose: 'bg-rose-100 text-rose-900',
    fr: 'bg-blue-100 text-blue-900',
    en: 'bg-indigo-100 text-indigo-900',
  };
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', tones[tone])}>
      {children}
    </span>
  );
}

export function LabTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#c9bea8] bg-[#fffdf8] text-[#0B1F33]">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function LabTh({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3d4f63]">
      {children}
    </th>
  );
}

export function LabEmpty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-[#3d4f63]">{children}</p>;
}

export function LabAlert({
  tone = 'ok',
  children,
}: {
  tone?: 'ok' | 'err' | 'warn';
  children: ReactNode;
}) {
  const tones = {
    ok: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    err: 'border-rose-300 bg-rose-50 text-rose-900',
    warn: 'border-amber-300 bg-amber-50 text-amber-950',
  };
  return <p className={clsx('rounded-xl border px-3 py-2 text-sm font-medium', tones[tone])}>{children}</p>;
}

export function LabGhostButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex h-10 items-center justify-center rounded-xl border border-[#c9bea8] bg-white px-4 text-sm font-medium text-[#0B1F33] transition hover:border-[#d4af37]',
        props.className,
      )}
    />
  );
}
