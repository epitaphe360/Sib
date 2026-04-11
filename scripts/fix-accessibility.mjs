#!/usr/bin/env node

/**
 * Automatic Accessibility Fixes
 * Applies fixes to the 292 identified accessibility issues
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class AccessibilityFixer {
  constructor() {
    this.fixesApplied = {
      inputLabels: 0,
      ariaLabels: 0,
      buttonText: 0,
      imageAlt: 0,
      keyboardAccess: 0
    };
    this.filesModified = new Set();
  }

  /**
   * Fix all accessibility issues in a directory
   */
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

  /**
   * Fix accessibility issues in a single file
   */
  fixFile(filePath, baseDir) {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    const relativePath = filePath.replace(baseDir + '/', '');

    // Skip files that are already accessible
    if (content.includes('FormLabel') || content.includes('AccessibleIcon')) {
      return;
    }

    console.log(`\n📝 Processing: ${relativePath}`);

    // Fix 1: Add imports if needed
    const needsFormLabel = /<input[^>]*>/.test(content) && !content.includes('FormLabel');
    const needsAccessibleIcon = /<button[^>]*>\s*<[A-Z]/.test(content) && !content.includes('AccessibleIcon');

    if (needsFormLabel || needsAccessibleIcon) {
      const imports = this.generateImports(needsFormLabel, needsAccessibleIcon, content);
      if (imports) {
        content = this.addImports(content, imports);
        modified = true;
        console.log('  ✅ Added accessibility imports');
      }
    }

    // Fix 2: Wrap inputs with labels
    const inputFixes = this.fixInputLabels(content);
    if (inputFixes.modified) {
      content = inputFixes.content;
      modified = true;
      this.fixesApplied.inputLabels += inputFixes.count;
      console.log(`  ✅ Fixed ${inputFixes.count} input labels`);
    }

    // Fix 3: Add aria-labels to icon buttons
    const buttonFixes = this.fixIconButtons(content);
    if (buttonFixes.modified) {
      content = buttonFixes.content;
      modified = true;
      this.fixesApplied.ariaLabels += buttonFixes.count;
      console.log(`  ✅ Added ${buttonFixes.count} aria-labels to buttons`);
    }

    // Fix 4: Add aria-labels to icon links
    const linkFixes = this.fixIconLinks(content);
    if (linkFixes.modified) {
      content = linkFixes.content;
      modified = true;
      this.fixesApplied.ariaLabels += linkFixes.count;
      console.log(`  ✅ Added ${linkFixes.count} aria-labels to links`);
    }

    // Fix 5: Add alt to images
    const imageFixes = this.fixImageAlt(content);
    if (imageFixes.modified) {
      content = imageFixes.content;
      modified = true;
      this.fixesApplied.imageAlt += imageFixes.count;
      console.log(`  ✅ Added ${imageFixes.count} alt texts to images`);
    }

    // Fix 6: Add keyboard access to clickable divs
    const keyboardFixes = this.fixKeyboardAccess(content);
    if (keyboardFixes.modified) {
      content = keyboardFixes.content;
      modified = true;
      this.fixesApplied.keyboardAccess += keyboardFixes.count;
      console.log(`  ✅ Added keyboard access to ${keyboardFixes.count} elements`);
    }

    if (modified) {
      writeFileSync(filePath, content);
      this.filesModified.add(relativePath);
      console.log('  💾 File saved');
    }
  }

  /**
   * Generate import statements
   */
  generateImports(needsFormLabel, needsAccessibleIcon, content) {
    const imports = [];

    // Check if we're in components/ui (don't import from self)
    const isUIComponent = content.includes('export') && content.includes('memo');

    if (needsFormLabel && !isUIComponent) {
      imports.push("import { FormLabel } from '../ui/FormLabel';");
    }
    if (needsAccessibleIcon && !isUIComponent) {
      imports.push("import { AccessibleIcon } from '../ui/AccessibleIcon';");
    }

    return imports.join('\n');
  }

  /**
   * Add imports to file
   */
  addImports(content, imports) {
    // Find the last import statement
    const importRegex = /import[^;]+;/g;
    const matches = content.match(importRegex);

    if (matches && matches.length > 0) {
      const lastImport = matches[matches.length - 1];
      const index = content.lastIndexOf(lastImport) + lastImport.length;
      return content.slice(0, index) + '\n' + imports + content.slice(index);
    }

    return imports + '\n\n' + content;
  }

  /**
   * Fix input labels
   */
  fixInputLabels(content) {
    let modified = false;
    let count = 0;
    let result = content;

    // Find inputs without labels
    const inputRegex = /<input\s+([^>]*?)>/g;
    let match;

    while ((match = inputRegex.exec(content)) !== null) {
      const inputTag = match[0];
      const attrs = match[1];

      // Skip if already has id or aria-label or is hidden/submit
      if (attrs.includes('id=') || attrs.includes('aria-label=') ||
          attrs.includes('type="hidden"') || attrs.includes('type="submit"')) {
        continue;
      }

      // Extract type and placeholder for label text
      const typeMatch = attrs.match(/type=["']([^"']+)["']/);
      const placeholderMatch = attrs.match(/placeholder=["']([^"']+)["']/);
      const nameMatch = attrs.match(/name=["']([^"']+)["']/);

      const type = typeMatch ? typeMatch[1] : 'text';
      const placeholder = placeholderMatch ? placeholderMatch[1] : '';
      const name = nameMatch ? nameMatch[1] : type;

      // Generate label text
      const labelText = placeholder || this.capitalize(name);
      const inputId = `input-${name}-${count}`;

      // Create wrapped input with label
      const wrappedInput = `
      <div className="mb-4">
        <label htmlFor="${inputId}" className="block text-sm font-medium text-gray-700 mb-1">
          ${labelText}
        </label>
        <input id="${inputId}" ${attrs} aria-label="${labelText}" />
      </div>`.trim();

      // Only replace if not already in a label structure
      const before = content.slice(Math.max(0, match.index - 100), match.index);
      if (!before.includes('<label') && !before.includes('htmlFor=')) {
        result = result.replace(inputTag, wrappedInput);
        modified = true;
        count++;
      }
    }

    return { modified, count, content: result };
  }

  /**
   * Fix icon buttons
   */
  fixIconButtons(content) {
    let modified = false;
    let count = 0;
    let result = content;

    // Find buttons with only icons
    const buttonRegex = /<button([^>]*)>\s*<([A-Z][a-zA-Z]*)\s+className=["'][^"']*["']\s*\/>\s*<\/button>/g;
    let match;

    while ((match = buttonRegex.exec(content)) !== null) {
      const buttonAttrs = match[1];
      const iconName = match[2];

      // Skip if already has aria-label
      if (buttonAttrs.includes('aria-label=')) {
        continue;
      }

      // Generate aria-label from icon name
      const label = this.iconToLabel(iconName);
      const newButton = match[0].replace('<button', `<button aria-label="${label}"`);

      result = result.replace(match[0], newButton);
      modified = true;
      count++;
    }

    return { modified, count, content: result };
  }

  /**
   * Fix icon links
   */
  fixIconLinks(content) {
    let modified = false;
    let count = 0;
    let result = content;

    // Find Link/a tags with only icons
    const linkRegex = /<(?:Link|a)([^>]*)>\s*<([A-Z][a-zA-Z]*)\s+className=["'][^"']*["']\s*\/>\s*<\/(?:Link|a)>/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkAttrs = match[1];
      const iconName = match[2];

      // Skip if already has aria-label
      if (linkAttrs.includes('aria-label=')) {
        continue;
      }

      // Generate aria-label from icon name
      const label = this.iconToLabel(iconName);
      const newLink = match[0].replace(/^<(Link|a)/, `<$1 aria-label="${label}"`);

      result = result.replace(match[0], newLink);
      modified = true;
      count++;
    }

    return { modified, count, content: result };
  }

  /**
   * Fix image alt attributes
   */
  fixImageAlt(content) {
    let modified = false;
    let count = 0;
    let result = content;

    // Find img tags without alt
    const imgRegex = /<img\s+([^>]*?)>/g;
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
      const imgTag = match[0];
      const attrs = match[1];

      // Skip if already has alt
      if (attrs.includes('alt=')) {
        continue;
      }

      // Extract src for alt text
      const srcMatch = attrs.match(/src=["']([^"']+)["']/);
      const src = srcMatch ? srcMatch[1] : '';

      // Generate alt text
      const altText = this.generateAltText(src);
      const newImg = imgTag.replace('<img', `<img alt="${altText}"`);

      result = result.replace(imgTag, newImg);
      modified = true;
      count++;
    }

    return { modified, count, content: result };
  }

  /**
   * Fix keyboard accessibility
   */
  fixKeyboardAccess(content) {
    let modified = false;
    let count = 0;
    let result = content;

    // Find divs with onClick but no role/tabIndex
    const divOnClickRegex = /<div([^>]*)onClick={([^}]+)}/g;
    let match;

    while ((match = divOnClickRegex.exec(content)) !== null) {
      const divAttrs = match[1];
      const onClick = match[2];

      // Skip if already has role and tabIndex
      if (divAttrs.includes('role=') && divAttrs.includes('tabIndex')) {
        continue;
      }

      // Add role, tabIndex, and onKeyDown
      let newDiv = match[0];

      if (!divAttrs.includes('role=')) {
        newDiv = newDiv.replace('<div', '<div role="button"');
      }

      if (!divAttrs.includes('tabIndex')) {
        newDiv = newDiv.replace('<div', '<div tabIndex={0}');
      }

      if (!divAttrs.includes('onKeyDown')) {
        const keyHandler = `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ${onClick}(); } }}`;
        newDiv = newDiv.replace('onClick=', `${keyHandler} onClick=`);
      }

      result = result.replace(match[0], newDiv);
      modified = true;
      count++;
    }

    return { modified, count, content: result };
  }

  /**
   * Helper: Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper: Convert icon name to label
   */
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
      'Calendar': 'Calendar'
    };

    return labels[iconName] || iconName.replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Helper: Generate alt text from src
   */
  generateAltText(src) {
    if (!src) return 'Image';

    // Extract filename
    const filename = src.split('/').pop().split('.')[0];

    // Convert to readable text
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  /**
   * Generate report
   */
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
console.log('🔧 Starting Automatic Accessibility Fixes...\n');
console.log('This will fix:');
console.log('  - Input labels (222 issues)');
console.log('  - Button/link aria-labels (70 issues)');
console.log('  - Image alt attributes');
console.log('  - Keyboard accessibility\n');
console.log('=' .repeat(60));

const fixer = new AccessibilityFixer();
const srcPath = join(process.cwd(), 'src');

fixer.fixDirectory(srcPath);

const report = fixer.generateReport();

console.log('\n' + '='.repeat(60));
console.log('\n✅ Accessibility Fixes Complete!\n');
console.log(`📊 Summary:`);
console.log(`  Files Modified: ${report.filesModified}`);
console.log(`  Input Labels Fixed: ${report.fixesApplied.inputLabels}`);
console.log(`  Aria Labels Added: ${report.fixesApplied.ariaLabels}`);
console.log(`  Image Alt Added: ${report.fixesApplied.imageAlt}`);
console.log(`  Keyboard Access Added: ${report.fixesApplied.keyboardAccess}`);
console.log(`  TOTAL FIXES: ${report.totalFixes}\n`);

// Save report
writeFileSync(
  join(process.cwd(), 'accessibility-fixes-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('📄 Report saved to: accessibility-fixes-report.json\n');
console.log('🎯 Next steps:');
console.log('  1. Review the changes (git diff)');
console.log('  2. Test critical forms');
console.log('  3. Re-run audit: node scripts/accessibility-audit.mjs');
console.log('  4. Commit changes\n');

process.exit(0);
