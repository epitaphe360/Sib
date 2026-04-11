#!/usr/bin/env node
import fetch from 'node-fetch';
import { load } from 'cheerio';

async function fetchHtml(url) {
  const res = await fetch(url, { redirect: 'follow', timeout: 15000 });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return await res.text();
}

function extractMeta(html, baseUrl) {
  const $ = load(html);
  const title = $('head > title').text() || $('meta[property="og:site_name"]').attr('content') || '';
  const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || $('link[rel="image_src"]').attr('href') || '';
  const images = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt') || '';
    try { 
      if (src && images.length < 10) {
        images.push({ 
          url: new URL(src, baseUrl).toString(),
          alt: alt
        }); 
      } 
    } catch (e) { /* ignore */ }
  });

  const bodyText = $('body').text();
  const emailMatch = bodyText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = bodyText.match(/\+?[0-9][0-9 ()-]{6,}[0-9]/);

  return { title, description, ogImage, images, email: emailMatch?.[0] || null, phone: phoneMatch?.[0] || null };
}

/**
 * Extrait les produits/services depuis le HTML
 * Recherche dans les sections communes : .product, .service, article, etc.
 */
function extractProducts(html) {
  const $ = load(html);
  const products = [];
  
  // Sélecteurs communs pour les produits/services
  const productSelectors = [
    '.product',
    '.service',
    '.item',
    'article.product',
    'article.service',
    '[class*="product"]',
    '[class*="service"]',
    '[class*="offer"]',
    '[id*="product"]',
    '[id*="service"]'
  ];

  // Essayer chaque sélecteur
  for (const selector of productSelectors) {
    $(selector).each((i, el) => {
      if (products.length >= 10) return false; // Limiter à 10 produits

      const $el = $(el);
      
      // Extraire le nom du produit
      const name = 
        $el.find('h1, h2, h3, h4, .title, .name, [class*="title"], [class*="name"]').first().text().trim() ||
        $el.find('a').first().text().trim() ||
        $el.text().trim().substring(0, 100);

      // Extraire la description
      const description = 
        $el.find('p, .description, [class*="desc"]').first().text().trim() ||
        $el.text().trim().substring(0, 200);

      // Extraire l'image
      const imgSrc = $el.find('img').first().attr('src');
      const image = imgSrc ? imgSrc : null;

      // Extraire le prix si disponible
      const priceText = $el.find('[class*="price"], .price, [class*="cost"]').first().text().trim();
      const price = priceText || null;

      if (name && name.length > 3) {
        products.push({
          name: name.substring(0, 100),
          description: description.substring(0, 300),
          image: image,
          price: price,
          category: 'Produit/Service'
        });
      }
    });

    if (products.length > 0) break; // Si on a trouvé des produits, arrêter
  }

  // Si aucun produit trouvé avec les sélecteurs, essayer d'extraire depuis les listes
  if (products.length === 0) {
    $('ul li, ol li').each((i, el) => {
      if (products.length >= 10) return false;
      
      const $el = $(el);
      const text = $el.text().trim();
      
      // Filtrer les éléments de navigation et menus
      if (text.length > 10 && text.length < 200 && !$el.closest('nav, header, footer').length) {
        products.push({
          name: text.substring(0, 100),
          description: '',
          image: null,
          price: null,
          category: 'Service'
        });
      }
    });
  }

  return products;
}

/**
 * Extrait les réseaux sociaux depuis le HTML
 */
function extractSocialLinks(html) {
  const $ = load(html);
  const socials = [];
  const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com'];

  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && socialDomains.some(domain => href.includes(domain))) {
      if (!socials.includes(href)) {
        socials.push(href);
      }
    }
  });

  return socials;
}

function buildSections(meta, products, url) {
  const hero = { 
    type: 'hero', 
    content: { 
      company: meta.title || url, 
      description: meta.description || '', 
      logo: meta.ogImage || (meta.images[0]?.url || '') 
    } 
  };
  
  const productsSection = { 
    type: 'products', 
    content: { 
      title: 'Nos Produits et Services',
      products: products.map(p => ({
        name: p.name,
        description: p.description,
        image: p.image,
        price: p.price
      }))
    } 
  };
  
  const about = { 
    type: 'about', 
    content: { 
      title: 'À propos', 
      description: meta.description || '' 
    } 
  };
  
  const gallery = {
    type: 'gallery',
    content: {
      title: 'Galerie',
      images: meta.images.slice(0, 6).map(img => ({
        url: img.url,
        alt: img.alt || meta.title
      }))
    }
  };
  
  const contact = { 
    type: 'contact', 
    content: { 
      email: meta.email || '', 
      phone: meta.phone || '', 
      website: url 
    } 
  };
  
  return [hero, productsSection, about, gallery, contact];
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/ai_generate_minisite.mjs <url>');
    process.exit(2);
  }
  try {
    console.error(`[INFO] Scraping started for: ${url}`);
    const html = await fetchHtml(url);
    console.error('[INFO] HTML fetched successfully');
    
    const meta = extractMeta(html, url);
    console.error(`[INFO] Metadata extracted: ${meta.title}`);
    
    const products = extractProducts(html);
    console.error(`[INFO] Products extracted: ${products.length} items`);
    
    const socials = extractSocialLinks(html);
    console.error(`[INFO] Social links extracted: ${socials.length} links`);
    
    const sections = buildSections(meta, products, url);
    
    const payload = {
      company: meta.title || url,
      logo: meta.ogImage || (meta.images[0]?.url || ''),
      description: meta.description || '',
      products: products,
      socials: socials,
      documents: [],
      contact: { email: meta.email, phone: meta.phone, website: url },
      sections,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      stats: {
        productsFound: products.length,
        imagesFound: meta.images.length,
        socialsFound: socials.length
      }
    };
    
    console.error('[INFO] Payload generated successfully');
    console.log(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('[ERROR] Error generating mini-site:', err.message || err);
    process.exit(1);
  }
}

// Execute when run as a script
main();
