import { LAB_SEED_ACCOUNTS } from './seedCatalog';

const DEV_PASSWORDS = {
  admin: 'LabDev!2026Admin',
  zineb: 'LabDev!2026Zineb',
  tech: 'LabDev!2026Tech',
  client: 'LabDev!2026Client',
} as const;

export type SeedAccountKind = keyof typeof DEV_PASSWORDS;

export function defaultSeedPassword(
  kind: SeedAccountKind,
  env: Record<string, string | undefined> = {},
): string {
  const keyed: Record<SeedAccountKind, string | undefined> = {
    admin: env.LAB_SEED_PASSWORD_ADMIN,
    zineb: env.LAB_SEED_PASSWORD_ZINEB,
    tech: env.LAB_SEED_PASSWORD_TECH,
    client: env.LAB_SEED_PASSWORD_CLIENT,
  };
  return keyed[kind] || env.LAB_SEED_PASSWORD || DEV_PASSWORDS[kind];
}

export function seedUsersFromEnv(env: Record<string, string | undefined> = {}) {
  return LAB_SEED_ACCOUNTS.map((account) => ({
    ...account,
    password: defaultSeedPassword(account.kind, env),
  }));
}

export function summarizeSeed(input: {
  live: boolean;
  usersCreated: number;
  usersExisting: number;
  requests: number;
  quotes: number;
  samples: number;
  invoices: number;
  tasks: number;
  migration07: boolean;
  error?: string;
}) {
  return {
    ok: input.live && input.requests >= 12 && !input.error,
    org: 'elitech',
    accounts: input.usersCreated + input.usersExisting,
    ...input,
  };
}

export type SeedAccount = (typeof LAB_SEED_ACCOUNTS)[number];
