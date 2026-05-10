/**
 * Service Facturation SIB 2026
 * Gestion des factures: CRUD Supabase + génération PDF client-side (jsPDF)
 *
 * Réutilise:
 *  - jsPDF + jspdf-autotable (déjà installés, cf. exportService.ts)
 *  - BANK_TRANSFER_INFO depuis bankTransferConfig.ts
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import { BANK_TRANSFER_INFO } from '../config/bankTransferConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'issued' | 'cancelled';
export type UserType = 'visitor' | 'exhibitor' | 'partner';

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  user_type: UserType;
  user_email: string;
  user_name: string | null;
  payment_transaction_id: string | null;
  payment_request_id: string | null;
  status: InvoiceStatus;
  amount_ht: number;
  vat_rate: number;
  vat_amount: number;
  amount_ttc: number;
  currency: string;
  notes: string | null;
  issued_at: string;
  created_at: string;
  invoice_lines?: InvoiceLine[];
}

export interface CreateInvoicePayload {
  user_id: string;
  user_type: UserType;
  user_email: string;
  user_name?: string;
  payment_transaction_id?: string;
  payment_request_id?: string;
  vat_rate?: number;
  currency?: string;
  notes?: string;
  lines: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les factures (admin) ou les factures de l'utilisateur courant
 */
export async function fetchInvoices(userId?: string): Promise<Invoice[]> {
  let query = supabase
    .from('invoices')
    .select('*, invoice_lines(*)')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

/**
 * Récupère une facture par ID avec ses lignes
 */
export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_lines(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Invoice | null;
}

/**
 * Crée une facture + ses lignes en transaction
 */
export async function createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
  // Calculer les totaux depuis les lignes
  const lines = payload.lines.map((l, i) => ({
    description: l.description,
    quantity: l.quantity,
    unit_price: l.unit_price,
    line_total: Math.round(l.quantity * l.unit_price * 100) / 100,
    sort_order: i,
  }));

  const vatRate = payload.vat_rate ?? 0;
  const amountHt = lines.reduce((sum, l) => sum + l.line_total, 0);
  const amountHtRounded = Math.round(amountHt * 100) / 100;
  const vatAmount = Math.round(amountHtRounded * vatRate) / 100;
  const amountTtc = Math.round((amountHtRounded + vatAmount) * 100) / 100;

  // Créer la facture
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: payload.user_id,
      user_type: payload.user_type,
      user_email: payload.user_email,
      user_name: payload.user_name ?? null,
      payment_transaction_id: payload.payment_transaction_id ?? null,
      payment_request_id: payload.payment_request_id ?? null,
      amount_ht: amountHtRounded,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      amount_ttc: amountTtc,
      currency: payload.currency ?? 'EUR',
      notes: payload.notes ?? null,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Créer les lignes
  if (lines.length > 0) {
    const { error: linesError } = await supabase
      .from('invoice_lines')
      .insert(lines.map(l => ({ ...l, invoice_id: invoice.id })));
    if (linesError) throw linesError;
  }

  return invoice as Invoice;
}

/**
 * Annule une facture
 */
export async function cancelInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}

// ── PDF ───────────────────────────────────────────────────────────────────────

const USER_TYPE_LABELS: Record<UserType, string> = {
  visitor: 'Visiteur VIP',
  exhibitor: 'Exposant',
  partner: 'Partenaire',
};

/**
 * Génère et télécharge un PDF de facture (client-side, jsPDF + autoTable)
 */
export function downloadInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const lines = invoice.invoice_lines ?? [];
  const currency = invoice.currency.toUpperCase();

  // Dimensions
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // ── En-tête émetteur ────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // bleu SIB
  doc.text('URBACOM', margin, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  y += 6;
  doc.text('Organisateur du Salon International du Bâtiment - SIB 2026', margin, y);
  y += 5;
  doc.text('El Jadida, Maroc', margin, y);
  y += 5;
  doc.text(`Banque: ${BANK_TRANSFER_INFO.bankName} | IBAN: ${BANK_TRANSFER_INFO.iban}`, margin, y);

  // ── Titre FACTURE ────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('FACTURE', pageW - margin, margin, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`N° ${invoice.invoice_number}`, pageW - margin, margin + 8, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.issued_at).toLocaleDateString('fr-FR')}`, pageW - margin, margin + 14, { align: 'right' });
  doc.text(`Statut: ${invoice.status === 'issued' ? 'Émise' : 'Annulée'}`, pageW - margin, margin + 20, { align: 'right' });

  // ── Séparateur ───────────────────────────────────────────────────────────────
  y += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Destinataire ─────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('FACTURÉ À', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  if (invoice.user_name) {
    doc.text(invoice.user_name, margin, y);
    y += 5;
  }
  doc.text(invoice.user_email, margin, y);
  y += 5;
  doc.text(`Profil: ${USER_TYPE_LABELS[invoice.user_type]}`, margin, y);
  y += 12;

  // ── Tableau des lignes ────────────────────────────────────────────────────────
  const tableBody = lines.map(l => [
    l.description,
    l.quantity.toString(),
    `${l.unit_price.toFixed(2)} ${currency}`,
    `${l.line_total.toFixed(2)} ${currency}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qté', `P.U. (${currency})`, `Total (${currency})`]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Totaux ────────────────────────────────────────────────────────────────────
  const totalsX = pageW - margin - 90;
  const totalsLabelX = totalsX;
  const totalsValueX = pageW - margin;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  doc.text('Sous-total HT:', totalsLabelX, y);
  doc.text(`${invoice.amount_ht.toFixed(2)} ${currency}`, totalsValueX, y, { align: 'right' });
  y += 5;

  doc.text(`TVA (${invoice.vat_rate}%):`, totalsLabelX, y);
  doc.text(`${invoice.vat_amount.toFixed(2)} ${currency}`, totalsValueX, y, { align: 'right' });
  y += 5;

  // Total TTC en gras + encadré
  doc.setDrawColor(30, 64, 175);
  doc.setFillColor(235, 240, 255);
  doc.roundedRect(totalsX - 4, y - 4, totalsValueX - totalsX + 8 + 4, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.text('TOTAL TTC:', totalsLabelX, y + 2);
  doc.text(`${invoice.amount_ttc.toFixed(2)} ${currency}`, totalsValueX, y + 2, { align: 'right' });
  y += 14;

  // ── Informations bancaires ─────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text('INFORMATIONS DE PAIEMENT', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Banque: ${BANK_TRANSFER_INFO.bankName}`, margin, y);
  y += 5;
  doc.text(`Titulaire: ${BANK_TRANSFER_INFO.accountHolder}`, margin, y);
  y += 5;
  doc.text(`IBAN: ${BANK_TRANSFER_INFO.iban}`, margin, y);
  y += 5;
  doc.text(`BIC: ${BANK_TRANSFER_INFO.bic}`, margin, y);
  y += 5;
  doc.text(`Domiciliation: ${BANK_TRANSFER_INFO.domiciliation}`, margin, y);
  y += 10;

  // ── Notes ────────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Notes: ${invoice.notes}`, margin, y);
    y += 8;
  }

  // ── Pied de page ──────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    'SIB 2026 - Salon International du Bâtiment | El Jadida, Maroc | 25-29 Novembre 2026 | www.sib2026.ma',
    pageW / 2,
    pageH - 8,
    { align: 'center' }
  );

  // Téléchargement
  doc.save(`facture-${invoice.invoice_number}.pdf`);
}
