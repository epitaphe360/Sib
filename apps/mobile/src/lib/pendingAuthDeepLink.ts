import { normalizeAuthDeepLink } from './authDeepLink';

let pendingAuthUrl: string | null = null;

export function stashAuthDeepLink(raw: string | null): void {
  const normalized = normalizeAuthDeepLink(raw);
  if (normalized) pendingAuthUrl = normalized;
}

export function peekPendingAuthDeepLink(): string | null {
  return pendingAuthUrl;
}

export function consumePendingAuthDeepLink(): string | null {
  const url = pendingAuthUrl;
  pendingAuthUrl = null;
  return url;
}
