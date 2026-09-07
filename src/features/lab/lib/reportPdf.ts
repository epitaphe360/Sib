import { jsPDF } from 'jspdf';

export interface LabReportPdfInput {
  kind: string;
  dossier: string;
  client: string;
  sampleCodes: string[];
  results: { analysis_name: string; value: string | null; unit: string | null; method: string | null }[];
  issuedAt?: Date;
}

export function buildLabReportPdf(input: LabReportPdfInput): Blob {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Rapport ${input.kind.replaceAll('_', ' ')}`, 14, 18);
  doc.setFontSize(11);
  doc.text(`Dossier: ${input.dossier}`, 14, 30);
  doc.text(`Client: ${input.client}`, 14, 38);
  doc.text(`Échantillons: ${input.sampleCodes.join(', ') || '—'}`, 14, 46);
  doc.text(`Date: ${(input.issuedAt ?? new Date()).toLocaleDateString('fr-MA')}`, 14, 54);
  let y = 70;
  doc.text('Résultats', 14, y);
  y += 8;
  for (const row of input.results) {
    doc.text(`${row.analysis_name}: ${row.value ?? '—'} ${row.unit ?? ''} (${row.method ?? ''})`, 14, y);
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }
  doc.setFontSize(9);
  doc.text('Document généré par Elitech Lab — mentions officielles du gabarit actif.', 14, 285);
  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
