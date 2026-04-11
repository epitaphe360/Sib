import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import https from 'https'
import http from 'http'

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImageUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, { timeout: 5000 }, (res) => {
      resolve({
        success: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        contentType: res.headers['content-type']
      });
    }).on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    }).on('timeout', () => {
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function testMediaImages() {
  console.log('🔍 Test des URLs des images depuis Supabase...\n');
  
  const { data: media, error } = await supabase
    .from('media_library')
    .select('id, title, file_url')
    .eq('media_type', 'image')
    .limit(5);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!media || media.length === 0) {
    console.log('⚠️  Aucun média trouvé');
    return;
  }

  console.log(`📊 Test de ${media.length} images:\n`);
  
  for (const item of media) {
    console.log(`🖼️  ${item.title}`);
    console.log(`   URL: ${item.file_url}`);
    
    const result = await testImageUrl(item.file_url);
    
    if (result.success) {
      console.log(`   ✅ Accessible (${result.status}) - ${result.contentType}`);
    } else {
      console.log(`   ❌ Erreur: ${result.error || `Status ${result.status}`}`);
    }
    console.log('');
  }
}

testMediaImages();
