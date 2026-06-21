#!/usr/bin/env node
/**
 * Met à jour le plan hall SIB depuis un PDF.
 * Usage: node scripts/update-floor-plan.mjs [chemin/vers/plan.pdf]
 */
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(root, '.env') });

function resolvePdfPath(arg) {
  if (arg && existsSync(arg)) return arg;
  try {
    const out = execSync(
      "powershell -NoProfile -Command \"Get-ChildItem -Path $env:LOCALAPPDATA\\Packages\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\\LocalState\\sessions\\*\\transfers\\*\\Plan*SIB*Com F.pdf -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch '\\(1\\)' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName\"",
      { encoding: 'utf8' },
    ).trim();
    if (out && existsSync(out)) return out;
  } catch {
    // ignore
  }
  return null;
}

const pdfPath = resolvePdfPath(process.argv[2]);
if (!pdfPath) {
  console.error('❌ PDF introuvable. Passez le chemin en argument.');
  process.exit(1);
}

const jpgOut = join(root, 'apps/mobile/assets/images/plan.jpg');
const py = `import fitz; doc=fitz.open(${JSON.stringify(pdfPath)}); pix=doc[0].get_pixmap(matrix=fitz.Matrix(2.5,2.5), alpha=False); pix.save(${JSON.stringify(jpgOut)}); print(pix.width, pix.height)`;
execSync(`python -c ${JSON.stringify(py)}`, { stdio: 'inherit' });
console.log('✅ plan.jpg mis à jour');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (url && key) {
  const supabase = createClient(url, key);
  const jpg = readFileSync(jpgOut);
  const storagePath = 'sib/2026/plan-general-sib.jpg';
  const { error: upErr } = await supabase.storage
    .from('salon-assets')
    .upload(storagePath, jpg, { contentType: 'image/jpeg', upsert: true });
  if (upErr) {
    console.warn('⚠️ Upload storage:', upErr.message);
  } else {
    const { data } = supabase.storage.from('salon-assets').getPublicUrl(storagePath);
    const { error: dbErr } = await supabase
      .from('salons')
      .update({ floor_plan_url: data.publicUrl })
      .eq('slug', 'sib');
    if (dbErr) console.warn('⚠️ DB:', dbErr.message);
    else console.log('✅ floor_plan_url Supabase:', data.publicUrl);
  }
}
