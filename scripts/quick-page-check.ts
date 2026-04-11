/**
 * TEST RAPIDE - Check toutes les pages en mode headless
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:9323';

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
  '/messages',
  '/networking',
  '/appointments',
  '/calendar',
];

interface Result {
  page: string;
  status: number | string;
  time: number;
  error?: string;
}

async function checkPage(pagePath: string): Promise<Result> {
  const url = `${BASE_URL}${pagePath}`;
  const start = Date.now();
  
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 10000 }, (res: any) => {
      const time = Date.now() - start;
      resolve({
        page: pagePath,
        status: res.statusCode,
        time,
      });
    });
    
    req.on('error', (err: any) => {
      resolve({
        page: pagePath,
        status: 'ERROR',
        time: Date.now() - start,
        error: err.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        page: pagePath,
        status: 'TIMEOUT',
        time: Date.now() - start,
      });
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('TEST RAPIDE DE TOUTES LES PAGES');
  console.log('='.repeat(60));
  console.log(`URL de base: ${BASE_URL}`);
  console.log(`Nombre de pages: ${PAGES.length}`);
  console.log('');
  
  const results: Result[] = [];
  
  for (const page of PAGES) {
    const result = await checkPage(page);
    results.push(result);
    
    const statusIcon = result.status === 200 ? '[OK]' : '[!!]';
    console.log(`${statusIcon} ${page.padEnd(35)} - Status: ${result.status} (${result.time}ms)`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('RESUME');
  console.log('='.repeat(60));
  
  const ok = results.filter(r => r.status === 200).length;
  const errors = results.filter(r => r.status !== 200).length;
  
  console.log(`Pages OK (200): ${ok}`);
  console.log(`Pages avec erreurs: ${errors}`);
  
  if (errors > 0) {
    console.log('');
    console.log('Pages problematiques:');
    results.filter(r => r.status !== 200).forEach(r => {
      console.log(`  - ${r.page}: ${r.status} ${r.error || ''}`);
    });
  }
  
  // Sauvegarder
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: PAGES.length,
    okPages: ok,
    errorPages: errors,
    results,
  };
  
  fs.writeFileSync('test-results/quick-test-report.json', JSON.stringify(report, null, 2));
  console.log('');
  console.log('Rapport sauvegarde: test-results/quick-test-report.json');
}

main().catch(console.error);
