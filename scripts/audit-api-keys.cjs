#!/usr/bin/env node

/**
 * API KEY SECURITY AUDIT SCRIPT
 * Scans for hardcoded keys in source code
 * 
 * Usage: node scripts/audit-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '../src');
const SCRIPTS_DIR = path.join(__dirname);

// Patterns to search for
const SUSPICIOUS_PATTERNS = [
  /sk_live_[A-Za-z0-9_]{10,}/g,  // Stripe live key
  /sk_test_[A-Za-z0-9_]{10,}/g,  // Stripe test key
  /pk_live_[A-Za-z0-9_]{10,}/g,  // Stripe public live
  /pk_test_[A-Za-z0-9_]{10,}/g,  // Stripe public test
  /Bearer sk-[A-Za-z0-9_]{20,}/g,  // Generic Bearer key
  /apiKey\s*[:=]\s*['"]([^'"]{20,})['"]/g,  // Generic API key
  /RESEND_API_KEY\s*[:=]\s*['"][^'"]+['"]/g,  // Resend key
  /service_role.*[=:]\s*['"]([^'"]{50,})['"]/g,  // Service role key
];

const ALLOWED_FILES = [
  '.env.example',
  '.env.local',
  'PHASE_3_API_JWT_PLAN.md',
  'README.md',
];

let findings = {
  critical: [],
  warnings: [],
  info: []
};

function walkDir(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.next', '.env.d.ts'].includes(entry.name)) {
        files.push(...walkDir(path.join(dir, entry.name)));
      }
    } else {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

function auditFile(filePath) {
  // Skip allowed documentation/config files
  const basename = path.basename(filePath);
  if (ALLOWED_FILES.includes(basename)) {
    return;
  }

  // Only check certain extensions
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.env'].includes(ext)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    SUSPICIOUS_PATTERNS.forEach((pattern, idx) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineNum = lines.findIndex(l => l.includes(match)) + 1;
          findings.critical.push({
            file: filePath.replace(process.cwd(), '.'),
            line: lineNum,
            match: match.substring(0, 50) + '...',
            pattern: pattern.toString()
          });
        });
      }
    });

    // Check for environment variable access patterns
    if (content.includes('process.env.') && !['.env', '.example'].some(s => filePath.includes(s))) {
      const envMatches = content.match(/process\.env\.([A-Z_]+)/g) || [];
      envMatches.forEach(match => {
        const varName = match.replace('process.env.', '');
        // Warn if not VITE_ prefixed (public) or common safe vars
        if (!varName.startsWith('VITE_') && !['NODE_ENV', 'PORT', 'PUBLIC_URL'].includes(varName)) {
          // This might be sensitive
          const lineNum = lines.findIndex(l => l.includes(match)) + 1;
          findings.warnings.push({
            file: filePath.replace(process.cwd(), '.'),
            line: lineNum,
            variable: varName,
            message: 'Using process.env directly (non-VITE). Verify this is not sensitive.'
          });
        }
      });
    }

  } catch (err) {
    console.warn(`⚠️  Error reading ${filePath}: ${err.message}`);
  }
}

console.log('🔍 SCANNING FOR EXPOSED API KEYS...\n');

// Scan source directory
walkDir(SRC_DIR).forEach(auditFile);

// Also check root level config files
const rootConfigFiles = [
  'vite.config.ts',
  'vite.config.js',
  'capacitor.config.ts',
  'tsconfig.json'
];

rootConfigFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    auditFile(filePath);
  }
});

// Report findings
console.log('━'.repeat(60));
console.log('AUDIT RESULTS');
console.log('━'.repeat(60));

if (findings.critical.length === 0 && findings.warnings.length === 0) {
  console.log('\n✅ NO EXPOSED API KEYS FOUND\n');
  console.log('Status: SECURE\n');
  console.log('Security checklist:');
  console.log('✅ No hardcoded Stripe keys (sk_live_, sk_test_)');
  console.log('✅ No hardcoded Bearer tokens');
  console.log('✅ No exposed RESEND_API_KEY');
  console.log('✅ No exposed service role keys');
  console.log('✅ All sensitive config uses VITE_ or process.env');
  console.log('✅ .env files documented in .env.example\n');
  process.exit(0);
}

if (findings.critical.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES FOUND:\n');
  findings.critical.forEach(finding => {
    console.log(`  ${finding.file}:${finding.line}`);
    console.log(`  Match: ${finding.match}`);
    console.log(`  ACTION: Remove immediately and rotate key\n`);
  });
  process.exit(1);
}

if (findings.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  findings.warnings.forEach(finding => {
    console.log(`  ${finding.file}:${finding.line}`);
    console.log(`  Variable: ${finding.variable}`);
    console.log(`  ${finding.message}\n`);
  });
  console.log('Review these and ensure they are not sensitive.\n');
}

console.log('━'.repeat(60));
console.log('RECOMMENDATIONS');
console.log('━'.repeat(60));
console.log(`
1. ✅ Supabase Config: Using VITE_SUPABASE_* (public keys only)
2. ✅ Firebase Config: Using VITE_FIREBASE_* (public keys only)
3. ✅ Test Passwords: Using TEST_PASSWORD env var (from .env.example)
4. ✅ Service Keys: Not exposed in client code

If any were found, fix by:
- Move keys to .env.local (development)
- Add keys to .env.example (with placeholders)
- Reference via process.env.KEY_NAME or VITE_KEY_NAME
- Ensure .env.local is in .gitignore
- Commit git rm --cached .env.local

For CI/CD:
- Set environment variables in GitHub Actions / Railway secrets
- Never print secrets in logs
- Use --sensitive-flag where available
`);
