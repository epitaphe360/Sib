import {
  heuristicClassifyEmail,
  heuristicDetectAnomalies,
  heuristicExtractAmount,
  heuristicExtractQuoteRef,
  heuristicTranslateToEnglish,
} from './aiHeuristics';

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

function log(status: AiJobLog['status'], started: number): AiJobLog {
  return { provider: 'heuristic', model: 'rules-v1', durationMs: Date.now() - started, status, costEstimate: 0 };
}

export const heuristicAiProvider: LabAiProvider = {
  async analyzeEmail(input) {
    const started = Date.now();
    const classification = heuristicClassifyEmail(input);
    return { classification, summary: classification, log: log('ok', started) };
  },
  async extractPurchaseOrder(input) {
    const started = Date.now();
    return { quoteRef: heuristicExtractQuoteRef(input), log: log('ok', started) };
  },
  async analyzeSupplierQuote(input) {
    const started = Date.now();
    return { amount: heuristicExtractAmount(input), log: log('ok', started) };
  },
  async detectResultAnomalies(input) {
    const started = Date.now();
    return { anomalies: heuristicDetectAnomalies(input), log: log('ok', started) };
  },
  async translateToEnglish(input) {
    const started = Date.now();
    return { text: heuristicTranslateToEnglish(input), log: log('ok', started) };
  },
  async summarizeCase(input) {
    const started = Date.now();
    return { summary: input.slice(0, 280), log: log('ok', started) };
  },
};

export function getAiProvider(): LabAiProvider {
  return heuristicAiProvider;
}
