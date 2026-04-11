const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROUTES_FILE = path.join(__dirname, '..', 'src', 'lib', 'routes.ts');
const ROUTES = {};

const content = fs.readFileSync(ROUTES_FILE, 'utf8');
const routeRe = /(\w+):\s*'([^']+)'/g;
let m;
while ((m = routeRe.exec(content))) {
  ROUTES[m[1]] = m[2];
}

const files = glob.sync(path.join(__dirname, '..', 'src', '**', '*.{ts,tsx}'));
let totalReplacements = 0;

files.forEach((file) => {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;
  let madeChange = false;

  Object.keys(ROUTES).forEach((key) => {
    const route = ROUTES[key];
    // replace to="/path"
    const pattern = `to=\"${route}\"`;
    if (src.includes(pattern)) {
      src = src.split(pattern).join(`to={ROUTES.${key}}`);
      madeChange = true;
      totalReplacements++;
    }
    // replace navigate('/path') and navigate("/path")
    const nav1 = `navigate(\'${route}\')`;
    const nav2 = `navigate(\"${route}\")`;
    if (src.includes(nav1)) {
      src = src.split(nav1).join(`navigate(ROUTES.${key})`);
      madeChange = true;
      totalReplacements++;
    }
    if (src.includes(nav2)) {
      src = src.split(nav2).join(`navigate(ROUTES.${key})`);
      madeChange = true;
      totalReplacements++;
    }
    // replace href="/path" (for anchor fallback)
    const href = `href=\"${route}\"`;
    if (src.includes(href)) {
      src = src.split(href).join(`href={ROUTES.${key}}`);
      madeChange = true;
      totalReplacements++;
    }
  });

  if (madeChange) {
    // ensure import { ROUTES } exists
    const rel = path.relative(path.dirname(file), path.join(process.cwd(), 'src', 'lib', 'routes'));
    const importPath = rel.startsWith('.') ? rel : './' + rel;
    const importStmt = `import { ROUTES } from '${importPath.replace(/\\\\/g, '/')}';`;
    if (!src.includes("ROUTES }")) {
      // add after last import
      const importRe = /import[\s\S]+?from\s+['"][^'"]+['"];?\n/g;
      const imports = src.match(importRe);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        src = src.replace(lastImport, lastImport + importStmt + '\n');
      } else {
        src = importStmt + '\n' + src;
      }
    } else if (!src.includes("import { ROUTES }")) {
      // add specific import
      const lastImportMatch = src.match(/(import[\s\S]+?from\s+['"][^'"]+['"];?\n)(?!.*import)/);
      if (lastImportMatch) {
        src = src.replace(lastImportMatch[1], lastImportMatch[1] + importStmt + '\n');
      } else {
        src = importStmt + '\n' + src;
      }
    }

    fs.writeFileSync(file, src, 'utf8');
    console.log('Patched', path.relative(process.cwd(), file));
  }
});

console.log('Total replacements:', totalReplacements);
