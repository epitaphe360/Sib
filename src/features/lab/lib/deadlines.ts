import { computePenalty } from './pricing';

export function delayDays(expected: string, actual?: string | null, now = new Date()): number {
  const end = actual ? new Date(actual) : now;
  const start = new Date(expected);
  const days = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
  return days > 0 ? days : 0;
}

export function deadlineState(expected: string, actual?: string | null, now = new Date()): 'ok' | 'due_soon' | 'late' {
  if (actual) return delayDays(expected, actual, now) > 0 ? 'late' : 'ok';
  const days = delayDays(expected, null, now);
  if (days > 0) return 'late';
  const remaining = Math.ceil((new Date(expected).getTime() - now.getTime()) / 86_400_000);
  return remaining <= 2 ? 'due_soon' : 'ok';
}

export function deadlinePenalty(amount: number, expected: string, actual: string | null, rate: number, now = new Date()) {
  const days = delayDays(expected, actual, now);
  return { days, amount: computePenalty(amount, days, rate) };
}
