#!/usr/bin/env node

/**
 * MIGRATION MÉDIAS UNIQUEMENT (articles et pages déjà migrés)
 */
import 'dotenv/config';

const WORDPRESS_API = 'https://siportevent.com/wp-json/wp/v2';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

function cleanHtml(html) {
  if (!html) return '';
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '').trim();
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  MIGRATION MÉDIAS WORDPRESS → SUPABASE');
  console.log('═══════════════════════════════════════════════════════\n');

  // Récupérer les médias WordPress (paginer si besoin)
  let allMedia = [];
  let page = 1;
  
  while (true) {
    const res = await fetch(`${WORDPRESS_API}/media?per_page=100&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    allMedia = allMedia.concat(data);
    page++;
  }
  
  console.log(`📸 ${allMedia.length} médias trouvés sur WordPress\n`);

  let success = 0;
  let errors = 0;

  for (const media of allMedia) {
    try {
      const data = {
        title: media.title?.rendered || 'Sans titre',
        description: cleanHtml(media.caption?.rendered) || null,
        file_url: media.source_url,
        mime_type: media.mime_type || null,
        width: media.media_details?.width || null,
        height: media.media_details?.height || null,
        file_size: media.media_details?.filesize || null,
        media_type: media.mime_type?.startsWith('image/') ? 'image' : 
                    media.mime_type?.startsWith('video/') ? 'video' : 'document',
        is_featured: false,
        is_public: true,
        alt_text: media.alt_text || null
      };

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/media_library`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (insertRes.ok) {
        success++;
        console.log(`   ✓ ${data.title.substring(0, 60)}`);
      } else {
        errors++;
        const err = await insertRes.text();
        console.log(`   ✗ ${err.substring(0, 120)}`);
      }
    } catch (err) {
      errors++;
      console.log(`   ✗ ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  📊 RÉSULTAT: ${success} médias migrés, ${errors} erreurs`);
  console.log(`═══════════════════════════════════════════════════════\n`);
}

main().catch(console.error);
