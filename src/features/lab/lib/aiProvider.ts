export interface AiJobLog {
  provider: string;
  model: string;
  durationMs: number;
  tokens?: number;
  status: 'ok' | 'error' | 'noop';
  costEstimate?: number;
}

export interface LabAiProvider {
  analyzeEmail(input: string): Promise<{ classification: string; summary: string; log: AiJobLog }>;
  extractPurchaseOrder(input: string): Promise<{ quoteRef: string | null; log: AiJobLog }>;
  analyzeSupplierQuote(input: string): Promise<{ amount: number | null; log: AiJobLog }>;
  detectResultAnomalies(input: string): Promise<{ anomalies: string[]; log: AiJobLog }>;
  translateToEnglish(input: string): Promise<{ text: string; log: AiJobLog }>;
  summarizeCase(input: string): Promise<{ summary: string; log: AiJobLog }>;
}

function noopLog(): AiJobLog {
  return { provider: 'noop', model: 'none', durationMs: 0, status: 'noop' };
}

export const noopAiProvider: LabAiProvider = {
  async analyzeEmail() {
    return { classification: 'OTHER', summary: '', log: noopLog() };
  },
  async extractPurchaseOrder() {
    return { quoteRef: null, log: noopLog() };
  },
  async analyzeSupplierQuote() {
    return { amount: null, log: noopLog() };
  },
  async detectResultAnomalies() {
    return { anomalies: [], log: noopLog() };
  },
  async translateToEnglish(input) {
    return { text: input, log: noopLog() };
  },
  async summarizeCase() {
    return { summary: '', log: noopLog() };
  },
};

export function getAiProvider(): LabAiProvider {
  return noopAiProvider;
}
