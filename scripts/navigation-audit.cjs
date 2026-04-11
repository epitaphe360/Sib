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
      results.push({ target: m[1], file, index: m.index });
    }
    while ((m = linkTemplateRe.exec(src))) {
      results.push({ target: m[1], file, index: m.index });
    }
    while ((m = navigateRe.exec(src))) {
      results.push({ target: m[1], file, index: m.index });
    }
  });

  return results;
}

function routeToRegex(route) {
  let r = route.replace(/:[^/]+/g, '[^/]+');
  r = r.replace(/\//g, '\\/');
  return new RegExp('^' + r + '$');
}

function findClosestRoute(target, routes) {
  const parts = target.split('/').filter(Boolean);
  for (let len = parts.length; len > 0; len--) {
    const prefix = '/' + parts.slice(0, len).join('/');
    const found = routes.find((rt) => rt === prefix || rt.startsWith(prefix + '/'));
    if (found) return found;
  }
  return null;
}

function main() {
  const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
  const routes = readAppRoutes(appPath);
  const files = glob.sync(path.join(__dirname, '..', 'src', '**', '*.{ts,tsx}'));
  const targets = extractTargets(files);

  const unique = {};
  targets.forEach((t) => {
    const key = t.target;
    if (!unique[key]) unique[key] = [];
    unique[key].push(t.file);
  });

  const reportLines = [];
  reportLines.push('# Navigation audit');
  reportLines.push('');
  reportLines.push('Routes extracted from `src/App.tsx`:');
  reportLines.push('');
  routes.forEach((r) => reportLines.push('- ' + r));
  reportLines.push('');
  reportLines.push('Detected navigation targets:');
  reportLines.push('');
  Object.keys(unique)
    .sort()
    .forEach((target) => {
      const files = Array.from(new Set(unique[target]));
      let matched = routes.some((rt) => {
        try {
          const re = routeToRegex(rt);
          return re.test(target);
        } catch (e) {
          return target === rt;
        }
      });
      let closest = null;
      if (!matched) {
        closest = findClosestRoute(target, routes);
      }
      reportLines.push('## ' + target);
      reportLines.push('Found in:');
      files.forEach((f) => reportLines.push('- ' + path.relative(process.cwd(), f)));
      reportLines.push('');
      reportLines.push('- Matched route: ' + (matched ? 'Yes' : 'No'));
      if (!matched) reportLines.push('- Closest existing route suggestion: ' + (closest || 'None'));
      reportLines.push('');
    });

  const out = reportLines.join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'NAVIGATION_AUDIT_REPORT.md'), out);
  console.log('Wrote NAVIGATION_AUDIT_REPORT.md');
}

main();
