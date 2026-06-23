import { supabase } from '../lib/supabase';

export type InvoiceStatus = 'issued' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  amountTtc: number;
  currency: string;
  issuedAt: string;
  userType: string;
}

export async function fetchInvoicesForUser(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, amount_ttc, currency, issued_at, user_type')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
    .limit(20);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    invoiceNumber: row.invoice_number as string,
    status: (row.status as InvoiceStatus) ?? 'issued',
    amountTtc: Number(row.amount_ttc ?? 0),
    currency: (row.currency as string) ?? 'EUR',
    issuedAt: row.issued_at as string,
    userType: (row.user_type as string) ?? 'visitor',
  }));
}
