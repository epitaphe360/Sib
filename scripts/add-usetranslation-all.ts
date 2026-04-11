import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '../src/pages');

// Find all pages without useTranslation
const allPages = globSync(path.join(pagesDir, '**/*.tsx'));
let corrected = 0;
let skipped = 0;

allPages.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has useTranslation
  if (content.includes('useTranslation')) {
    skipped++;
    return;
  }

  // Add import if not present
  if (!content.includes("import { useTranslation }")) {
    const importMatch = content.match(/^import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?/m);
    if (importMatch) {
      // Add after first import group
      const lastImportMatch = content.match(/^import\s+[^;]+;/m);
      if (lastImportMatch) {
        const insertPos = content.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
        content = content.slice(0, insertPos) + "\nimport { useTranslation } from '../hooks/useTranslation';" + content.slice(insertPos);
      }
    } else {
      // Add at start
      const firstLine = content.match(/^[^\n]+/)[0];
      content = "import { useTranslation } from '../hooks/useTranslation';\n" + content;
    }
  }

  // Add hook to first component function
  const componentMatch = content.match(/(export\s+(default\s+)?)?function\s+(\w+)\s*\([^)]*\)\s*{/);
  if (componentMatch) {
    const startPos = componentMatch[0].length + componentMatch.index;
    const indent = '  ';
    content = content.slice(0, startPos) + "\n" + indent + "const { t } = useTranslation();" + content.slice(startPos);
  } else {
    // Try arrow function
    const arrowMatch = content.match(/const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>\s*{/);
    if (arrowMatch) {
      const startPos = arrowMatch[0].length + arrowMatch.index;
      const indent = '  ';
      content = content.slice(0, startPos) + "\n" + indent + "const { t } = useTranslation();" + content.slice(startPos);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  corrected++;
});

console.log(`✅ Ajout de useTranslation:`);
console.log(`   Corrigées: ${corrected}`);
console.log(`   Déjà présentes: ${skipped}`);
console.log(`   Total: ${allPages.length}`);
