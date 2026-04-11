#!/usr/bin/env node

/**
 * Tests Simples pour SIPORTS v3
 * Sans Playwright - Pure Node.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5173';
const TESTS_PASSED = [];
const TESTS_FAILED = [];

// Couleurs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║                                                           ║${colors.reset}`);
console.log(`${colors.blue}║         SIPORTS v3 - Tests Automatisés Simple            ║${colors.reset}`);
console.log(`${colors.blue}║                                                           ║${colors.reset}`);
console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
console.log('');

// Fonction pour faire une requête HTTP
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

// Fonction de test
async function test(name, testFn) {
  process.stdout.write(`${colors.yellow}Testing:${colors.reset} ${name}... `);
  try {
    await testFn();
    console.log(`${colors.green}✓ PASS${colors.reset}`);
    TESTS_PASSED.push(name);
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    TESTS_FAILED.push({ name, error: error.message });
  }
}

// Tests
async function runTests() {
  console.log(`${colors.yellow}═══ 1. Tests de Routes HTTP ═══${colors.reset}\n`);

  await test('Page d\'accueil (/) retourne 200', async () => {
    const res = await makeRequest('/');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page de login (/login) retourne 200', async () => {
    const res = await makeRequest('/login');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page d\'inscription (/register) retourne 200', async () => {
    const res = await makeRequest('/register');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page dashboard (/dashboard) retourne 200', async () => {
    const res = await makeRequest('/dashboard');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page événements (/events) retourne 200', async () => {
    const res = await makeRequest('/events');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page exposants (/exhibitors) retourne 200', async () => {
    const res = await makeRequest('/exhibitors');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page networking (/networking) retourne 200', async () => {
    const res = await makeRequest('/networking');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page rendez-vous (/appointments) retourne 200', async () => {
    const res = await makeRequest('/appointments');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page profil (/profile) retourne 200', async () => {
    const res = await makeRequest('/profile');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Page messages (/messages) retourne 200', async () => {
    const res = await makeRequest('/messages');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  console.log(`\n${colors.yellow}═══ 2. Tests de Contenu HTML ═══${colors.reset}\n`);

  await test('Page login contient "SIPORTS"', async () => {
    const res = await makeRequest('/login');
    if (!res.body.includes('SIPORTS')) throw new Error('Text "SIPORTS" not found');
  });

  await test('Page login contient "Connexion"', async () => {
    const res = await makeRequest('/login');
    if (!res.body.includes('Connexion') && !res.body.includes('connexion')) throw new Error('Text "Connexion" not found');
  });

  await test('Page register contient "inscription"', async () => {
    const res = await makeRequest('/register');
    if (!res.body.toLowerCase().includes('inscription') && !res.body.toLowerCase().includes('register')) {
      throw new Error('Text "inscription" not found');
    }
  });

  await test('Page index contient meta viewport', async () => {
    const res = await makeRequest('/');
    if (!res.body.includes('viewport')) throw new Error('Meta viewport not found');
  });

  await test('Page index contient script reCAPTCHA', async () => {
    const res = await makeRequest('/');
    if (!res.body.includes('recaptcha')) throw new Error('reCAPTCHA script not found');
  });

  console.log(`\n${colors.yellow}═══ 3. Tests de Performance ═══${colors.reset}\n`);

  await test('Page d\'accueil charge en < 2 secondes', async () => {
    const start = Date.now();
    await makeRequest('/');
    const duration = Date.now() - start;
    if (duration > 2000) throw new Error(`Took ${duration}ms (> 2000ms)`);
  });

  await test('Page login charge en < 2 secondes', async () => {
    const start = Date.now();
    await makeRequest('/login');
    const duration = Date.now() - start;
    if (duration > 2000) throw new Error(`Took ${duration}ms (> 2000ms)`);
  });

  console.log(`\n${colors.yellow}═══ 4. Tests des Routes Admin ═══${colors.reset}\n`);

  await test('Admin users page accessible', async () => {
    const res = await makeRequest('/admin/users');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Admin dashboard accessible', async () => {
    const res = await makeRequest('/admin/dashboard');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  console.log(`\n${colors.yellow}═══ 5. Tests des Routes Auth ═══${colors.reset}\n`);

  await test('Exhibitor signup page accessible', async () => {
    const res = await makeRequest('/auth/exhibitor-signup');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  await test('Partner signup page accessible', async () => {
    const res = await makeRequest('/auth/partner-signup');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
  });

  // RÉSULTATS
  console.log('');
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║                    RÉSULTATS FINAUX                       ║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  const total = TESTS_PASSED.length + TESTS_FAILED.length;
  const successRate = Math.round((TESTS_PASSED.length / total) * 100);

  console.log(`Total tests: ${colors.blue}${total}${colors.reset}`);
  console.log(`Tests passés: ${colors.green}${TESTS_PASSED.length}${colors.reset}`);
  console.log(`Tests échoués: ${colors.red}${TESTS_FAILED.length}${colors.reset}`);
  console.log(`Taux de réussite: ${colors.blue}${successRate}%${colors.reset}`);
  console.log('');

  if (TESTS_FAILED.length > 0) {
    console.log(`${colors.red}═══ Tests Échoués ═══${colors.reset}\n`);
    TESTS_FAILED.forEach((test, i) => {
      console.log(`${i + 1}. ${test.name}`);
      console.log(`   Error: ${test.error}\n`);
    });
  }

  if (TESTS_FAILED.length === 0) {
    console.log(`${colors.green}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║                                                           ║${colors.reset}`);
    console.log(`${colors.green}║              ✅ TOUS LES TESTS SONT PASSÉS !             ║${colors.reset}`);
    console.log(`${colors.green}║                                                           ║${colors.reset}`);
    console.log(`${colors.green}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.yellow}║                                                           ║${colors.reset}`);
    console.log(`${colors.yellow}║         ⚠️  Certains tests ont échoué                    ║${colors.reset}`);
    console.log(`${colors.yellow}║                                                           ║${colors.reset}`);
    console.log(`${colors.yellow}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
    process.exit(1);
  }
}

// Lancer les tests
runTests().catch((error) => {
  console.error(`${colors.red}Erreur fatale:${colors.reset}`, error);
  process.exit(1);
});
