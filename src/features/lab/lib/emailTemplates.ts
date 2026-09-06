export const EMAIL_TEMPLATE_KEYS = [
  'supplier_consultation',
  'client_quote',
  'quote_followup',
  'po_correction',
  'po_confirmed',
  'supplier_po',
  'supplier_reminder',
  'supplier_late',
  'result_correction',
  'report_ready',
  'invoice',
  'payment_reminder',
  'otp',
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export function renderEmail(
  key: EmailTemplateKey,
  vars: Record<string, string>,
): { subject: string; body: string } {
  const v = (name: string) => vars[name] ?? '';
  const map: Record<EmailTemplateKey, { subject: string; body: string }> = {
    supplier_consultation: {
      subject: `RFQ ${v('dossier')}`,
      body: `Please quote for ${v('product')}. Secure form: ${v('link')}`,
    },
    client_quote: {
      subject: `Devis ${v('quote')}`,
      body: `Votre devis ${v('quote')} d’un montant de ${v('amount')} est disponible.`,
    },
    quote_followup: {
      subject: `Relance devis ${v('quote')}`,
      body: `Avez-vous reçu le devis ${v('quote')} ? Sondage: ${v('link')}`,
    },
    po_correction: {
      subject: `Correction BDC ${v('reference')}`,
      body: `Votre bon de commande nécessite une correction: ${v('reason')}`,
    },
    po_confirmed: {
      subject: `BDC confirmé ${v('reference')}`,
      body: `Votre commande est confirmée. Nous attendons les échantillons.`,
    },
    supplier_po: {
      subject: `Purchase order ${v('po')}`,
      body: `Please proceed with sample ${v('code')}. Contractual date: ${v('date')}.`,
    },
    supplier_reminder: {
      subject: `Reminder ${v('po')}`,
      body: `Deadline ${v('date')} is approaching. Penalties apply per contract.`,
    },
    supplier_late: {
      subject: `Delay notice ${v('po')}`,
      body: `Deadline ${v('date')} is passed. Contractual penalties may apply (${v('rate')}%/day).`,
    },
    result_correction: {
      subject: `Correction required ${v('dossier')}`,
      body: `Please correct ${v('analyses')} within 6 hours. Comments: ${v('comment')}`,
    },
    report_ready: {
      subject: `Rapport ${v('dossier')}`,
      body: `Votre rapport est disponible dans le portail client.`,
    },
    invoice: {
      subject: `Facture ${v('invoice')}`,
      body: `Facture ${v('invoice')} — montant ${v('amount')}, échéance ${v('due')}.`,
    },
    payment_reminder: {
      subject: `Rappel paiement ${v('invoice')}`,
      body: `Impayé ${v('remaining')}. Merci de régulariser.`,
    },
    otp: {
      subject: `Code d’accès`,
      body: `Votre code expire dans 10 minutes.`,
    },
  };
  return map[key];
}

export function queueEmailPayload(
  organizationId: string,
  key: EmailTemplateKey,
  recipient: string,
  vars: Record<string, string>,
) {
  const rendered = renderEmail(key, vars);
  return {
    organization_id: organizationId,
    template_key: key,
    recipient,
    subject: rendered.subject,
    body: rendered.body,
    status: 'queued',
    provider: 'resend',
  };
}
