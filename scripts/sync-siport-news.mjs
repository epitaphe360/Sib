import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import https from 'https';

// Désactiver la vérification SSL pour ce script (seulement pour le développement)
const agent = new https.Agent({  
  rejectUnauthorized: false
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const NEWS_URL = 'https://sib2026.ma/actualite-portuaire/';
const MAX_PAGES = 5; // Nombre maximum de pages à scraper

async function scrapeArticleContent(url) {
  try {
    console.log(`  🔗 Fetching full content from: ${url.substring(0, 60)}...`);
    
    const response = await fetch(url, {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const root = parse(html);
    
    // Extraire le contenu complet de l'article
    let fullContent = '';
    const contentSelectors = [
      '.elementor-widget-theme-post-content',
      'article .entry-content',
      '.post-content',
      'article p',
      '.elementor-text-editor'
    ];
    
    for (const selector of contentSelectors) {
      const contentElements = root.querySelectorAll(selector);
      if (contentElements.length > 0) {
        fullContent = contentElements.map(el => el.textContent?.trim() || '').join('\n\n');
        if (fullContent.length > 100) break;
      }
    }
    
    // Extraire toutes les images de l'article
    const images = [];
    const imgElements = root.querySelectorAll('article img, .entry-content img, .elementor-widget-image img');
    imgElements.forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        images.push(src);
      }
    });
    
    return {
      content: fullContent || '',
      images
    };
  } catch (error) {
    console.error(`  ⚠️  Error fetching article content:`, error.message);
    return { content: '', images: [] };
  }
}

async function scrapeArticles() {
  console.log('🔍 Fetching articles from:', NEWS_URL);
  console.log(`📄 Checking up to ${MAX_PAGES} pages...\n`);
  
  const allArticles = [];
  let pageNum = 1;
  
  try {
    // Parcourir les pages de pagination
    while (pageNum <= MAX_PAGES) {
      const pageUrl = pageNum === 1 ? NEWS_URL : `${NEWS_URL}page/${pageNum}/`;
      console.log(`📄 Page ${pageNum}: ${pageUrl}`);
      
      try {
        const response = await fetch(pageUrl, {
          agent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        // Si la page n'existe pas, arrêter
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`  ℹ️  Page ${pageNum} not found - stopping pagination\n`);
            break;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const root = parse(html);
        
        // Trouver tous les articles
        const articleElements = root.querySelectorAll('article.elementor-post');
        
        if (articleElements.length === 0) {
          console.log(`  ℹ️  No articles found on page ${pageNum} - stopping\n`);
          break;
        }
        
        console.log(`  📰 Found ${articleElements.length} articles on page ${pageNum}`);

        for (const article of articleElements) {
          try {
            // Titre
            const titleElement = article.querySelector('.elementor-post__title a');
            const title = titleElement?.textContent?.trim() || '';
            const url = titleElement?.getAttribute('href') || '';

            // Vérifier si l'article n'est pas déjà dans la liste
            if (allArticles.some(a => a.url === url)) {
              console.log(`  ⏭️  Skipping duplicate: ${title.substring(0, 40)}...`);
              continue;
            }

            // Image principale
            const imgElement = article.querySelector('img');
            const mainImage = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src') || '';

            // Extrait
            const excerptElement = article.querySelector('.elementor-post__excerpt p');
            const excerpt = excerptElement?.textContent?.trim() || '';

            // Catégorie
            const categoryElement = article.querySelector('.elementor-post__badge');
            const category = categoryElement?.textContent?.trim() || 'Actualités Portuaires';

            if (title && url) {
              // Récupérer le contenu complet en visitant l'article
              const { content, images } = await scrapeArticleContent(url);
              
              // Attendre un peu entre les requêtes pour ne pas surcharger le serveur
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              allArticles.push({
                title,
                excerpt: excerpt || content.substring(0, 200) + '...',
                content: content || excerpt || `Article publié sur sib2026.ma - ${title}`,
                author: 'Équipe SIB',
                category: category,
                image: mainImage || (images.length > 0 ? images[0] : ''),
                additionalImages: images,
                url,
                tags: ['portuaire', 'SIB', 'actualités', category.toLowerCase()],
                readTime: Math.max(2, Math.ceil(content.split(/\s+/).length / 200))
              });
              
              console.log(`  ✅ [${allArticles.length}] ${title.substring(0, 45)}... (${content.length} chars, ${images.length} images)`);
            }
          } catch (err) {
            console.error(`  ⚠️  Error parsing article:`, err.message);
          }
        }
        
        console.log(`  ✓ Page ${pageNum} complete\n`);
        pageNum++;
        
        // Petit délai entre les pages
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (pageError) {
        console.error(`  ❌ Error on page ${pageNum}:`, pageError.message);
        break;
      }
    }

    console.log(`\n📊 Total articles collected: ${allArticles.length}`);
    return allArticles;
  } catch (error) {
    console.error('❌ Error scraping:', error);
    throw error;
  }
}

async function syncToDatabase(articles) {
  console.log(`\n📦 Syncing ${articles.length} articles to database...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      // Vérifier si l'article existe déjà
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('title', article.title)
        .maybeSingle();

      if (existing) {
        // Mettre à jour
        const { error } = await supabase
          .from('news_articles')
          .update({
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            image_url: article.image,
            tags: article.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        updated++;
        console.log(`  🔄 Updated: ${article.title.substring(0, 60)}...`);
      } else {
        // Insérer
        const { error } = await supabase
          .from('news_articles')
          .insert({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            author: article.author,
            category: article.category,
            image_url: article.image,
            tags: article.tags,
            published: true,
            featured: false,
            published_at: new Date().toISOString(),
            views: 0
          });

        if (error) throw error;
        inserted++;
        console.log(`  ✅ Inserted: ${article.title.substring(0, 60)}...`);
      }
    } catch (error) {
      console.error(`  ❌ Error syncing "${article.title}":`, error.message);
      skipped++;
    }
  }

  return { inserted, updated, skipped, total: articles.length };
}

async function main() {
  console.log('🚀 Starting SIB news synchronization\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Scraper les articles
    const articles = await scrapeArticles();

    if (articles.length === 0) {
      console.log('⚠️  No articles found to sync');
      return;
    }

    console.log('Articles to sync:');
    articles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
    });

    // Synchroniser avec la base de données
    const stats = await syncToDatabase(articles);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Synchronization complete!');
    console.log(`   📊 Inserted: ${stats.inserted}`);
    console.log(`   🔄 Updated: ${stats.updated}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   📝 Total: ${stats.total}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Synchronization failed:', error);
    process.exit(1);
  }
}

main();
