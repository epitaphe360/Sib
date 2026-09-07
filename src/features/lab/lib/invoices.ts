import type { InvoiceStatus } from '../types';

export function invoiceProgress(total: number, paid: number, dueDate?: string | null, now = new Date()): {
  amountPaid: number;
  amountRemaining: number;
  daysLate: number;
  status: InvoiceStatus;
} {
  const amountPaid = Math.max(0, paid);
  const amountRemaining = Math.max(0, Math.round((total - amountPaid) * 100) / 100);
  const due = dueDate ? new Date(dueDate) : null;
  const daysLate = due && amountRemaining > 0 && now > due
    ? Math.ceil((now.getTime() - due.getTime()) / 86_400_000)
    : 0;
  let status: InvoiceStatus = 'EN_ATTENTE';
  if (amountRemaining <= 0) status = 'PAYEE';
  else if (amountPaid > 0) status = 'PARTIELLEMENT_PAYEE';
  else if (daysLate > 0) status = 'IMPAYEE';
  return { amountPaid, amountRemaining, daysLate, status };
}
