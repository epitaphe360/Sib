export type ExecutionChannel = 'INTERNAL' | 'SUBCONTRACTED' | 'MIXTE';

export function deriveExecutionChannel(internal: string, subcontracted: string): ExecutionChannel {
  const hasIn = internal.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).length > 0;
  const hasOut = subcontracted.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).length > 0;
  if (hasIn && hasOut) return 'MIXTE';
  if (hasIn) return 'INTERNAL';
  return 'SUBCONTRACTED';
}

export function supplierLanguage(channel: ExecutionChannel): 'fr' | 'en' {
  return channel === 'INTERNAL' ? 'fr' : 'en';
}

export function nextStatusAfterQualify(channel: ExecutionChannel): 'WAITING_SUPPLIER_QUOTES' | 'CLIENT_QUOTE_DRAFT' {
  return channel === 'INTERNAL' ? 'CLIENT_QUOTE_DRAFT' : 'WAITING_SUPPLIER_QUOTES';
}
