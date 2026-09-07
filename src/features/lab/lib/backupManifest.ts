export function buildBackupManifest(input: {
  organizationId: string;
  tables: string[];
  buckets: string[];
  createdAt?: string;
}) {
  return {
    kind: 'weekly_drive',
    organization_id: input.organizationId,
    created_at: input.createdAt ?? new Date().toISOString(),
    postgres: { schema: 'lab', tables: input.tables },
    storage: { buckets: input.buckets, mode: 'inventory' },
    restore_doc: 'docs/RESTORE_TEST.md',
  };
}

export const LAB_BACKUP_TABLES = [
  'organizations', 'client_requests', 'quotes', 'purchase_orders',
  'samples', 'analysis_results', 'reports', 'client_invoices', 'audit_logs',
  'client_calls', 'regulatory_proposals', 'regulatory_texts',
  'sample_categories', 'sample_subcategories', 'sample_products', 'request_drafts',
];

export const LAB_BACKUP_BUCKETS = [
  'lab-client-documents', 'lab-results', 'lab-reports', 'lab-invoices',
];
