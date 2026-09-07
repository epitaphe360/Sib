import { useState } from 'react';
import { signedLabUrl, uploadLabFile, LAB_BUCKETS } from '../lib/labStorage';

export function LabFileField({
  organizationId,
  bucket,
  entityType,
  entityId,
  label,
}: {
  organizationId: string;
  bucket: (typeof LAB_BUCKETS)[number];
  entityType: string;
  entityId?: string;
  label: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type="file"
        className="block text-sm"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setError(null);
          try {
            const path = await uploadLabFile({ organizationId, bucket, file, entityType, entityId });
            setUrl(await signedLabUrl(bucket, path));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload impossible');
          }
        }}
      />
      {url && <a className="text-xs text-cyan-700 underline" href={url} target="_blank" rel="noreferrer">Ouvrir (URL signée 60 s)</a>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
