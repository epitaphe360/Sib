import { getLabClient, labSchema } from '../services/labClient';

export const LAB_BUCKETS = [
  'lab-client-documents',
  'lab-supplier-documents',
  'lab-purchase-orders',
  'lab-samples',
  'lab-results',
  'lab-reports',
  'lab-invoices',
] as const;

const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const MAX_BYTES = 50 * 1024 * 1024;

export function assertLabFile(file: File) {
  if (!ALLOWED.has(file.type)) throw new Error('Type de fichier refusé');
  if (file.size > MAX_BYTES) throw new Error('Fichier trop volumineux (50 Mo)');
}

export async function uploadLabFile(input: {
  organizationId: string;
  bucket: (typeof LAB_BUCKETS)[number];
  file: File;
  entityType?: string;
  entityId?: string;
}) {
  assertLabFile(input.file);
  const safe = input.file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80);
  const path = `${input.organizationId}/${crypto.randomUUID()}-${safe}`;
  const { error } = await getLabClient().storage.from(input.bucket).upload(path, input.file, {
    upsert: false,
    contentType: input.file.type,
  });
  if (error) throw error;
  const { error: metaErr } = await labSchema().from('files').insert({
    organization_id: input.organizationId,
    bucket: input.bucket,
    path,
    mime_type: input.file.type,
    size_bytes: input.file.size,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
  });
  if (metaErr) throw metaErr;
  return path;
}

export async function signedLabUrl(bucket: string, path: string, expires = 60) {
  const { data, error } = await getLabClient().storage.from(bucket).createSignedUrl(path, expires);
  if (error) throw error;
  return data.signedUrl;
}
