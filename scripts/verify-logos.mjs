import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        const contentType = res.headers['content-type'] || '';
        const isImage = contentType.includes('image') || contentType.includes('svg');
        resolve({ 
          ok: res.statusCode >= 200 && res.statusCode < 400, 
          status: res.statusCode,
          contentType,
          isImage
        });
        res.destroy();
      });
      req.on('error', (err) => resolve({ ok: false, status: 0, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'timeout' }); });
    } catch (e) {
      resolve({ ok: false, status: 0, error: e.message });
    }
  });
}

const { data } = await supabase
  .from('exhibitors')
  .select('id, company_name, logo_url')
  .order('company_name');

console.log(`\nVérification de ${data.length} logos...\n`);

let working = 0;
let broken = 0;
const brokenList = [];

for (const e of data) {
  if (!e.logo_url) {
    console.log(`❌ ${e.company_name} | PAS DE LOGO`);
    broken++;
    brokenList.push(e);
    continue;
  }
  
  const result = await checkUrl(e.logo_url);
  const isFavicon = e.logo_url.includes('google.com/s2/favicons');
  
  if (result.ok && result.isImage) {
    console.log(`✅ ${e.company_name} | ${result.status} ${result.contentType}${isFavicon ? ' ⚠️ FAVICON' : ''}`);
    if (isFavicon) {
      brokenList.push({ ...e, reason: 'favicon' });
    }
    working++;
  } else {
    console.log(`❌ ${e.company_name} | ${result.status} ${result.contentType || result.error || 'NO_IMAGE'} | ${e.logo_url.substring(0, 80)}`);
    broken++;
    brokenList.push(e);
  }
}

console.log(`\n--- Résumé ---`);
console.log(`Fonctionnels: ${working}`);
console.log(`Cassés: ${broken}`);
console.log(`\nLogos cassés ou favicons:`);
brokenList.forEach(e => console.log(`  - ${e.company_name}: ${e.logo_url?.substring(0, 80) || 'NULL'}`));
