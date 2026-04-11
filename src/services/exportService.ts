/**
 * Service Export Complet
 * Supporte CSV, Excel, PDF
 * Génération professionnelle de rapports
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logger } from '../lib/logger';
import { Exhibitor, Partner, User, Appointment } from '../types';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  fields?: string[];
  title?: string;
  author?: string;
  subject?: string;
}

interface AnalyticsStats {
  [key: string]: unknown;
}

class ExportService {
  /**
   * Export to CSV
   */
  async exportToCsv<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ): Promise<Blob> {
    try {
      logger.debug('Exporting to CSV', { count: data.length });

      if (data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = options.headers || Object.keys(data[0]);
      const fields = options.fields || Object.keys(data[0]);

      // CSV Header
      let csv = headers.join(',') + '\n';

      // CSV Rows
      data.forEach((item) => {
        const row = fields.map((field) => {
          const value = this.getNestedValue(item, field);
          return this.escapeCsvValue(value);
        });
        csv += row.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      logger.info('CSV export successful', { rows: data.length });
      return blob;
    } catch (error) {
      logger.error('CSV export failed', error);
      throw error;
    }
  }

  /**
   * Export to Excel (XLSX via SheetJS)
   */
  async exportToExcel<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ): Promise<Blob> {
    try {
      logger.debug('Exporting to Excel', { count: data.length });

      const headers = options.headers || Object.keys(data[0] || {});
      const fields = options.fields || Object.keys(data[0] || {});

      // Build worksheet rows
      const wsData: (string | number | null)[][] = [headers];
      data.forEach((item) => {
        const row = fields.map((field) => {
          const value = this.getNestedValue(item, field);
          if (value === null || value === undefined) return null;
          if (typeof value === 'number') return value;
          return String(value);
        });
        wsData.push(row);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, options.title || 'Export');
      const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      logger.info('Excel export successful', { rows: data.length });
      return blob;
    } catch (error) {
      logger.error('Excel export failed', error);
      throw error;
    }
  }

  /**
   * Export to PDF (jsPDF + autoTable)
   */
  async exportToPdf<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ): Promise<Blob> {
    try {
      logger.debug('Exporting to PDF', { count: data.length });

      const headers = options.headers || Object.keys(data[0] || {});
      const fields = options.fields || Object.keys(data[0] || {});
      const title = options.title || 'Export';

      const doc = new jsPDF({ orientation: 'landscape' });

      // Title
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 22);

      const body = data.map((item) =>
        fields.map((field) => {
          const value = this.getNestedValue(item, field);
          return value !== null && value !== undefined ? String(value) : '';
        })
      );

      autoTable(doc, {
        head: [headers],
        body,
        startY: 28,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });

      logger.info('PDF export successful', { rows: data.length });
      return blob;
    } catch (error) {
      logger.error('PDF export failed', error);
      throw error;
    }
  }

  /**
   * Export to JSON
   */
  async exportToJson<T>(data: T[], options: ExportOptions = {}): Promise<Blob> {
    try {
      logger.debug('Exporting to JSON', { count: data.length });

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      logger.info('JSON export successful', { rows: data.length });
      return blob;
    } catch (error) {
      logger.error('JSON export failed', error);
      throw error;
    }
  }

  /**
   * Download file
   */
  download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info('File downloaded', { filename, size: blob.size });
  }

  /**
   * Helper: Get nested value from object
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Helper: Escape CSV value
   */
  private escapeCsvValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);

    // If contains comma, quote, or newline, wrap in quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Helper: Generate HTML table
   */
  private generateHtmlTable<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions
  ): string {
    const headers = options.headers || Object.keys(data[0] || {});
    const fields = options.fields || Object.keys(data[0] || {});
    const title = options.title || 'Export';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          tr:hover { background-color: #ddd; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((item) => {
      html += '<tr>';
      fields.forEach((field) => {
        const value = this.getNestedValue(item, field);
        html += `<td>${value !== null && value !== undefined ? value : ''}</td>`;
      });
      html += '</tr>';
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    return html;
  }

  // ==========================================
  // ENTITY-SPECIFIC EXPORTS
  // ==========================================

  /**
   * Export Exhibitors
   */
  async exportExhibitors(
    exhibitors: Exhibitor[],
    format: ExportFormat = 'csv'
  ): Promise<void> {
    const data = exhibitors.map((ex) => ({
      'Nom Entreprise': ex.companyName || ex.company_name,
      'Catégorie': ex.category,
      'Secteur': ex.sector,
      'Email': ex.contactInfo?.email || ex.contact_info?.email,
      'Téléphone': ex.contactInfo?.phone || ex.contact_info?.phone,
      'Ville': ex.contactInfo?.city || ex.contact_info?.city,
      'Pays': ex.contactInfo?.country || ex.contact_info?.country,
      'Stand': ex.standNumber || ex.user?.profile?.standNumber,
      'Vérifié': ex.verified ? 'Oui' : 'Non',
      'En vedette': ex.featured ? 'Oui' : 'Non',
    }));

    const blob = await this.exportByFormat(data, format, {
      filename: `exposants_${Date.now()}`,
      title: 'Liste des Exposants - sib 2026',
    });

    this.download(blob, `exposants_${Date.now()}.${format}`);
  }

  /**
   * Export Partners
   */
  async exportPartners(partners: Partner[], format: ExportFormat = 'csv'): Promise<void> {
    const data = partners.map((p) => ({
      'Organisation': p.organizationName || p.organization_name,
      'Type': p.partnerType || p.partner_type,
      'Tier': p.partner_tier,
      'Secteur': p.sector,
      'Pays': p.country,
      'Contact': p.contactName || p.contact_name,
      'Email': p.contactEmail || p.contact_email,
      'Téléphone': p.contactPhone || p.contact_phone,
      'Niveau Sponsoring': p.sponsorshipLevel || p.sponsorship_level,
      'Vérifié': p.verified ? 'Oui' : 'Non',
    }));

    const blob = await this.exportByFormat(data, format, {
      filename: `partenaires_${Date.now()}`,
      title: 'Liste des Partenaires - sib 2026',
    });

    this.download(blob, `partenaires_${Date.now()}.${format}`);
  }

  /**
   * Export Visitors
   */
  async exportVisitors(visitors: User[], format: ExportFormat = 'csv'): Promise<void> {
    const data = visitors.map((v) => ({
      'Nom': v.name,
      'Email': v.email,
      'Niveau': v.visitor_level || 'free',
      'Entreprise': v.profile?.company,
      'Poste': v.profile?.position,
      'Pays': v.profile?.country,
      'Téléphone': v.profile?.phone,
      'Type': v.profile?.visitorType || 'individual',
      'Statut': v.status,
      'Inscrit le': new Date(v.createdAt || v.created_at).toLocaleDateString('fr-FR'),
    }));

    const blob = await this.exportByFormat(data, format, {
      filename: `visiteurs_${Date.now()}`,
      title: 'Liste des Visiteurs - sib 2026',
    });

    this.download(blob, `visiteurs_${Date.now()}.${format}`);
  }

  /**
   * Export Appointments
   */
  async exportAppointments(
    appointments: Appointment[],
    format: ExportFormat = 'csv'
  ): Promise<void> {
    const data = appointments.map((apt) => ({
      'Date': new Date(apt.scheduledAt || apt.scheduled_at).toLocaleDateString('fr-FR'),
      'Heure': new Date(apt.scheduledAt || apt.scheduled_at).toLocaleTimeString('fr-FR'),
      'Exposant': apt.exhibitor?.companyName || apt.exhibitor_name,
      'Visiteur': apt.visitor?.name || apt.visitor_name,
      'Statut': apt.status,
      'Type': apt.type || 'in-person',
      'Lieu': apt.location,
      'Message': apt.message,
    }));

    const blob = await this.exportByFormat(data, format, {
      filename: `rendez-vous_${Date.now()}`,
      title: 'Liste des Rendez-vous - sib 2026',
    });

    this.download(blob, `rendez-vous_${Date.now()}.${format}`);
  }

  /**
   * Export Analytics Report
   */
  async exportAnalyticsReport(stats: AnalyticsStats, format: ExportFormat = 'pdf'): Promise<void> {
    const data = [
      { 'Métrique': 'Visiteurs Total', 'Valeur': stats.totalVisitors },
      { 'Métrique': 'Exposants Total', 'Valeur': stats.totalExhibitors },
      { 'Métrique': 'Partenaires Total', 'Valeur': stats.totalPartners },
      { 'Métrique': 'Rendez-vous Total', 'Valeur': stats.totalAppointments },
      { 'Métrique': 'Rendez-vous Confirmés', 'Valeur': stats.confirmedAppointments },
      { 'Métrique': 'Pages Vues', 'Valeur': stats.pageViews },
      { 'Métrique': 'Taux Conversion', 'Valeur': `${stats.conversionRate}%` },
    ];

    const blob = await this.exportByFormat(data, format, {
      filename: `analytics_${Date.now()}`,
      title: 'Rapport Analytics - sib 2026',
    });

    this.download(blob, `analytics_${Date.now()}.${format}`);
  }

  /**
   * Helper: Export by format
   */
  private async exportByFormat(
    data: Record<string, unknown>[],
    format: ExportFormat,
    options: ExportOptions
  ): Promise<Blob> {
    switch (format) {
      case 'csv':
        return this.exportToCsv(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      case 'pdf':
        return this.exportToPdf(data, options);
      case 'json':
        return this.exportToJson(data, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

export const exportService = new ExportService();
export default exportService;

