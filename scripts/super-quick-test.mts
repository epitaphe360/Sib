/**
 * SUPER TEST RAPIDE - Toutes les pages en parallele
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

const PAGES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/exposants',
  '/events',
  '/actualites',
  '/pavillons',
  '/partnership',
  '/contact',
  '/support',
  '/about',
  '/faq',
  '/terms',
  '/privacy',
  '/cookies',
  '/legal',
  '/api',
  '/exhibitor-signup',
  '/partner-signup',
  '/visitor/register/free',
  '/visitor/register/vip',
  '/media',
  '/best-moments',
  '/testimonials',
  '/dashboard',
  '/profile',
  '/badge',
  '/networking',
];

interface PageResult {
  path: string;
  status: number | 'ERROR' | 'TIMEOUT';
  time: number;
  error?: string;
  size?: number;
}

async function checkPage(path: string): Promise<PageResult> {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    
    const text = await response.text();
    return {
      path,
      status: response.status,
      time: Date.now() - start,
      size: text.length,
    };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return { path, status: 'TIMEOUT', time: 10000 };
    }
    return { path, status: 'ERROR', time: Date.now() - start, error: e.message };
  }
}

async function main() {
  console.log('');
  console.log('='.repeat(70));
  console.log('    VERIFICATION RAPIDE DE TOUTES LES PAGES');
  console.log('='.repeat(70));
  console.log(`URL: ${BASE_URL}`);
  console.log(`Nombre de pages: ${PAGES.length}`);
  console.log('');
  
  // Test en parallele par lots de 5
  const results: PageResult[] = [];
  const batchSize = 5;
  
  for (let i = 0; i < PAGES.length; i += batchSize) {
    const batch = PAGES.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkPage));
    results.push(...batchResults);
    
    for (const r of batchResults) {
      const icon = r.status === 200 ? '\x1b[32m[OK]\x1b[0m' : 
                   r.status === 'ERROR' ? '\x1b[31m[!!]\x1b[0m' : 
                   '\x1b[33m[??]\x1b[0m';
      console.log(`${icon} ${r.path.padEnd(35)} ${String(r.status).padEnd(8)} ${r.time}ms ${r.size ? `(${Math.round(r.size/1024)}KB)` : ''}`);
    }
  }
  
  // Resume
  console.log('');
  console.log('='.repeat(70));
  console.log('    RESUME');
  console.log('='.repeat(70));
  
  const ok = results.filter(r => r.status === 200).length;
  const redirects = results.filter(r => typeof r.status === 'number' && r.status >= 300 && r.status < 400).length;
  const errors = results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT' || (typeof r.status === 'number' && r.status >= 400)).length;
  
  console.log(`\x1b[32m✓ Pages OK (200): ${ok}\x1b[0m`);
  if (redirects > 0) console.log(`\x1b[33m→ Redirections: ${redirects}\x1b[0m`);
  if (errors > 0) {
    console.log(`\x1b[31m✗ Erreurs: ${errors}\x1b[0m`);
    console.log('');
    console.log('Pages problematiques:');
    results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT' || (typeof r.status === 'number' && r.status >= 400)).forEach(r => {
      console.log(`  - ${r.path}: ${r.status} ${r.error || ''}`);
    });
  }
  
  // Temps moyen
  const avgTime = Math.round(results.reduce((sum, r) => sum + r.time, 0) / results.length);
  console.log(`\nTemps moyen de chargement: ${avgTime}ms`);
  
  // Sauvegarder
  const fs = await import('fs');
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: { total: PAGES.length, ok, redirects, errors },
    results,
  };
  
  fs.writeFileSync('test-results/quick-pages-report.json', JSON.stringify(report, null, 2));
  console.log('\nRapport: test-results/quick-pages-report.json');
  
  // Exit code
  process.exit(errors > 0 ? 1 : 0);
}

main();
