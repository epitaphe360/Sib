export function formatSampleCode(input: {
  sequence: number;
  year?: number;
  product: string;
  pattern?: string;
}): string {
  const year = input.year ?? new Date().getFullYear();
  const seq = String(Math.floor(input.sequence)).padStart(6, '0');
  const product = input.product
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase()
    .slice(0, 24) || 'PRODUIT';
  const pattern = input.pattern ?? 'ECH-{seq}-{year}-{product}';
  return pattern
    .replace('{seq}', seq)
    .replace('{year}', String(year))
    .replace('{product}', product);
}
