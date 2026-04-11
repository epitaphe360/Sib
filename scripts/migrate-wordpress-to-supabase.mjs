/**
 * Script de migration WordPress → Supabase
 * Importe articles, médias et pages WordPress dans Supabase
 * 
 * Usage: node scripts/migrate-wordpress-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const WP_API_URL = 'https://siportevent.com/wp-json/wp/v2';
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// =====================================================
// UTILITAIRES
// =====================================================

function cleanHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .trim();
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// =====================================================
// MIGRATION ARTICLES
// =====================================================

async function migrateArticles() {
  console.log('\n📰 Migration des articles WordPress...');
  
  try {
    // Récupérer tous les articles WordPress
    const response = await fetch(`${WP_API_URL}/posts?per_page=100&_embed`);
    const wpArticles = await response.json();
    
    console.log(`   ✓ ${wpArticles.length} articles trouvés sur WordPress`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of wpArticles) {
      try {
        const articleData = {
          title: article.title.rendered,
          slug: article.slug || generateSlug(article.title.rendered),
          excerpt: article.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 300),
          content: cleanHtml(article.content.rendered),
          featured_image: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          category: article._embedded?.['wp:term']?.[0]?.[0]?.name || 'actualite',
          published_at: article.date,
          is_published: article.status === 'publish',
          views: 0
        };
        
        // Insérer dans Supabase
        const { data, error } = await supabase
          .from('news_articles')
          .upsert(articleData, { onConflict: 'slug' });
        
        if (error) throw error;
        
        // Insérer les tags
        if (article._embedded?.['wp:term']?.[1]) {
          const tags = article._embedded['wp:term'][1];
          for (const tag of tags) {
            await supabase
              .from('article_tags')
              .insert({
                article_id: data?.[0]?.id,
                tag: tag.name
              })
              .onConflict(['article_id', 'tag'])
              .ignore();
          }
        }
        
        successCount++;
        console.log(`   ✓ "${article.title.rendered.substring(0, 50)}..."`);
        
      } catch (err) {
        errorCount++;
        console.error(`   ✗ Erreur: ${err.message}`);
      }
    }
    
    console.log(`\n   📊 ${successCount} articles migrés, ${errorCount} erreurs\n`);
    
  } catch (error) {
    console.error(`   ✗ Erreur globale: ${error.message}`);
  }
}

// =====================================================
// MIGRATION MÉDIAS
// =====================================================

async function migrateMedia() {
  console.log('\n📸 Migration des médias WordPress...');
  
  try {
    // Récupérer tous les médias WordPress
    const response = await fetch(`${WP_API_URL}/media?per_page=100`);
    const wpMedia = await response.json();
    
    console.log(`   ✓ ${wpMedia.length} médias trouvés sur WordPress`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const media of wpMedia) {
      try {
        const mediaData = {
          title: media.title.rendered,
          description: media.caption.rendered.replace(/<[^>]*>/g, ''),
          media_type: media.media_type,
          file_url: media.source_url,
          thumbnail_url: media.media_details?.sizes?.medium?.source_url || media.source_url,
          alt_text: media.alt_text || media.title.rendered,
          mime_type: media.mime_type,
          file_size: media.media_details?.filesize || null,
          is_public: true,
          views: 0,
          metadata: {
            width: media.media_details?.width || null,
            height: media.media_details?.height || null
          }
        };
        
        // Insérer dans Supabase
        const { error } = await supabase
          .from('media_library')
          .insert(mediaData);
        
        if (error && error.code !== '23505') throw error; // Ignorer duplicates
        
        successCount++;
        console.log(`   ✓ "${media.title.rendered.substring(0, 50)}..."`);
        
      } catch (err) {
        errorCount++;
        console.error(`   ✗ Erreur: ${err.message}`);
      }
    }
    
    console.log(`\n   📊 ${successCount} médias migrés, ${errorCount} erreurs\n`);
    
  } catch (error) {
    console.error(`   ✗ Erreur globale: ${error.message}`);
  }
}

// =====================================================
// MIGRATION PAGES
// =====================================================

async function migratePages() {
  console.log('\n📄 Migration des pages WordPress...');
  
  try {
    // Récupérer toutes les pages WordPress
    const response = await fetch(`${WP_API_URL}/pages?per_page=100`);
    const wpPages = await response.json();
    
    console.log(`   ✓ ${wpPages.length} pages trouvées sur WordPress`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const page of wpPages) {
      try {
        const pageData = {
          slug: page.slug || generateSlug(page.title.rendered),
          title: page.title.rendered,
          content: cleanHtml(page.content.rendered),
          excerpt: page.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 200),
          is_published: page.status === 'publish',
          views: 0
        };
        
        // Insérer dans Supabase
        const { error } = await supabase
          .from('static_pages')
          .upsert(pageData, { onConflict: 'slug' });
        
        if (error) throw error;
        
        successCount++;
        console.log(`   ✓ "${page.title.rendered.substring(0, 50)}..."`);
        
      } catch (err) {
        errorCount++;
        console.error(`   ✗ Erreur: ${err.message}`);
      }
    }
    
    console.log(`\n   📊 ${successCount} pages migrées, ${errorCount} erreurs\n`);
    
  } catch (error) {
    console.error(`   ✗ Erreur globale: ${error.message}`);
  }
}

// =====================================================
// EXÉCUTION PRINCIPALE
// =====================================================

async function main() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MIGRATION WORDPRESS → SUPABASE');
  console.log('  SIPORTS 2026 - Contenu Site Vitrine');
  console.log('═══════════════════════════════════════════════════════');
  
  console.log('\n✅ Connexion à Supabase établie');
  console.log('📡 URL:', process.env.VITE_SUPABASE_URL);
  
  // Exécuter les migrations
  await migrateArticles();
  await migrateMedia();
  await migratePages();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✅ MIGRATION TERMINÉE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('💡 Prochaines étapes:');
  console.log('   1. Vérifier les données dans Supabase Dashboard');
  console.log('   2. Tester les nouvelles sections sur la HomePage');
  console.log('   3. Désactiver WordPress une fois validation faite\n');
}

main().catch(console.error);
