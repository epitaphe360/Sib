#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * Analyzes React components for WCAG 2.1 AA compliance
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const WCAG_RULES = {
  // Form elements must have labels
  MISSING_LABEL: {
    severity: 'critical',
    description: 'Form input missing associated label',
    wcag: '3.3.2 Labels or Instructions (Level A)'
  },
  // Interactive elements need aria-label or text
  MISSING_ARIA_LABEL: {
    severity: 'serious',
    description: 'Interactive element missing accessible name',
    wcag: '4.1.2 Name, Role, Value (Level A)'
  },
  // Buttons need accessible text
  BUTTON_NO_TEXT: {
    severity: 'critical',
    description: 'Button has no accessible text',
    wcag: '2.4.4 Link Purpose (Level A)'
  },
  // Images need alt text
  IMAGE_NO_ALT: {
    severity: 'critical',
    description: 'Image missing alt attribute',
    wcag: '1.1.1 Non-text Content (Level A)'
  },
  // Links need descriptive text
  LINK_NO_TEXT: {
    severity: 'serious',
    description: 'Link has no accessible text',
    wcag: '2.4.4 Link Purpose (Level A)'
  },
  // Color contrast
  COLOR_CONTRAST: {
    severity: 'serious',
    description: 'Insufficient color contrast',
    wcag: '1.4.3 Contrast (Level AA)'
  },
  // Keyboard accessibility
  NO_KEYBOARD_ACCESS: {
    severity: 'serious',
    description: 'Element not keyboard accessible',
    wcag: '2.1.1 Keyboard (Level A)'
  }
};

class AccessibilityAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      filesScanned: 0,
      components: 0,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };
  }

  /**
   * Scan a directory recursively for React components
   */
  scanDirectory(dir, baseDir = dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules, dist, build
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          this.scanDirectory(filePath, baseDir);
        }
      } else if (['.tsx', '.jsx'].includes(extname(file))) {
        this.auditFile(filePath, baseDir);
      }
    }
  }

  /**
   * Audit a single file for accessibility issues
   */
  auditFile(filePath, baseDir) {
    this.stats.filesScanned++;
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = filePath.replace(baseDir + '/', '');

    // Count components
    const componentMatches = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/g);
    if (componentMatches) {
      this.stats.components += componentMatches.length;
    }

    // Check for inputs without labels
    this.checkInputLabels(content, relativePath);

    // Check for buttons without text
    this.checkButtonText(content, relativePath);

    // Check for images without alt
    this.checkImageAlt(content, relativePath);

    // Check for links without text
    this.checkLinkText(content, relativePath);

    // Check for interactive elements without aria-label
    this.checkAriaLabels(content, relativePath);

    // Check for keyboard accessibility
    this.checkKeyboardAccess(content, relativePath);
  }

  /**
   * Check for input elements without proper labels
   */
  checkInputLabels(content, filePath) {
    // Find input elements
    const inputRegex = /<input[^>]*>/g;
    const inputs = content.match(inputRegex) || [];

    for (const input of inputs) {
      const hasId = /id=["']([^"']+)["']/.test(input);
      const hasAriaLabel = /aria-label=["']([^"']+)["']/.test(input);
      const hasAriaLabelledBy = /aria-labelledby=["']([^"']+)["']/.test(input);
      const inputType = input.match(/type=["']([^"']+)["']/)?.[1];

      // Skip hidden and submit inputs
      if (inputType === 'hidden' || inputType === 'submit') continue;

      if (!hasAriaLabel && !hasAriaLabelledBy) {
        // Check if there's a label with matching htmlFor
        if (hasId) {
          const inputId = input.match(/id=["']([^"']+)["']/)[1];
          const hasMatchingLabel = new RegExp(`htmlFor=["']${inputId}["']`).test(content);
          if (!hasMatchingLabel) {
            this.addIssue('MISSING_LABEL', filePath, input);
          }
        } else {
          this.addIssue('MISSING_LABEL', filePath, input);
        }
      }
    }
  }

  /**
   * Check for buttons without accessible text
   */
  checkButtonText(content, filePath) {
    // Find button elements
    const buttonRegex = /<button[^>]*>[\s\S]*?<\/button>/g;
    const buttons = content.match(buttonRegex) || [];

    for (const button of buttons) {
      const hasAriaLabel = /aria-label=["']([^"']+)["']/.test(button);
      const hasAriaLabelledBy = /aria-labelledby=["']([^"']+)["']/.test(button);
      const hasText = />([^<]+)</.test(button) || /<[A-Z]/.test(button); // Has text or component children

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasText) {
        this.addIssue('BUTTON_NO_TEXT', filePath, button.substring(0, 100));
      }
    }

    // Check for onClick on non-button elements
    const onClickDivs = /<(?!button|a\s)[a-z]+[^>]*onClick/g;
    const clickableDivs = content.match(onClickDivs) || [];

    for (const element of clickableDivs) {
      const hasRole = /role=["']button["']/.test(element);
      const hasTabIndex = /tabIndex/.test(element);

      if (!hasRole || !hasTabIndex) {
        this.addIssue('NO_KEYBOARD_ACCESS', filePath, element);
      }
    }
  }

  /**
   * Check for images without alt text
   */
  checkImageAlt(content, filePath) {
    const imgRegex = /<img[^>]*>/g;
    const images = content.match(imgRegex) || [];

    for (const img of images) {
      const hasAlt = /alt=/.test(img);
      const hasAriaLabel = /aria-label=/.test(img);

      if (!hasAlt && !hasAriaLabel) {
        this.addIssue('IMAGE_NO_ALT', filePath, img);
      }
    }
  }

  /**
   * Check for links without descriptive text
   */
  checkLinkText(content, filePath) {
    const linkRegex = /<(?:a|Link)[^>]*>[\s\S]*?<\/(?:a|Link)>/g;
    const links = content.match(linkRegex) || [];

    for (const link of links) {
      const hasAriaLabel = /aria-label=["']([^"']+)["']/.test(link);
      const hasText = />([^<\s]+)</.test(link) || /<[A-Z]/.test(link);

      if (!hasAriaLabel && !hasText) {
        this.addIssue('LINK_NO_TEXT', filePath, link.substring(0, 100));
      }
    }
  }

  /**
   * Check for interactive elements without aria-labels
   */
  checkAriaLabels(content, filePath) {
    // Find icon-only buttons
    const iconButtonRegex = /<button[^>]*>[\s]*<[A-Z][a-zA-Z]*\s+className=["'][^"']*icon/g;
    const iconButtons = content.match(iconButtonRegex) || [];

    for (const button of iconButtons) {
      const hasAriaLabel = /aria-label=/.test(button);
      if (!hasAriaLabel) {
        this.addIssue('MISSING_ARIA_LABEL', filePath, button);
      }
    }
  }

  /**
   * Check for keyboard accessibility
   */
  checkKeyboardAccess(content, filePath) {
    // Check for onClick on divs without keyboard handlers
    const onClickDivRegex = /<div[^>]*onClick[^>]*>/g;
    const clickableDivs = content.match(onClickDivRegex) || [];

    for (const div of clickableDivs) {
      const hasOnKeyDown = /onKeyDown/.test(div) || /onKeyPress/.test(div);
      const hasRole = /role=/.test(div);
      const hasTabIndex = /tabIndex/.test(div);

      if (!hasOnKeyDown || !hasRole || !hasTabIndex) {
        this.addIssue('NO_KEYBOARD_ACCESS', filePath, div.substring(0, 100));
      }
    }
  }

  /**
   * Add an issue to the report
   */
  addIssue(ruleId, filePath, element) {
    const rule = WCAG_RULES[ruleId];
    this.issues.push({
      ruleId,
      severity: rule.severity,
      description: rule.description,
      wcag: rule.wcag,
      file: filePath,
      element: element.substring(0, 150)
    });

    // Update stats
    if (rule.severity === 'critical') this.stats.critical++;
    else if (rule.severity === 'serious') this.stats.serious++;
    else if (rule.severity === 'moderate') this.stats.moderate++;
    else this.stats.minor++;
  }

  /**
   * Generate audit report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      summary: {
        totalIssues: this.issues.length,
        passRate: Math.max(0, 100 - (this.issues.length / this.stats.components) * 10).toFixed(1) + '%',
        score: this.calculateScore()
      },
      issuesByFile: this.groupIssuesByFile(),
      issuesBySeverity: this.groupIssuesBySeverity(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Calculate accessibility score
   */
  calculateScore() {
    const criticalWeight = 10;
    const seriousWeight = 5;
    const moderateWeight = 2;
    const minorWeight = 1;

    const totalPenalty =
      (this.stats.critical * criticalWeight) +
      (this.stats.serious * seriousWeight) +
      (this.stats.moderate * moderateWeight) +
      (this.stats.minor * minorWeight);

    const maxScore = 10;
    const score = Math.max(0, maxScore - (totalPenalty / (this.stats.components || 1)));

    return Math.round(score * 10) / 10;
  }

  /**
   * Group issues by file
   */
  groupIssuesByFile() {
    const grouped = {};
    for (const issue of this.issues) {
      if (!grouped[issue.file]) {
        grouped[issue.file] = [];
      }
      grouped[issue.file].push(issue);
    }
    return grouped;
  }

  /**
   * Group issues by severity
   */
  groupIssuesBySeverity() {
    const grouped = {
      critical: [],
      serious: [],
      moderate: [],
      minor: []
    };

    for (const issue of this.issues) {
      grouped[issue.severity].push(issue);
    }

    return grouped;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.critical > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Fix Critical Accessibility Issues',
        description: `${this.stats.critical} critical issues found that prevent users from accessing content.`,
        action: 'Address all critical issues immediately before deployment.'
      });
    }

    if (this.stats.serious > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Fix Serious Accessibility Issues',
        description: `${this.stats.serious} serious issues found that significantly impact user experience.`,
        action: 'Address serious issues in the next sprint.'
      });
    }

    recommendations.push({
      priority: 'LOW',
      title: 'Apply Accessible Button Pattern',
      description: 'Use the AccessibleButton.tsx component as a template for all interactive elements.',
      action: 'Refactor existing buttons to use the accessible pattern.'
    });

    recommendations.push({
      priority: 'MEDIUM',
      title: 'Add ARIA Labels',
      description: 'All interactive elements need descriptive labels for screen readers.',
      action: 'Add aria-label or aria-labelledby to all buttons, links, and inputs.'
    });

    recommendations.push({
      priority: 'MEDIUM',
      title: 'Keyboard Navigation',
      description: 'Ensure all interactive elements are keyboard accessible.',
      action: 'Add proper keyboard event handlers (onKeyDown) and tabIndex to clickable elements.'
    });

    return recommendations;
  }
}

