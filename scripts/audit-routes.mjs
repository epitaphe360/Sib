#!/usr/bin/env node
/**
 * Audit ROUTES (routes.ts) vs React Router (App.tsx).
 * Usage: node scripts/audit-routes.mjs
 * Exit 1 if a business route in routes.ts has no matching <Route> in App.tsx.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ROUTES_FILE = path.join(ROOT, 'app-urbaevent/web/src/lib/routes.ts');
const APP_FILE = path.join(ROOT, 'app-urbaevent/web/src/App.tsx');

/** Legacy home variants — covered by /accueil/* and /home/* wildcards */
const EXCLUDED_KEYS = new Set([
  'HOME_P1', 'HOME_P2', 'HOME_P3', 'HOME_P4', 'HOME_P5', 'HOME_P6', 'HOME_P7',
  'HOME_P8', 'HOME_P9', 'HOME_P10', 'HOME_P11', 'HOME_P12', 'HOME_P13', 'HOME_P14',
  'HOME_P15', 'HOME_P16', 'HOME_P17',
  'HOME_WORLD', 'HOME_40ANS', 'HOME_DEMO', 'HOME_VARIANTS', 'DESIGN_HOME_MENU',
  'SALON_SIB',
  'ADMIN_SESSION_CHECKIN',
]);

const LEGACY_PREFIXES = ['/accueil/', '/home/'];

function parseRoutesTs(content) {
  const routes = new Map();
  const re = /^\s+([A-Z][A-Z0-9_]*):\s*'([^']*)'/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    routes.set(m[1], m[2]);
  }
  return routes;
}

function parseAppRoutes(content) {
  const wiredKeys = new Set();
  const wiredPaths = new Set();

  const routeKeyRe = /path=\{ROUTES\.([A-Z][A-Z0-9_]*)\}/g;
  let m;
  while ((m = routeKeyRe.exec(content)) !== null) {
    wiredKeys.add(m[1]);
  }

  const routeLiteralRe = /path="([^"]+)"/g;
  while ((m = routeLiteralRe.exec(content)) !== null) {
    wiredPaths.add(m[1]);
  }

  return { wiredKeys, wiredPaths };
}

function isLegacyPath(routePath) {
  return LEGACY_PREFIXES.some((prefix) => routePath.startsWith(prefix));
}

function isCoveredByWildcard(routePath, wiredPaths) {
  if (routePath.startsWith('/accueil/') && wiredPaths.has('/accueil/*')) return true;
  if (routePath.startsWith('/home/') && wiredPaths.has('/home/*')) return true;
  return false;
}

function main() {
  const routesContent = fs.readFileSync(ROUTES_FILE, 'utf8');
  const appContent = fs.readFileSync(APP_FILE, 'utf8');

  const allRoutes = parseRoutesTs(routesContent);
  const { wiredKeys, wiredPaths } = parseAppRoutes(appContent);

  const missing = [];
  const excluded = [];
  const ok = [];

  for (const [key, routePath] of allRoutes) {
    if (EXCLUDED_KEYS.has(key)) {
      excluded.push({ key, path: routePath });
      continue;
    }
    if (isLegacyPath(routePath)) {
      excluded.push({ key, path: routePath, reason: 'legacy prefix' });
      continue;
    }

    const covered =
      wiredKeys.has(key) ||
      wiredPaths.has(routePath) ||
      isCoveredByWildcard(routePath, wiredPaths);

    if (covered) {
      ok.push({ key, path: routePath });
    } else {
      missing.push({ key, path: routePath });
    }
  }

  console.log(`Routes audit — ${allRoutes.size} keys in routes.ts`);
  console.log(`  Wired in App.tsx: ${ok.length}`);
  console.log(`  Excluded (legacy/alias): ${excluded.length}`);
  console.log(`  Missing: ${missing.length}`);

  if (missing.length > 0) {
    console.error('\nMissing routes (add to App.tsx or EXCLUDED_KEYS if intentional):\n');
    for (const { key, path: p } of missing.sort((a, b) => a.key.localeCompare(b.key))) {
      console.error(`  ${key}: ${p}`);
    }
    process.exit(1);
  }

  console.log('\nAll business routes are wired in App.tsx.');
}

main();
