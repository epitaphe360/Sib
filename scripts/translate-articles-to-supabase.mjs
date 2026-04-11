/**
 * Script pour traduire tous les articles FR → EN et les stocker dans Supabase
 * Utilisation: node scripts/translate-articles-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzAwMjIsImV4cCI6MjA1MjM0NjAyMn0.uEfg2dUgbUeZgRzXo3AaB5MYzHdXD8LBZB7y_hPWC5M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Traduit un texte avec MyMemory API
 */
async function translateText(text, targetLang = 'en') {
  if (!text || text.trim() === '') return '';
  
  // Découper en morceaux de 400 caractères
  const chunks = splitText(text, 400);
  const translatedChunks = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    if (chunk.trim() === '') {
      translatedChunks.push(chunk);
      continue;
    }
    
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=fr|${targetLang}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const translated = data?.responseData?.translatedText || chunk;
        translatedChunks.push(translated);
      } else {
        console.warn(`⚠️  API error for chunk ${i + 1}, keeping original`);
        translatedChunks.push(chunk);
      }
      
      // Délai pour éviter rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`❌ Translation error for chunk ${i + 1}:`, error.message);
      translatedChunks.push(chunk);
    }
  }
  
  return translatedChunks.join(' ');
}

/**
 * Divise un texte en morceaux
 */
function splitText(text, maxLength = 400) {
  if (!text || text.length <= maxLength) return [text];
  
  const chunks = [];
  const sentences = text.split(/([.!?]\s+)/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Démarrage de la traduction des articles...\n');
  
  // 1. Vérifier si les colonnes EN existent
  console.log('📋 Étape 1: Vérification de la structure de la table...');
  const { data: articles, error: fetchError } = await supabase
    .from('news_articles')
    .select('id, title, excerpt, content, title_en, excerpt_en, content_en')
    .limit(1);
  
  if (fetchError) {
    console.error('❌ Erreur:', fetchError.message);
    console.log('\n⚠️  Les colonnes title_en, excerpt_en, content_en n\'existent probablement pas.');
    console.log('\n📝 Exécutez d\'abord cette migration SQL dans Supabase:\n');
    console.log('ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS title_en TEXT;');
    console.log('ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS excerpt_en TEXT;');
    console.log('ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content_en TEXT;\n');
    process.exit(1);
  }
  
  console.log('✅ Structure de table OK\n');
  
  // 2. Récupérer tous les articles
  console.log('📥 Étape 2: Récupération des articles...');
  const { data: allArticles, error: getAllError } = await supabase
    .from('news_articles')
    .select('id, title, excerpt, content, title_en')
    .order('created_at', { ascending: false });
  
  if (getAllError) {
    console.error('❌ Erreur:', getAllError.message);
    process.exit(1);
  }
  
  console.log(`✅ ${allArticles.length} articles trouvés\n`);
  
  // 3. Traduire et mettre à jour chaque article
  console.log('🌐 Étape 3: Traduction des articles...\n');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < allArticles.length; i++) {
    const article = allArticles[i];
    console.log(`\n[${i + 1}/${allArticles.length}] Article: ${article.title.substring(0, 60)}...`);
    
    // Skip si déjà traduit
    if (article.title_en && article.title_en.trim() !== '') {
      console.log('  ⏭️  Déjà traduit, skip');
      skipCount++;
      continue;
    }
    
    try {
      console.log('  🔄 Traduction du titre...');
      const titleEn = await translateText(article.title, 'en');
      
      console.log('  🔄 Traduction de l\'extrait...');
      const excerptEn = await translateText(article.excerpt, 'en');
      
      console.log('  🔄 Traduction du contenu...');
      const contentEn = await translateText(article.content, 'en');
      
      // Mise à jour dans Supabase
      console.log('  💾 Sauvegarde dans Supabase...');
      const { error: updateError } = await supabase
        .from('news_articles')
        .update({
          title_en: titleEn,
          excerpt_en: excerptEn,
          content_en: contentEn
        })
        .eq('id', article.id);
      
      if (updateError) {
        console.error('  ❌ Erreur de sauvegarde:', updateError.message);
        errorCount++;
      } else {
        console.log('  ✅ Traduit et sauvegardé!');
        successCount++;
      }
      
      // Pause entre articles pour éviter rate limiting
      if (i < allArticles.length - 1) {
        console.log('  ⏳ Pause 2s...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error('  ❌ Erreur:', error.message);
      errorCount++;
    }
  }
  
  // 4. Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ:');
  console.log('='.repeat(60));
  console.log(`✅ Succès:       ${successCount}`);
  console.log(`⏭️  Déjà traduit: ${skipCount}`);
  console.log(`❌ Erreurs:      ${errorCount}`);
  console.log(`📝 Total:        ${allArticles.length}`);
  console.log('='.repeat(60) + '\n');
  
  if (successCount > 0) {
    console.log('🎉 Traductions enregistrées dans Supabase!');
    console.log('👉 Prochaine étape: Modifier le code pour utiliser title_en/excerpt_en/content_en\n');
  }
}

// Exécution
main().catch(console.error);
