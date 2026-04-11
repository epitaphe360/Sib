const fs = require('fs');
const path = require('path');
const glob = require('glob');

function readAppRoutes(appPath) {
  const src = fs.readFileSync(appPath, 'utf8');
  const routeRe = /<Route\s+path=\"([^\"]+)\"/g;
  const routes = [];
  let m;
  while ((m = routeRe.exec(src))) {
    routes.push(m[1]);
  }
  return routes;
}

function extractTargets(files) {
  const linkRe = /<Link[^>]*to=\"([^\"]+)\"/g;
  const linkTemplateRe = /<Link[^>]*to=\{`([^`]+)`\}/g;
  const navigateRe = /navigate\(\`?\"?([^\)`\"]+)\`?\"?\)/g;

  const results = [];

  files.forEach((file) => {
    const src = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = linkRe.exec(src))) {
      results.push(m[1]);
    }
    while ((m = linkTemplateRe.exec(src))) {
      results.push(m[1]);
    }
    while ((m = navigateRe.exec(src))) {
      results.push(m[1]);
    }
  });

  return results;
}

function normalizeTarget(t) {
  if (!t) return null;
  // strip full url
  try {
    if (t.startsWith('http') || t.startsWith('www.')) return null;
  } catch (e) {}
  // remove query and hash
  const q = t.split('?')[0].split('#')[0];
  // if contains interpolation like ${} leave as is, but try to trim to path before interpolation
  const idx = q.indexOf('${');
  let cleaned = q;
  if (idx !== -1) cleaned = q.substring(0, idx);
  // trim trailing slash except root
  if (cleaned.length > 1 && cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  // only keep starting with /
  if (!cleaned.startsWith('/')) return null;
  return cleaned;
}

function routeToRegex(route) {
  let r = route.replace(/:[^/]+/g, '[^/]+');
  r = r.replace(/\//g, '\\/');
  return new RegExp('^' + r + '$');
}

function main() {
  const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
  const routes = readAppRoutes(appPath).map(r => r.replace(/\/$/, ''));
  const files = glob.sync(path.join(__dirname, '..', 'src', '**', '*.{ts,tsx}'));
  const rawTargets = extractTargets(files);
  const normalized = rawTargets.map(normalizeTarget).filter(Boolean);
  const uniqueTargets = Array.from(new Set(normalized));

  const missing = [];
  uniqueTargets.forEach(t => {
    const matched = routes.some(rt => {
      try {
        const re = routeToRegex(rt);
        return re.test(t);
      } catch (e) {
        return rt === t;
      }
    });
    if (!matched) missing.push(t);
  });

  console.log('Detected', uniqueTargets.length, 'unique targets, missing', missing.length);
  missing.forEach(m => console.log(m));
  fs.writeFileSync(path.join(process.cwd(), 'NAV_MISSING.json'), JSON.stringify(missing, null, 2));
}

main();
