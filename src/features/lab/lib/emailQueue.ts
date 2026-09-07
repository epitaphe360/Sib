export interface QueuedEmail {
  id: string;
  status: string;
  recipient: string;
  subject: string;
  body?: string | null;
}

export function pickQueuedEmails(rows: QueuedEmail[], limit = 25): QueuedEmail[] {
  return rows.filter((row) => row.status === 'queued' && row.recipient && row.subject).slice(0, limit);
}

export function nextEmailStatus(ok: boolean): 'sent' | 'failed' {
  return ok ? 'sent' : 'failed';
}

export function classifyInboundEmail(subject: string, body = ''): 'PURCHASE_ORDER' | 'QUOTE_REPLY' | 'REPORT' | 'OTHER' {
  const text = `${subject} ${body}`.toLowerCase();
  if (/(purchase order|bon de commande|\bbdc\b|\bpo\b|\bbc[- ]?\d)/.test(text)) return 'PURCHASE_ORDER';
  if (/(quote|devis|rfq)/.test(text)) return 'QUOTE_REPLY';
  if (/(report|rapport|certificate)/.test(text)) return 'REPORT';
  return 'OTHER';
}
