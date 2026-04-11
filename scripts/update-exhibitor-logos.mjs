import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour vérifier si une URL est accessible
function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 8000 }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      res.destroy();
    });
    req.on('error', () => resolve({ ok: false, status: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0 }); });
  });
}

// Clearbit Logo API - donne de vrais logos HD pour les domaines connus
function getClearbitLogoUrl(website) {
  if (!website) return null;
  try {
    const url = new URL(website);
    return `https://logo.clearbit.com/${url.hostname}?size=200`;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🔍 Récupération des exposants...\n');

  const { data: exhibitors, error } = await supabase
    .from('exhibitors')
    .select('id, company_name, logo_url, website');

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  const faviconExhibitors = exhibitors.filter(e => e.logo_url && e.logo_url.includes('favicon'));
  const noLogoExhibitors = exhibitors.filter(e => !e.logo_url);
  const toProcess = [...faviconExhibitors, ...noLogoExhibitors];

  console.log(`📊 Total: ${exhibitors.length} exposants`);
  console.log(`   - Avec favicons à remplacer: ${faviconExhibitors.length}`);
  console.log(`   - Sans logo: ${noLogoExhibitors.length}\n`);

  let updated = 0;
  let failed = 0;

  for (const exhibitor of toProcess) {
    let newLogoUrl = null;
    let source = '';

    // 1. Essayer Clearbit Logo API (vrais logos HD)
    if (exhibitor.website) {
      const clearbitUrl = getClearbitLogoUrl(exhibitor.website);
      if (clearbitUrl) {
        const check = await checkUrl(clearbitUrl);
        if (check.ok) {
          newLogoUrl = clearbitUrl;
          source = 'Clearbit';
        }
      }
    }

    // 2. Fallback: Google Favicon haute résolution (256px)
    if (!newLogoUrl && exhibitor.website) {
      try {
        const domain = new URL(exhibitor.website).hostname.replace('www.', '');
        newLogoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
        source = 'Favicon HD (256px)';
      } catch {}
    }

    if (newLogoUrl && newLogoUrl !== exhibitor.logo_url) {
      const { error: updateError } = await supabase
        .from('exhibitors')
        .update({ logo_url: newLogoUrl })
        .eq('id', exhibitor.id);

      if (updateError) {
        console.log(`❌ ${exhibitor.company_name}: Erreur - ${updateError.message}`);
        failed++;
      } else {
        console.log(`✅ ${exhibitor.company_name}: Logo mis à jour (${source})`);
        updated++;
      }
    } else if (!newLogoUrl) {
      console.log(`⚠️ ${exhibitor.company_name}: Aucun logo trouvé`);
      failed++;
    } else {
      console.log(`⏭️ ${exhibitor.company_name}: Déjà OK`);
    }
  }

  console.log(`\n📊 Résultat: ${updated} mis à jour, ${failed} échoués`);
}

main().catch(console.error);
