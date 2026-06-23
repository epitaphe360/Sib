export const ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND';

export function getErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export function isNetworkError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout') ||
    msg.includes('connexion')
  );
}
