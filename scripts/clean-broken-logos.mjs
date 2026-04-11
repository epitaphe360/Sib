import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        const contentType = res.headers['content-type'] || '';
        const isImage = contentType.includes('image') || contentType.includes('svg');
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, isImage });
        res.destroy();
      });
      req.on('error', () => resolve({ ok: false }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
    } catch {
      resolve({ ok: false });
    }
  });
}

const { data } = await supabase
  .from('exhibitors')
  .select('id, company_name, logo_url')
  .order('company_name');

console.log(`\nNettoyage des logos cassés...\n`);

let cleaned = 0;

for (const e of data) {
  if (!e.logo_url) continue;
  
  const result = await checkUrl(e.logo_url);
  
  if (!result.ok || !result.isImage) {
    console.log(`🧹 ${e.company_name} — suppression du logo cassé`);
    
    const { error } = await supabase
      .from('exhibitors')
      .update({ logo_url: null })
      .eq('id', e.id);
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      cleaned++;
    }
  } else {
    console.log(`✅ ${e.company_name} — logo OK`);
  }
}

console.log(`\n--- ${cleaned} logos cassés nettoyés ---`);
console.log(`Les exposants sans logo afficheront maintenant leurs initiales proprement.`);
console.log(`Vous pouvez ajouter les vrais logos depuis le tableau de bord.`);
