/** DEV seed accounts already listed in docs/LAB_SEED.md. Not production secrets. */

export type LabDemoTone = 'gold' | 'cyan' | 'goldSoft';

export interface LabDemoAdminAccount {
  id: 'admin' | 'zineb' | 'tech';
  email: string;
  password: string;
  label: string;
  roleLabel: string;
  tone: LabDemoTone;
}

export interface LabDemoClientAccount {
  id: 'client';
  email: string;
  password: string;
  label: string;
  roleLabel: string;
  tone: LabDemoTone;
}

export const LAB_DEMO_ADMIN_ACCOUNTS: readonly LabDemoAdminAccount[] = [
  {
    id: 'admin',
    email: 'admin@elitech.dev',
    password: 'LabDev!2026Admin',
    label: 'Admin',
    roleLabel: 'SUPER_ADMIN',
    tone: 'gold',
  },
  {
    id: 'zineb',
    email: 'zineb@elitech.dev',
    password: 'LabDev!2026Zineb',
    label: 'Madame Zineb',
    roleLabel: 'RESPONSABLE_VALIDATION',
    tone: 'cyan',
  },
  {
    id: 'tech',
    email: 'tech@elitech.dev',
    password: 'LabDev!2026Tech',
    label: 'Technique',
    roleLabel: 'RESPONSABLE_TECHNIQUE',
    tone: 'goldSoft',
  },
];

export const LAB_DEMO_CLIENT_ACCOUNT: LabDemoClientAccount = {
  id: 'client',
  email: 'client@elitech.dev',
  password: 'LabDev!2026Client',
  label: 'Client Atlas Oils',
  roleLabel: 'CLIENT · OTP e-mail',
  tone: 'cyan',
};

/** Default ON (Vercel demo). Hide in real prod with VITE_LAB_DEMO_LOGIN=false. */
export function isLabDemoLoginEnabled(flag?: string | boolean | null): boolean {
  return flag !== 'false' && flag !== false;
}

export function showLabDemoLogin(
  env: { VITE_LAB_DEMO_LOGIN?: string } = import.meta.env,
): boolean {
  return isLabDemoLoginEnabled(env.VITE_LAB_DEMO_LOGIN);
}
