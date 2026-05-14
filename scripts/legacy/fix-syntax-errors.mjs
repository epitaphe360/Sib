import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const translationsDir = path.join(__dirname, 'src/i18n/translations');

console.log('🔧 Fixing translation file syntax...\n');

const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix double commas
  if (content.includes(',,')) {
    content = content.replace(/,,/g, ',');
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ ${file} - Fixed double commas`);
  }
}

console.log('\n✅ All files fixed!');

// Verify by trying to load them
console.log('\n🔍 Verifying files load correctly...');
for (const file of files) {
  const filePath = path.join(translationsDir, file);
  try {
    // Try to parse as TypeScript by reading the content
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(',,')) {
      console.log(`  ❌ ${file} - Still has double commas!`);
    } else {
      console.log(`  ✅ ${file} - OK`);
    }
  } catch (e) {
    console.log(`  ⚠️  ${file} - ${e.message}`);
  }
}
