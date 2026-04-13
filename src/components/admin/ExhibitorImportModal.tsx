import React, { useState, useRef } from 'react';
import { Upload, X, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface ImportRow {
  company_name: string;
  sector?: string;
  category?: string;
  description?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  stand_number?: string;
  country?: string;
  city?: string;
}

interface ImportResult {
  success: number;
  errors: { row: number; name: string; error: string }[];
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_COLUMNS = ['company_name'];
const EXAMPLE_DATA = [
  {
    company_name: 'BTP Solutions Maroc',
    sector: 'Gros Oeuvre',
    category: 'construction_industry',
    description: 'Entreprise spécialisée en gros oeuvre',
    website: 'https://example.com',
    contact_email: 'contact@example.com',
    contact_phone: '+212600000000',
    stand_number: 'A-01',
    country: 'Maroc',
    city: 'Casablanca',
  },
];

export function ExhibitorImportModal({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsvContent = (csvContent: string): ImportRow[] => {
    const lines = csvContent
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length === 0) return [];

    const parseLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]);
    return lines.slice(1).map((line) => {
      const values = parseLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? '';
      });
      return row as ImportRow;
    });
  };

  const parseFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Format non supporté. Utilisez un fichier CSV.']);
      setPreview([]);
      setRows([]);
      setFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = String(e.target?.result || '');
        const parsedRows = parseCsvContent(content);

        const errs: string[] = [];
        if (parsedRows.length === 0) {
          errs.push('Le fichier est vide.');
        }
        // Vérifier colonnes obligatoires
        if (parsedRows.length > 0) {
          REQUIRED_COLUMNS.forEach((col) => {
            if (!(col in parsedRows[0])) {
              errs.push(`Colonne obligatoire manquante: "${col}"`);
            }
          });
        }
        setErrors(errs);
        setRows(parsedRows);
        setPreview(parsedRows.slice(0, 5));
        setFile(f);
      } catch (err) {
        setErrors(['Impossible de lire le fichier. Vérifiez le format CSV.']);
      }
    };
    reader.readAsText(f, 'utf-8');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) parseFile(f);
  };

  const handleImport = async () => {
    if (!file || errors.length > 0 || rows.length === 0) return;

    setImporting(true);
    const importResult: ImportResult = { success: 0, errors: [] };

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.company_name?.toString().trim()) {
          importResult.errors.push({ row: i + 2, name: '(vide)', error: 'Nom entreprise manquant' });
          continue;
        }

        try {
          const { error } = await supabase
            .from('exhibitors')
            .insert({
              company_name: row.company_name.toString().trim(),
              sector: row.sector?.toString() || null,
              category: row.category?.toString() || 'construction_industry',
              description: row.description?.toString() || null,
              website: row.website?.toString() || null,
              contact_info: {
                email: row.contact_email?.toString() || null,
                phone: row.contact_phone?.toString() || null,
              },
              stand_number: row.stand_number?.toString() || null,
              verified: false,
              featured: false,
              created_at: new Date().toISOString(),
            });

          if (error) {
            importResult.errors.push({
              row: i + 2,
              name: row.company_name,
              error: error.message,
            });
          } else {
            importResult.success++;
          }
        } catch (err: any) {
          importResult.errors.push({
            row: i + 2,
            name: row.company_name,
            error: err.message || 'Erreur inconnue',
          });
        }
      }

      setResult(importResult);
      setImporting(false);

      if (importResult.success > 0) {
        toast.success(`${importResult.success} exposant(s) importé(s) avec succès`);
        onSuccess();
      }
      if (importResult.errors.length > 0) {
        toast.error(`${importResult.errors.length} erreur(s) d'importation`);
      }
    } catch (err) {
      setImporting(false);
      toast.error("Erreur lors de l'importation");
    }
  };

  const downloadTemplate = () => {
    const headers = Object.keys(EXAMPLE_DATA[0]);
    const escapeCsv = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const csvRows = [
      headers.join(','),
      ...EXAMPLE_DATA.map((row) => headers.map((h) => escapeCsv((row as Record<string, string>)[h] || '')).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_exposants_sib2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Import CSV Exposants</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template download */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Modèle de fichier</p>
              <p className="text-sm text-blue-700">Téléchargez le modèle CSV avec les colonnes requises</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="border-blue-300 text-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le modèle
            </Button>
          </div>

          {/* Colonnes requises */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Colonnes du fichier :</p>
            <div className="flex flex-wrap gap-2">
              {['company_name *', 'sector', 'category', 'description', 'website', 'contact_email', 'contact_phone', 'stand_number', 'country', 'city'].map(col => (
                <span key={col} className={`px-2 py-1 rounded text-xs font-mono ${col.includes('*') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          {!result && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Glissez votre fichier ici ou cliquez pour parcourir</p>
              <p className="text-gray-400 text-sm mt-1">Format accepté : .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Erreurs de validation */}
          {errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 space-y-1">
              {errors.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {e}
                </div>
              ))}
            </div>
          )}

          {/* Aperçu */}
          {preview.length > 0 && errors.length === 0 && !result && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Aperçu ({preview.length} première(s) ligne(s) - fichier: <span className="font-mono text-blue-600">{file?.name}</span>)
              </p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map(k => (
                        <th key={k} className="px-3 py-2 text-left font-medium text-gray-500">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700 truncate max-w-[150px]">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">{result.success} exposant(s) importé(s) avec succès</span>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="font-medium text-red-800 mb-2">{result.errors.length} erreur(s) :</p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-red-700 text-sm">
                        Ligne {e.row} ({e.name}) : {e.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            {result ? 'Fermer' : 'Annuler'}
          </Button>
          {!result && file && errors.length === 0 && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importation en cours...' : `Importer les exposants`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

