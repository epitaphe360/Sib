export interface ReportChecklist {
  client: boolean;
  sample: boolean;
  sampleCode: boolean;
  methods: boolean;
  results: boolean;
  units: boolean;
  dates: boolean;
  validations: boolean;
}

export function reportReadiness(input: ReportChecklist): { ok: boolean; missing: string[] } {
  const labels: Record<keyof ReportChecklist, string> = {
    client: 'client',
    sample: 'échantillon',
    sampleCode: 'code échantillon',
    methods: 'méthodes',
    results: 'résultats',
    units: 'unités',
    dates: 'dates',
    validations: 'validations',
  };
  const missing = (Object.keys(labels) as (keyof ReportChecklist)[])
    .filter((key) => !input[key])
    .map((key) => labels[key]);
  return { ok: missing.length === 0, missing };
}

export function pickTemplateKind(kind: 'PHYSICO_CHIMIQUE' | 'MICROBIOLOGIQUE' | 'MIXTE' | null): 'PHYSICO_CHIMIQUE' | 'MICROBIOLOGIQUE' {
  return kind === 'MICROBIOLOGIQUE' ? 'MICROBIOLOGIQUE' : 'PHYSICO_CHIMIQUE';
}
