/**
 * Weekly lab backup inventory. Does not embed secrets.
 * Writes scripts/output/lab-backup-manifest.json and a backup_runs row when admin creds exist.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createSupabaseServerClient } = require('../server/supabaseNodeClient.cjs');

const TABLES = [
  'organizations', 'client_requests', 'quotes', 'purchase_orders',
  'samples', 'analysis_results', 'reports', 'client_invoices', 'audit_logs',
];
const BUCKETS = ['lab-client-documents', 'lab-results', 'lab-reports', 'lab-invoices'];

export function buildManifest(organizationId) {
  return {
    kind: 'weekly_drive',
    organization_id: organizationId,
    created_at: new Date().toISOString(),
    postgres: { schema: 'lab', tables: TABLES },
    storage: { buckets: BUCKETS, mode: 'inventory' },
    restore_doc: 'docs/RESTORE_TEST.md',
  };
}

async function main() {
  const outDir = path.join(process.cwd(), 'scripts/output');
  fs.mkdirSync(outDir, { recursive: true });
  const org = process.env.LAB_BACKUP_ORG_ID || 'elitech';
  const manifest = buildManifest(org);
  const file = path.join(outDir, 'lab-backup-manifest.json');
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key && process.env.LAB_BACKUP_ORG_UUID) {
    const supabase = createSupabaseServerClient(url, key);
    await supabase.schema('lab').from('backup_runs').insert({
      organization_id: process.env.LAB_BACKUP_ORG_UUID,
      kind: 'weekly_drive',
      status: 'planned',
      notes: `manifest ${file}`,
    });
  }
  let drive = null;
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  const folder = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (token) {
    const boundary = `lab${Date.now()}`;
    const meta = JSON.stringify({
      name: `lab-backup-${new Date().toISOString().slice(0, 10)}.json`,
      parents: folder ? [folder] : undefined,
    });
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(manifest)}\r\n--${boundary}--`;
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    drive = { ok: res.ok, status: res.status };
    if (url && key && process.env.LAB_BACKUP_ORG_UUID) {
      const supabase = createSupabaseServerClient(url, key);
      await supabase.schema('lab').from('backup_runs').insert({
        organization_id: process.env.LAB_BACKUP_ORG_UUID,
        kind: 'weekly_drive',
        status: res.ok ? 'tested' : 'failed',
        notes: `drive ${res.status}`,
      });
    }
  }
  console.log(JSON.stringify({ ok: true, file, drive }));
}

const isMain = process.argv[1] && process.argv[1].endsWith('lab-backup.mjs');
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
