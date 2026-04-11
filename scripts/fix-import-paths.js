#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  });
  
  return files;
}

const pagesDir = path.join(__dirname, '../src/pages');
const files = walkDir(pagesDir);

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has useTranslation
  if (content.includes('useTranslation')) {
    // But fix the import path
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, '../src/hooks/useTranslation'));
    const normalizedPath = relativePath.replace(/\\/g, '/');
    content = content.replace(
      /import\s+{\s*useTranslation\s*}\s+from\s+['"][^'"]*['"]/,
      `import { useTranslation } from '${normalizedPath}'`
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

console.log('✅ Fixed all import paths');
