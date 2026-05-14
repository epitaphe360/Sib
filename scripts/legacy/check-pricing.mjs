import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieWl6dWRpZm1xYWt6eGpsbmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxODcwMSwiZXhwIjoyMDkxNDk0NzAxfQ.-dbIT8rJ1cDoP-USJejVZku6R5MCg_UXvnuEHY1--cY'
);

// Chercher dans toutes les tables plausibles
const tables = ['pricing_plans', 'subscriptions', 'plans', 'tariffs', 'tickets'];
for (const t of tables) {
  const { data, error } = await sb.from(t).select('*').limit(3);
  if (!error) {
    console.log(`\n=== TABLE: ${t} ===`);
    console.log('Columns:', Object.keys(data[0] ?? {}));
    data.forEach(r => console.log(JSON.stringify(r)));
  }
}
