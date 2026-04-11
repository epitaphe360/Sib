#!/usr/bin/env node

/**
 * Safe Accessibility Fixes
 * Adds aria-label attributes without restructuring code
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class SafeAccessibilityFixer {
  constructor() {
    this.fixesApplied = {
      buttonAriaLabels: 0,
      linkAriaLabels: 0,
      inputAriaLabels: 0
    };
    this.filesModified = new Set();
  }

  fixDirectory(dir, baseDir = dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          this.fixDirectory(filePath, baseDir);
        }
      } else if (['.tsx', '.jsx'].includes(extname(file))) {
        this.fixFile(filePath, baseDir);
      }
    }
  }

  fixFile(filePath, baseDir) {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    const relativePath = filePath.replace(baseDir + '/', '');

    console.log(`\n📝 Processing: ${relativePath}`);

    // Fix 1: Add aria-label to icon-only buttons (same line only)
    const buttonRegex = /<button([^>]*?)>\s*<([A-Z][a-zA-Z]*)\s+[^>]*?\/>\s*<\/button>/g;
    let newContent = content.replace(buttonRegex, (match, attrs, iconName) => {
      if (attrs.includes('aria-label=')) {
        return match; // Already has aria-label
      }
      const label = this.iconToLabel(iconName);
      this.fixesApplied.buttonAriaLabels++;
      modified = true;
      return match.replace('<button', `<button aria-label="${label}"`);
    });

    // Fix 2: Add aria-label to icon-only links (same line only)
    const linkRegex = /<(?:Link|a)([^>]*?)>\s*<([A-Z][a-zA-Z]*)\s+[^>]*?\/>\s*<\/(?:Link|a)>/g;
    newContent = newContent.replace(linkRegex, (match, attrs, iconName) => {
      if (attrs.includes('aria-label=')) {
        return match; // Already has aria-label
      }
      const label = this.iconToLabel(iconName);
      this.fixesApplied.linkAriaLabels++;
      modified = true;
      return match.replace(/<(Link|a)/, `<$1 aria-label="${label}"`);
    });

    // Fix 3: Add aria-label to inputs without it (single line inputs only, no wrapping)
    const simpleInputRegex = /<input\s+([^>]*?)\/>/g;
    newContent = newContent.replace(simpleInputRegex, (match, attrs) => {
      // Skip if already has aria-label or id or is hidden/submit/checkbox/radio
      if (attrs.includes('aria-label=') || attrs.includes('id=') ||
          attrs.includes('type="hidden"') || attrs.includes('type="submit"') ||
          attrs.includes('type="checkbox"') || attrs.includes('type="radio"') ||
          attrs.includes('type="file"')) {
        return match;
      }

      // Extract placeholder for aria-label
      const placeholderMatch = attrs.match(/placeholder=[\"']([^\"']+)[\"']/);
      const nameMatch = attrs.match(/name=[\"']([^\"']+)[\"']/);
      const typeMatch = attrs.match(/type=[\"']([^\"']+)[\"']/);

      if (placeholderMatch) {
        const label = placeholderMatch[1];
        this.fixesApplied.inputAriaLabels++;
        modified = true;
        return `<input ${attrs} aria-label="${label}" />`;
      } else if (nameMatch) {
        const label = this.capitalize(nameMatch[1]);
        this.fixesApplied.inputAriaLabels++;
        modified = true;
        return `<input ${attrs} aria-label="${label}" />`;
      } else if (typeMatch) {
        const label = this.capitalize(typeMatch[1]);
        this.fixesApplied.inputAriaLabels++;
        modified = true;
        return `<input ${attrs} aria-label="${label}" />`;
      }

      return match;
    });

    if (newContent !== content) {
      writeFileSync(filePath, newContent);
      this.filesModified.add(relativePath);
      console.log(`  ✅ Fixed ${this.fixesApplied.buttonAriaLabels} button aria-labels`);
      console.log(`  ✅ Fixed ${this.fixesApplied.linkAriaLabels} link aria-labels`);
      console.log(`  ✅ Fixed ${this.fixesApplied.inputAriaLabels} input aria-labels`);
      console.log('  💾 File saved');
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }

  iconToLabel(iconName) {
    const labels = {
      'Trash': 'Delete',
      'Trash2': 'Delete',
      'Edit': 'Edit',
      'X': 'Close',
      'Plus': 'Add',
      'Check': 'Confirm',
      'ArrowLeft': 'Go back',
      'ArrowRight': 'Go forward',
      'ChevronLeft': 'Previous',
      'ChevronRight': 'Next',
      'Eye': 'View',
      'EyeOff': 'Hide',
      'Heart': 'Like',
      'Star': 'Favorite',
      'Download': 'Download',
      'Upload': 'Upload',
      'Save': 'Save',
      'Send': 'Send',
      'Search': 'Search',
      'Filter': 'Filter',
      'Settings': 'Settings',
      'Menu': 'Menu',
      'User': 'User profile',
      'Bell': 'Notifications',
      'MessageCircle': 'Messages',
      'Calendar': 'Calendar',
      'Camera': 'Upload photo',
      'ExternalLink': 'Open in new tab',
      'Mail': 'Email',
      'Phone': 'Phone',
      'MapPin': 'Location'
    };

    return labels[iconName] || iconName.replace(/([A-Z])/g, ' $1').trim();
  }

  generateReport() {
    const total = Object.values(this.fixesApplied).reduce((a, b) => a + b, 0);

    return {
      timestamp: new Date().toISOString(),
      filesModified: this.filesModified.size,
      fixesApplied: this.fixesApplied,
      totalFixes: total
    };
  }
}

// Run fixer
console.log('🔧 Starting Safe Accessibility Fixes...\n');
console.log('This will add aria-labels to:');
console.log('  - Icon-only buttons');
console.log('  - Icon-only links');
console.log('  - Simple inputs (single-line only)\n');
console.log('='.repeat(60));

const fixer = new SafeAccessibilityFixer();
const srcPath = join(process.cwd(), 'src');

fixer.fixDirectory(srcPath);

const report = fixer.generateReport();

console.log('\n' + '='.repeat(60));
console.log('\n✅ Safe Accessibility Fixes Complete!\n');
console.log(`📊 Summary:`);
console.log(`  Files Modified: ${report.filesModified}`);
console.log(`  Button Aria-Labels: ${report.fixesApplied.buttonAriaLabels}`);
console.log(`  Link Aria-Labels: ${report.fixesApplied.linkAriaLabels}`);
console.log(`  Input Aria-Labels: ${report.fixesApplied.inputAriaLabels}`);
console.log(`  TOTAL FIXES: ${report.totalFixes}\n`);

writeFileSync(
  join(process.cwd(), 'accessibility-safe-fixes-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('📄 Report saved to: accessibility-safe-fixes-report.json\n');

process.exit(0);
