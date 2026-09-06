import { LAB_THEME } from '../theme/tokens';
import {
  showLabDemoLogin,
  type LabDemoAdminAccount,
  type LabDemoClientAccount,
  type LabDemoTone,
} from '../lib/demoAccounts';

const TONE_BORDER: Record<LabDemoTone, string> = {
  gold: LAB_THEME.gold,
  cyan: LAB_THEME.cyan,
  goldSoft: LAB_THEME.goldSoft,
};

export function LabDemoAccounts<T extends LabDemoAdminAccount | LabDemoClientAccount>({
  accounts,
  onPick,
  busyId,
  disabled,
  hint,
}: {
  accounts: ReadonlyArray<T>;
  onPick: (account: T) => void;
  busyId?: string | null;
  disabled?: boolean;
  hint?: string;
}) {
  if (!showLabDemoLogin()) return null;

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4af37]/70" />
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#d4af37]">Comptes démo</p>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4af37]/70" />
      </div>
      <div className="grid gap-2">
        {accounts.map((account) => {
          const busy = busyId === account.id;
          return (
            <button
              key={account.id}
              type="button"
              disabled={disabled || Boolean(busyId)}
              onClick={() => onPick(account)}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition disabled:opacity-40"
              style={{
                background: `linear-gradient(160deg, ${LAB_THEME.navyMid}, ${LAB_THEME.navy})`,
                border: `1px solid ${TONE_BORDER[account.tone]}`,
                boxShadow: `0 10px 28px rgba(7, 20, 34, 0.35), inset 0 0 0 1px rgba(255,255,255,0.04)`,
                color: LAB_THEME.ink,
              }}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{account.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-white/50">{account.email}</span>
              </span>
              <span
                className="shrink-0 text-[10px] uppercase tracking-[0.14em]"
                style={{ color: TONE_BORDER[account.tone] }}
              >
                {busy ? 'Connexion…' : account.roleLabel}
              </span>
            </button>
          );
        })}
      </div>
      {hint && <p className="text-[11px] leading-relaxed text-white/45">{hint}</p>}
    </div>
  );
}
