/**
 * VERIFICATION RAPIDE DE TOUTES LES PAGES
 * Verifie le status HTTP et le temps de chargement
 */

const PAGES = [
  { name: 'Accueil', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Forgot Password', path: '/forgot-password' },
  { name: 'Exposants', path: '/exposants' },
  { name: 'Events', path: '/events' },
  { name: 'Actualites', path: '/actualites' },
  { name: 'Pavillons', path: '/pavillons' },
  { name: 'Partnership', path: '/partnership' },
  { name: 'Contact', path: '/contact' },
  { name: 'Support', path: '/support' },
  { name: 'About', path: '/about' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Cookies', path: '/cookies' },
  { name: 'Legal', path: '/legal' },
  { name: 'API', path: '/api' },
  { name: 'Exhibitor Signup', path: '/exhibitor-signup' },
  { name: 'Partner Signup', path: '/partner-signup' },
  { name: 'Visitor Free', path: '/visitor/register/free' },
  { name: 'Visitor VIP', path: '/visitor/register/vip' },
  { name: 'Media', path: '/media' },
  { name: 'Best Moments', path: '/best-moments' },
  { name: 'Testimonials', path: '/testimonials' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Profile', path: '/profile' },
  { name: 'Badge', path: '/badge' },
  { name: 'Messages', path: '/messages' },
  { name: 'Networking', path: '/networking' },
  { name: 'Appointments', path: '/appointments' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Admin', path: '/admin' },
];

const BASE_URL = 'http://localhost:9323';

interface Result {
  name: string;
  path: string;
  status: number | string;
  time: number;
  contentLength?: number;
  error?: string;
}

async function checkPage(page: { name: string; path: string }): Promise<Result> {
  const url = `${BASE_URL}${page.path}`;
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      redirect: 'follow'
    });
    
    clearTimeout(timeout);
    const time = Date.now() - start;
    const text = await response.text();
    
    return {
      name: page.name,
      path: page.path,
      status: response.status,
      time,
      contentLength: text.length,
    };
  } catch (error: any) {
    return {
      name: page.name,
      path: page.path,
      status: 'ERROR',
      time: Date.now() - start,
      error: error.message,
    };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('VERIFICATION RAPIDE DE TOUTES LES PAGES');
  console.log('='.repeat(70));
  console.log(`URL: ${BASE_URL}`);
  console.log(`Pages: ${PAGES.length}`);
  console.log('');
  
  const results: Result[] = [];
  
  for (const page of PAGES) {
    const result = await checkPage(page);
    results.push(result);
    
    const status = result.status;
    const icon = status === 200 ? '[OK]' : status === 302 || status === 301 ? '[->]' : '[!!]';
    const color = status === 200 ? '\x1b[32m' : status === 302 ? '\x1b[33m' : '\x1b[31m';
    
    console.log(`${icon} ${page.name.padEnd(20)} ${page.path.padEnd(30)} ${status} (${result.time}ms)${result.error ? ' - ' + result.error : ''}`);
  }
  
  console.log('');
  console.log('='.repeat(70));
  console.log('RESUME');
  console.log('='.repeat(70));
  
  const ok = results.filter(r => r.status === 200).length;
  const redirects = results.filter(r => r.status === 302 || r.status === 301).length;
  const errors = results.filter(r => typeof r.status !== 'number' || (r.status >= 400)).length;
  
  console.log(`Pages OK (200): ${ok}`);
  console.log(`Redirections (301/302): ${redirects}`);
  console.log(`Erreurs: ${errors}`);
  
  if (errors > 0) {
    console.log('');
    console.log('Pages avec erreurs:');
    results.filter(r => typeof r.status !== 'number' || r.status >= 400).forEach(r => {
      console.log(`  - ${r.name}: ${r.status}${r.error ? ' - ' + r.error : ''}`);
    });
  }
  
  // Sauvegarder le rapport
  const fs = await import('fs');
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: PAGES.length,
    ok,
    redirects,
    errors,
    results,
  };
  
  fs.writeFileSync('test-results/page-status-report.json', JSON.stringify(report, null, 2));
  console.log('');
  console.log('Rapport: test-results/page-status-report.json');
}

main().catch(console.error);
