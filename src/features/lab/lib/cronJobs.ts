import { deadlinePenalty, deadlineState } from './deadlines';
import { isFollowupDue } from './quoteFollowup';

export interface FollowupQuote {
  id: string;
  quote_number: string;
  sent_at: string | null;
  followup_due_at: string | null;
  followup_sent_at: string | null;
  survey_token: string | null;
  organization_id: string;
}

export interface DeadlineRow {
  id: string;
  organization_id: string;
  expected_date: string;
  actual_date: string | null;
  reminded_at: string | null;
  late_notified_at: string | null;
}

export function pickDueFollowups(quotes: FollowupQuote[], now = new Date()): FollowupQuote[] {
  return quotes.filter((quote) => isFollowupDue({
    sentAt: quote.sent_at,
    followupDueAt: quote.followup_due_at,
    followupSentAt: quote.followup_sent_at,
    now,
  }));
}

export function pickUnpaidInvoices(rows: { id: string; status: string; reminder_sent_at?: string | null }[]) {
  return rows.filter((row) => (row.status === 'IMPAYEE' || row.status === 'EN_ATTENTE') && !row.reminder_sent_at);
}

export function pickDeadlineActions(rows: DeadlineRow[], now = new Date()) {
  return rows.flatMap((row) => {
    const state = deadlineState(row.expected_date, row.actual_date, now);
    if (state === 'due_soon' && !row.reminded_at) {
      return [{ id: row.id, organizationId: row.organization_id, action: 'remind' as const, expected: row.expected_date }];
    }
    if (state === 'late' && !row.late_notified_at) {
      const pen = deadlinePenalty(1000, row.expected_date, row.actual_date, 1, now);
      return [{
        id: row.id,
        organizationId: row.organization_id,
        action: 'late' as const,
        expected: row.expected_date,
        delayDays: pen.days,
        penaltyAmount: pen.amount,
      }];
    }
    return [];
  });
}