// Run audit
console.log('🔍 Starting Accessibility Audit...\n');

const auditor = new AccessibilityAuditor();
const srcPath = join(process.cwd(), 'src');

auditor.scanDirectory(srcPath);

const report = auditor.generateReport();

// Print summary
console.log('📊 Audit Summary');
console.log('================');
console.log(`Files Scanned: ${report.stats.filesScanned}`);
console.log(`Components Analyzed: ${report.stats.components}`);
console.log(`Total Issues: ${report.summary.totalIssues}`);
console.log(`\nIssues by Severity:`);
console.log(`  🔴 Critical: ${report.stats.critical}`);
console.log(`  🟠 Serious: ${report.stats.serious}`);
console.log(`  🟡 Moderate: ${report.stats.moderate}`);
console.log(`  🔵 Minor: ${report.stats.minor}`);
console.log(`\n✨ Accessibility Score: ${report.summary.score}/10`);
console.log(`📈 Pass Rate: ${report.summary.passRate}`);

// Print top issues
console.log('\n🔍 Top Issues by File:');
const topFiles = Object.entries(report.issuesByFile)
  .sort(([, a], [, b]) => b.length - a.length)
  .slice(0, 10);

for (const [file, issues] of topFiles) {
  console.log(`  ${file}: ${issues.length} issues`);
}

// Print recommendations
console.log('\n💡 Recommendations:');
for (const rec of report.recommendations) {
  console.log(`  [${rec.priority}] ${rec.title}`);
  console.log(`      ${rec.description}`);
}

// Save detailed report
const reportPath = join(process.cwd(), 'accessibility-audit-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Detailed report saved to: accessibility-audit-report.json`);

// Exit with error if critical issues found
if (report.stats.critical > 0) {
  console.log('\n❌ Audit failed: Critical accessibility issues found');
  process.exit(1);
} else if (report.stats.serious > 5) {
  console.log('\n⚠️  Warning: Multiple serious accessibility issues found');
  process.exit(0);
} else {
  console.log('\n✅ Audit passed: No critical issues found');
  process.exit(0);
}
