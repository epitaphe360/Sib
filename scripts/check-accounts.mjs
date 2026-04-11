import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

const { data } = await s.from('users').select('email,status,is_active,role');
console.log('\n=== TOUS LES COMPTES ===\n');
data.forEach(u => {
  const active = u.is_active ? '✅' : '❌';
  console.log(`${active} ${u.email} | ${u.status} | ${u.role}`);
});
console.log('\nTotal:', data.length);
