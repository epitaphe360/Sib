export interface ResultDraft {
  analysisName: string;
  value?: string | null;
  unit?: string | null;
  method?: string | null;
  orderedAnalyses?: string[];
  expectedUnits?: string[];
}

export function detectResultAnomalies(draft: ResultDraft): string[] {
  const issues: string[] = [];
  if (!draft.analysisName?.trim()) issues.push('Analyse manquante');
  if (!draft.value?.trim()) issues.push('Valeur manquante');
  if (!draft.unit?.trim()) issues.push('Unité manquante');
  if (!draft.method?.trim()) issues.push('Méthode manquante');
  const ordered = (draft.orderedAnalyses ?? []).map((a) => a.toLowerCase());
  if (ordered.length && !ordered.includes(draft.analysisName.trim().toLowerCase())) {
    issues.push('Analyse hors commande');
  }
  const units = (draft.expectedUnits ?? []).map((u) => u.toLowerCase());
  if (units.length && draft.unit && !units.includes(draft.unit.toLowerCase())) {
    issues.push('Unité inattendue');
  }
  const numeric = Number(draft.value);
  if (draft.value && !Number.isNaN(numeric) && numeric < 0) issues.push('Valeur négative suspecte');
  return issues;
}

export function correctionDueAt(from: Date, hours = 6): Date {
  const h = Number.isFinite(hours) && hours > 0 ? hours : 6;
  return new Date(from.getTime() + h * 60 * 60 * 1000);
}

export function isCorrectionOverdue(dueAt: string | Date, now = new Date()): boolean {
  return new Date(dueAt).getTime() < now.getTime();
}

export function shouldEmailSupplierOnDoubleRefuse(tech: string, final: string): boolean {
  return tech === 'REFUSER' && final === 'REFUSER';
}
