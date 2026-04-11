const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('.env not found. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exitCode = 1;
} else {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const map = {};
  for (const l of lines) {
    const idx = l.indexOf('=');
    if (idx > 0) {
      const k = l.substring(0, idx).trim();
      const v = l.substring(idx+1).trim();
      map[k] = v;
    }
  }

  const url = map.VITE_SUPABASE_URL || '';
  const anon = map.VITE_SUPABASE_ANON_KEY || '';
  let ok = true;
  if (!url || !url.startsWith('https://') || url.includes('placeholder')) {
    console.error('VITE_SUPABASE_URL looks invalid or missing');
    ok = false;
  }
  if (!anon || anon.length < 50 || anon.startsWith('demo_') || anon.includes('placeholder')) {
    console.error('VITE_SUPABASE_ANON_KEY looks invalid or missing');
    ok = false;
  }
  if (!ok) process.exitCode = 2;
  else console.log('Supabase env variables look OK (not printed).');
}
