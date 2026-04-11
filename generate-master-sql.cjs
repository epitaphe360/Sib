const fs = require('fs');
const path = require('path');

const migrDir = 'c:/Users/samye/OneDrive/Desktop/devellopement/SIB/Sib/sib-app/supabase/migrations';
const out = 'c:/Users/samye/OneDrive/Desktop/devellopement/SIB/Sib/sib-app/supabase/master_migration.sql';

const files = fs.readdirSync(migrDir).filter(f => f.endsWith('.sql')).sort();
let sql = '-- SIB 2026 - Master Migration (' + files.length + ' fichiers)\n';
sql += '-- Appliquer dans Supabase SQL Editor\n\n';

files.forEach(f => {
  sql += '\n-- [' + f + ']\n';
  sql += fs.readFileSync(path.join(migrDir, f), 'utf8') + '\n';
});

fs.writeFileSync(out, sql, 'utf8');
console.log('Done:', Math.round(fs.statSync(out).size / 1024), 'KB,', files.length, 'fichiers');
