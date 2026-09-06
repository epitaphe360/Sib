export function followupDueAt(sentAt: Date, followupDays: number): Date {
  const days = Number.isFinite(followupDays) && followupDays > 0 ? followupDays : 3;
  return new Date(sentAt.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isFollowupDue(input: {
  sentAt: string | null;
  followupDueAt: string | null;
  followupSentAt: string | null;
  now?: Date;
}): boolean {
  if (!input.sentAt || input.followupSentAt) return false;
  if (!input.followupDueAt) return false;
  const now = input.now ?? new Date();
  return new Date(input.followupDueAt).getTime() <= now.getTime();
}

export type QuoteSurvey = {
  received: boolean;
  priceOk: boolean;
  delayOk: boolean;
  priceTooHigh: boolean;
  comment?: string;
};

export function surveyCreatesPriceAlert(survey: QuoteSurvey): boolean {
  return survey.priceTooHigh || survey.priceOk === false;
}
