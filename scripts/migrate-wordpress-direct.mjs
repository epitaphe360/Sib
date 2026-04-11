#!/usr/bin/env node

/**
 * MIGRATION WORDPRESS → SUPABASE (API REST Directe)
 * Évite les problèmes de cache du SDK JS
 */

import 'dotenv/config';

const WORDPRESS_API = 'https://siportevent.com/wp-json/wp/v2';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement manquantes (SERVICE_ROLE_KEY requise)');
  process.exit(1);
}

// Headers pour l'API Supabase (service_role bypasse RLS)
const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal,resolution=merge-duplicates'
};

/**
 * Nettoie le HTML WordPress
 */
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * Crée un slug à partir d'un titre
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Migration des articles
 */
async function migrateArticles() {
  console.log('\n📰 Migration des articles WordPress...');
  
  try {
    // Récupérer les articles WordPress
    const response = await fetch(`${WORDPRESS_API}/posts?per_page=100`);
    const articles = await response.json();
    
    console.log(`   ✓ ${articles.length} articles trouvés sur WordPress`);
    
    let success = 0;
    let errors = 0;
    
    for (const article of articles) {
      try {
        // Récupérer l'image featured
        let featuredImage = null;
        if (article.featured_media) {
          const mediaRes = await fetch(`${WORDPRESS_API}/media/${article.featured_media}`);
          const media = await mediaRes.json();
          featuredImage = media.source_url;
        }
        
        // Préparer les données (colonnes réelles de la table news_articles)
        const data = {
          title: article.title?.rendered || 'Sans titre',
          slug: article.slug || createSlug(article.title?.rendered || ''),
          excerpt: cleanHtml(article.excerpt?.rendered),
          content: cleanHtml(article.content?.rendered),
          featured_image: featuredImage,
          category: 'actualite',
          published_at: article.date || new Date().toISOString(),
          is_published: article.status === 'publish',
          meta_description: article.excerpt?.rendered ? 
            cleanHtml(article.excerpt?.rendered).substring(0, 160) : null,
          views: 0
        };
        
        // Insérer via API REST
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/news_articles`, {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify(data)
        });
        
        if (insertRes.ok) {
          success++;
          console.log(`   ✓ Article migré: ${data.title.substring(0, 50)}...`);
        } else {
          errors++;
          const error = await insertRes.text();
          console.log(`   ✗ Erreur: ${error.substring(0, 100)}`);
        }
        
      } catch (err) {
        errors++;
        console.log(`   ✗ Erreur: ${err.message}`);
      }
      
      // Pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n   📊 ${success} articles migrés, ${errors} erreurs`);
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

/**
 * Migration des médias
 */
async function migrateMedia() {
  console.log('\n\n📸 Migration des médias WordPress...');
  
  try {
    const response = await fetch(`${WORDPRESS_API}/media?per_page=100`);
    const mediaList = await response.json();
    
    console.log(`   ✓ ${mediaList.length} médias trouvés sur WordPress`);
    
    let success = 0;
    let errors = 0;
    
    for (const media of mediaList) {
      try {
        const data = {
          title: media.title?.rendered || 'Sans titre',
          description: cleanHtml(media.caption?.rendered),
          file_url: media.source_url,
          mime_type: media.mime_type,
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
          headers: supabaseHeaders,
          body: JSON.stringify(data)
        });
        
        if (insertRes.ok) {
          success++;
          console.log(`   ✓ Média migré: ${data.title.substring(0, 50)}...`);
        } else {
          errors++;
          const error = await insertRes.text();
          console.log(`   ✗ Erreur: ${error.substring(0, 100)}`);
        }
        
      } catch (err) {
        errors++;
        console.log(`   ✗ Erreur: ${err.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n   📊 ${success} médias migrés, ${errors} erreurs`);
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

/**
 * Migration des pages statiques
 */
async function migratePages() {
  console.log('\n\n📄 Migration des pages WordPress...');
  
  try {
    const response = await fetch(`${WORDPRESS_API}/pages?per_page=100`);
    const pages = await response.json();
    
    console.log(`   ✓ ${pages.length} pages trouvées sur WordPress`);
    
    let success = 0;
    let errors = 0;
    
    for (const page of pages) {
      try {
        const data = {
          title: page.title?.rendered || 'Sans titre',
          slug: page.slug || createSlug(page.title?.rendered || ''),
          content: cleanHtml(page.content?.rendered),
          meta_description: page.excerpt?.rendered ? 
            cleanHtml(page.excerpt?.rendered).substring(0, 160) : null,
          is_published: page.status === 'publish'
        };
        
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/static_pages`, {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify(data)
        });
        
        if (insertRes.ok) {
          success++;
          console.log(`   ✓ Page migrée: ${data.title.substring(0, 50)}...`);
        } else {
          errors++;
          const error = await insertRes.text();
          console.log(`   ✗ Erreur: ${error.substring(0, 100)}`);
        }
        
      } catch (err) {
        errors++;
        console.log(`   ✗ Erreur: ${err.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n   📊 ${success} pages migrées, ${errors} erreurs`);
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MIGRATION WORDPRESS → SUPABASE (API REST)');
  console.log('  SIPORTS 2026 - Contenu Site Vitrine');
  console.log('═══════════════════════════════════════════════════════');
  
  console.log('\n✅ Configuration:');
  console.log('📡 Supabase:', SUPABASE_URL);
  console.log('📡 WordPress:', WORDPRESS_API);
  
  await migrateArticles();
  await migrateMedia();
  await migratePages();
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✅ MIGRATION TERMINÉE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n');
}

main().catch(console.error);
