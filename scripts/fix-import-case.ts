/**
 * Script pour corriger les problèmes de casse dans les imports
 * Remplace les imports avec mauvaise casse par les bons
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ImportFix {
  wrong: string;
  correct: string;
}

const importFixes: ImportFix[] = [
  // Composants UI - normaliser vers majuscule
  { wrong: "@/components/ui/card", correct: "@/components/ui/Card" },
  { wrong: "@/components/ui/button", correct: "@/components/ui/Button" },
  { wrong: "@/components/ui/input", correct: "@/components/ui/Input" },
  { wrong: "@/components/ui/label", correct: "@/components/ui/Label" },
  { wrong: "@/components/ui/textarea", correct: "@/components/ui/Textarea" },
  { wrong: "@/components/ui/badge", correct: "@/components/ui/Badge" },
  { wrong: "@/components/ui/select", correct: "@/components/ui/Select" },
  { wrong: "@/components/ui/dialog", correct: "@/components/ui/Dialog" },
  { wrong: "@/components/ui/dropdown-menu", correct: "@/components/ui/DropdownMenu" },
  { wrong: "@/components/ui/checkbox", correct: "@/components/ui/Checkbox" },
  { wrong: "@/components/ui/radio-group", correct: "@/components/ui/RadioGroup" },
];

/**
 * Parcourt récursivement un dossier
 */
function walkDir(dir: string, callback: (filePath: string) => void): void {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(filePath))) {
      callback(filePath);
    }
  });
}

/**
 * Corrige les imports dans un fichier
 */
function fixImportsInFile(filePath: string): number {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let changesCount = 0;
    
    importFixes.forEach(({ wrong, correct }) => {
      const regex = new RegExp(`from ['"]${wrong}['"]`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        content = content.replace(regex, `from '${correct}'`);
        changesCount += matches.length;
      }
    });
    
    if (changesCount > 0) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${filePath.replace(process.cwd(), '.')}: ${changesCount} correction(s)`);
    }
    
    return changesCount;
  } catch (error) {
    console.error(`❌ Erreur dans ${filePath}:`, error);
    return 0;
  }
}

// Exécution
console.log('🔧 Correction des imports avec mauvaise casse\n');

const srcDir = join(__dirname, '../src');
let totalFixes = 0;

walkDir(srcDir, (filePath) => {
  totalFixes += fixImportsInFile(filePath);
});

console.log(`\n✅ Terminé! ${totalFixes} correction(s) au total`);
