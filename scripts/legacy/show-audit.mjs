import fs from 'fs';
const report = JSON.parse(fs.readFileSync('./translation-audit-report.json', 'utf8'));

console.log('\nMISSING KEYS BY NAMESPACE:\n');
Object.entries(report.missingByNamespace)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .forEach(([ns, keys]) => {
    console.log(`  [${ns}]: ${keys.length} missing keys`);
  });

console.log('\n\nUNUSED KEYS BY NAMESPACE:\n');
Object.entries(report.unusedByNamespace)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 15)
  .forEach(([ns, keys]) => {
    console.log(`  [${ns}]: ${keys.length} unused keys`);
  });
