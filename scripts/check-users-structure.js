import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function main() {
  // Voir la structure
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.log('Erreur:', error);
  } else {
    console.log('Structure users:');
    console.log(Object.keys(data[0] || {}));
    console.log('\nExemple:');
    console.log(JSON.stringify(data[0], null, 2));
  }
}

main();
