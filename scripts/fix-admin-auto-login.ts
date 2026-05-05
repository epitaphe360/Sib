/**
 * Script pour identifier et corriger le bug admin auto-connecté
 */

import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  file: string;
  line: number;
  code: string;
  issue: string;
  fix: string;
}

const issues: Issue[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Chercher les patterns problématiques

    // 1. Connexion admin forcée
    if (line.includes('type: "admin"') || line.includes("type: 'admin'")) {
      if (line.includes('setUser') || line.includes('user =')) {
        issues.push({
          file: filePath,
          line: index + 1,
          code: line.trim(),
          issue: 'Définition hardcodée du type admin',
          fix: 'Supprimer ou conditionner cette assignation'
        });
      }
    }

    // 2. isAdmin hardcodé à true
    if (line.match(/isAdmin\s*[:=]\s*true/)) {
      issues.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        issue: 'isAdmin forcé à true',
        fix: 'Calculer isAdmin basé sur user.type'
      });
    }

    // 3. Session admin créée automatiquement
    if (line.includes('localStorage.setItem') && line.includes('admin')) {
      issues.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        issue: 'Sauvegarde de session admin dans localStorage',
        fix: 'Vérifier que cela se fait seulement après authentification réussie'
      });
    }

    // 4. useEffect qui set un admin par défaut
    if (line.includes('useEffect') && content.includes('type: "admin"')) {
      const effectStart = index;
      const effectEnd = lines.findIndex((l, i) => i > effectStart && l.includes('}, ['));
      if (effectEnd > effectStart) {
        const effectContent = lines.slice(effectStart, effectEnd + 1).join('\n');
        if (effectContent.includes('setUser') && effectContent.includes('admin')) {
          issues.push({
            file: filePath,
            line: effectStart + 1,
            code: 'useEffect contenant setUser admin',
            issue: 'useEffect qui définit un utilisateur admin par défaut',
            fix: 'Supprimer ce useEffect ou le conditionner'
          });
        }
      }
    }
  });
}

function scanDirectory(dir: string, extensions: string[] = ['.ts', '.tsx']) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) {
        scanDirectory(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      scanFile(filePath);
    }
  });
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ANALYSE DU BUG ADMIN AUTO-CONNECTÉ');
  console.log('='.repeat(60) + '\n');

  if (issues.length === 0) {
    console.log('✅ Aucun problème détecté!\n');
    return;
  }

  console.log(`❌ ${issues.length} problème(s) détecté(s):\n`);

  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Code: ${issue.code}`);
    console.log(`   Fix: ${issue.fix}\n`);
  });

  // Sauvegarder le rapport
  const reportDir = path.join(process.cwd(), 'test-reports');
  fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    date: new Date().toISOString(),
    issuesCount: issues.length,
    issues: issues,
  };

  fs.writeFileSync(
    path.join(reportDir, 'admin-auto-login-issues.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`💾 Rapport sauvegardé dans: ${path.join(reportDir, 'admin-auto-login-issues.json')}\n`);
}

// Exécution
const srcDir = path.join(process.cwd(), 'src');
console.log(`Scan du répertoire: ${srcDir}\n`);
scanDirectory(srcDir);
generateReport();
