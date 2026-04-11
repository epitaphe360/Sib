#!/usr/bin/env node

/**
 * WCAG ACCESSIBILITY AUDIT SCRIPT
 * 
 * Analyzes the codebase for WCAG 2.1 Level AA violations:
 * - Color contrast ratios (minimum 4.5:1 for normal text)
 * - Semantic HTML usage
 * - ARIA labels and roles
 * - Form labels and associations
 * - Alt text for images
 * - Keyboard navigation support
 * - Focus management
 * 
 * Run: node scripts/audit-wcag.cjs
 */

const fs = require('fs');
const path = require('path');

const issues = {
  contrast: [],
  semanticHTML: [],
  ariaLabels: [],
  formLabels: [],
  altText: [],
  focusManagement: [],
  keyboardNav: []
};

const patterns = {
  // Color combinations that fail WCAG AA (4.5:1 for normal text)
  lowContrast: [
    { pattern: /text-gray-300|text-gray-200|text-gray-100/g, issue: 'Light gray text unlikely to meet contrast requirements' },
    { pattern: /text-blue-200|text-blue-100/g, issue: 'Light blue text unlikely to meet contrast requirements' },
    { pattern: /placeholder-gray-400/g, issue: 'Placeholder text may fail contrast check' },
  ],

  // Non-semantic buttons and links
  noSemantic: [
    { pattern: /<div[^>]*onClick/g, issue: 'Non-semantic div with onClick - should use button' },
    { pattern: /<span[^>]*onClick/g, issue: 'Non-semantic span with onClick - should use button' },
    { pattern: /<div[^>]*className="[^"]*cursor-pointer/g, issue: 'Div with cursor-pointer - likely clickable, should be button' },
  ],

  // Missing aria labels
  noAriaLabel: [
    { pattern: /<button[^>]*>[\s]*<[^>]+\/>/g, issue: 'Button with only icon - missing aria-label' },
    { pattern: /<a[^>]*>[\s]*<[^>]+\/>/g, issue: 'Link with only icon - missing aria-label' },
  ],

  // Form inputs without labels
  unlabeledForms: [
    { pattern: /<input[^>]*type="(text|email|password)"[^>]*\/>/g, issue: 'Input without associated label element' },
  ],

  // Images without alt text
  noAltText: [
    { pattern: /<img[^>]*(?!alt=)[^>]*>/g, issue: 'Image missing alt attribute' },
  ],

  // No focus indicators
  noFocus: [
    { pattern: /:focus\s*\{[\s]*display:\s*none/g, issue: 'Focus outline removed - violates keyboard navigation' },
    { pattern: /outline-none|outline:\s*0|outline:\s*none/g, issue: 'Focus outline removed - may violate keyboard accessibility' },
  ],

  // No keyboard support
  noKeyboard: [
    { pattern: /onMouseEnter|onMouseLeave|onMouseOver/g, issue: 'Mouse-only event handler - not keyboard accessible' },
  ]
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Check each pattern
    Object.entries(patterns).forEach(([category, patternList]) => {
      patternList.forEach(({ pattern, issue }) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            issues[category].push({
              file: relativePath,
              match: match.substring(0, 80),
              issue
            });
          });
        }
      });
    });
  } catch (error) {
    // Silently skip files that can't be read
  }
}

function walkDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!file.startsWith('.') && file !== 'node_modules') {
          walkDirectory(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx')) {
        scanFile(filePath);
      }
    });
  } catch (error) {
    // Silently skip directories that can't be read
  }
}

// Main execution
console.log('🔍 WCAG 2.1 Accessibility Audit Starting...\n');

walkDirectory('./src');

let totalIssues = 0;
Object.values(issues).forEach(categoryIssues => {
  totalIssues += categoryIssues.length;
});

console.log('════════════════════════════════════════════════════════════════');
console.log('                    WCAG AUDIT RESULTS                          ');
console.log('════════════════════════════════════════════════════════════════\n');

const categories = [
  { key: 'contrast', title: '🎨 Color Contrast Issues', severity: 'HIGH' },
  { key: 'semanticHTML', title: '🏷️  Semantic HTML Issues', severity: 'HIGH' },
  { key: 'ariaLabels', title: '📝 Missing ARIA Labels', severity: 'MEDIUM' },
  { key: 'formLabels', title: '📋 Form Label Issues', severity: 'MEDIUM' },
  { key: 'altText', title: '🖼️  Missing Alt Text', severity: 'HIGH' },
  { key: 'focusManagement', title: '⌨️  Focus Management Issues', severity: 'HIGH' },
  { key: 'keyboardNav', title: '🔑 Keyboard Navigation Issues', severity: 'HIGH' }
];

categories.forEach(({ key, title, severity }) => {
  const categoryIssues = issues[key];
  if (categoryIssues.length > 0) {
    console.log(`\n${title}`);
    console.log(`Severity: ${severity} | Count: ${categoryIssues.length}`);
    console.log('─'.repeat(60));

    // Group by file
    const byFile = {};
    categoryIssues.forEach(issue => {
      if (!byFile[issue.file]) {
        byFile[issue.file] = [];
      }
      byFile[issue.file].push(issue);
    });

    Object.entries(byFile).forEach(([file, fileIssues]) => {
      console.log(`\n  📄 ${file}`);
      fileIssues.forEach(issue => {
        console.log(`    • ${issue.issue}`);
        if (issue.match) {
          console.log(`      Code: ${issue.match}`);
        }
      });
    });
  }
});

console.log('\n\n════════════════════════════════════════════════════════════════');
console.log(`                     SUMMARY: ${totalIssues} Issues Found`);
console.log('════════════════════════════════════════════════════════════════\n');

if (totalIssues === 0) {
  console.log('✅ No critical WCAG issues detected!\n');
  process.exit(0);
} else {
  console.log('⚠️  Please review and fix the issues listed above.');
  console.log('   Recommendation: Use axe DevTools or WAVE to verify fixes.\n');
  process.exit(1);
}
