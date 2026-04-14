import { createClient } from '@supabase/supabase-js';
import { DOMParser } from 'linkedom';

const NEWS_URL = 'https://sib2026.ma/actualite-portuaire/';

async function testNewsScraper() {
  console.log('🔍 Testing news scraper...\n');
  console.log(`📡 Fetching from: ${NEWS_URL}\n`);

  try {
    const response = await fetch(NEWS_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }

    const html = await response.text();
    console.log(`✅ Fetched HTML: ${html.length} characters\n`);

    const { document } = new DOMParser().parseFromString(html, 'text/html');

    // Essayer plusieurs sélecteurs
    const selectors = [
      'article.elementor-post',
      '.elementor-post',
      'article',
      '.post',
      '.entry',
      '[class*="post-"]'
    ];

    console.log('🔎 Testing selectors:\n');
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`  "${selector}": ${elements.length} elements`);
      
      if (elements.length > 0) {
        console.log(`\n✅ Found articles with selector: "${selector}"\n`);
        
        // Analyser le premier article
        const firstArticle = elements[0];
        console.log('📰 First article analysis:');
        console.log(`  - HTML classes: ${firstArticle.className}`);
        
        const titleSelectors = [
          '.elementor-post__title a',
          'h2 a',
          'h3 a',
          '.entry-title a',
          'a[rel="bookmark"]'
        ];
        
        for (const titleSel of titleSelectors) {
          const titleEl = firstArticle.querySelector(titleSel);
          if (titleEl) {
            console.log(`  - Title (${titleSel}): ${titleEl.textContent?.trim()}`);
            console.log(`  - Link: ${titleEl.getAttribute('href')}`);
            break;
          }
        }
        
        const imgEl = firstArticle.querySelector('img');
        if (imgEl) {
          console.log(`  - Image: ${imgEl.getAttribute('src') || imgEl.getAttribute('data-src')}`);
        }
        
        const excerptSelectors = [
          '.elementor-post__excerpt',
          '.entry-summary',
          '.entry-content',
          'p'
        ];
        
        for (const excerptSel of excerptSelectors) {
          const excerptEl = firstArticle.querySelector(excerptSel);
          if (excerptEl) {
            const text = excerptEl.textContent?.trim();
            console.log(`  - Excerpt (${excerptSel}): ${text?.substring(0, 100)}...`);
            break;
          }
        }
        
        console.log('\n📊 All articles found:');
        elements.forEach((el, i) => {
          const title = el.querySelector('.elementor-post__title a, h2 a, h3 a, .entry-title a')?.textContent?.trim();
          if (title) {
            console.log(`  ${i + 1}. ${title}`);
          }
        });
        
        break;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewsScraper();
