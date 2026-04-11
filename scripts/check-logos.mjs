import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

const { data, error } = await supabase
  .from('exhibitors')
  .select('id, company_name, logo_url, website')
  .order('company_name');

if (error) {
  console.log('ERROR:', error.message);
  process.exit(1);
}

console.log(`\n=== ${data.length} exposants ===\n`);

let withLogo = 0;
let withoutLogo = 0;

for (const e of data) {
  const hasLogo = e.logo_url && e.logo_url.trim() !== '';
  if (hasLogo) withLogo++;
  else withoutLogo++;
  console.log(`${hasLogo ? '✅' : '❌'} ${e.company_name} | logo: ${e.logo_url || 'NULL'} | web: ${e.website || 'N/A'}`);
}

console.log(`\n--- Résumé ---`);
console.log(`Avec logo: ${withLogo}`);
console.log(`Sans logo: ${withoutLogo}`);
