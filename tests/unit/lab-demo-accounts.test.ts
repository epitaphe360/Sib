import { describe, expect, it } from 'vitest';
import {
  isLabDemoLoginEnabled,
  LAB_DEMO_ADMIN_ACCOUNTS,
  LAB_DEMO_CLIENT_ACCOUNT,
  showLabDemoLogin,
} from '@/features/lab/lib/demoAccounts';

describe('lab demo login gate', () => {
  it('is on by default so Vercel demo works', () => {
    expect(isLabDemoLoginEnabled(undefined)).toBe(true);
    expect(isLabDemoLoginEnabled(null)).toBe(true);
    expect(isLabDemoLoginEnabled('true')).toBe(true);
    expect(showLabDemoLogin({})).toBe(true);
  });

  it('hides when VITE_LAB_DEMO_LOGIN=false', () => {
    expect(isLabDemoLoginEnabled('false')).toBe(false);
    expect(isLabDemoLoginEnabled(false)).toBe(false);
    expect(showLabDemoLogin({ VITE_LAB_DEMO_LOGIN: 'false' })).toBe(false);
  });
});

describe('lab demo accounts', () => {
  it('exposes the three staff shortcuts and client OTP account', () => {
    expect(LAB_DEMO_ADMIN_ACCOUNTS.map((a) => a.label)).toEqual(['Admin', 'Madame Zineb', 'Technique']);
    expect(LAB_DEMO_ADMIN_ACCOUNTS.map((a) => a.email)).toEqual([
      'admin@elitech.dev',
      'zineb@elitech.dev',
      'tech@elitech.dev',
    ]);
    expect(LAB_DEMO_CLIENT_ACCOUNT.email).toBe('client@elitech.dev');
    expect(LAB_DEMO_ADMIN_ACCOUNTS.every((a) => a.password.length >= 8)).toBe(true);
  });
});
