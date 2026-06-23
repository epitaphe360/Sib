/**
 * Crée les comptes démo pour tester l'app mobile (nécessite VITE_SUPABASE_SERVICE_ROLE_KEY à la racine).
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const scripts = [
  'create-test-users.js',
  'create-service-clientele-account.mjs',
];

for (const script of scripts) {
  const path = join(root, 'scripts', script);
  if (!existsSync(path)) {
    console.warn('⚠️  Script introuvable:', path);
    continue;
  }
  console.log('\n▶', script);
  await new Promise((resolve, reject) => {
    const child = spawn('node', [path], { cwd: root, stdio: 'inherit', shell: true });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
  });
}

console.log('\n✅ Comptes démo — lancez: npm run checklist\n');
