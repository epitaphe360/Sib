const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieWl6dWRpZm1xYWt6eGpsbmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkxODcwMSwiZXhwIjoyMDkxNDk0NzAxfQ.-dbIT8rJ1cDoP-USJejVZku6R5MCg_UXvnuEHY1--cY'
);

const policies = [
  {
    name: 'Allow authenticated uploads to public bucket',
    sql: `CREATE POLICY "Allow authenticated uploads to public bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public');`
  },
  {
    name: 'Allow authenticated updates in public bucket',
    sql: `CREATE POLICY "Allow authenticated updates in public bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'public') WITH CHECK (bucket_id = 'public');`
  },
  {
    name: 'Allow public read access to public bucket',
    sql: `CREATE POLICY "Allow public read access to public bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'public');`
  },
  {
    name: 'Allow authenticated deletes from public bucket',
    sql: `CREATE POLICY "Allow authenticated deletes from public bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'public');`
  },
  {
    name: 'Allow authenticated uploads to salon-assets',
    sql: `CREATE POLICY "Allow authenticated uploads to salon-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'salon-assets');`
  },
  {
    name: 'Allow authenticated updates in salon-assets',
    sql: `CREATE POLICY "Allow authenticated updates in salon-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'salon-assets') WITH CHECK (bucket_id = 'salon-assets');`
  },
  {
    name: 'Allow public read salon-assets',
    sql: `CREATE POLICY "Allow public read salon-assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'salon-assets');`
  },
  {
    name: 'Allow authenticated uploads to exhibitor-logos',
    sql: `CREATE POLICY "Allow authenticated uploads to exhibitor-logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exhibitor-logos');`
  },
  {
    name: 'Allow authenticated updates in exhibitor-logos',
    sql: `CREATE POLICY "Allow authenticated updates in exhibitor-logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'exhibitor-logos') WITH CHECK (bucket_id = 'exhibitor-logos');`
  },
  {
    name: 'Allow public read exhibitor-logos',
    sql: `CREATE POLICY "Allow public read exhibitor-logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'exhibitor-logos');`
  },
  {
    name: 'Allow authenticated uploads to partner-logos',
    sql: `CREATE POLICY "Allow authenticated uploads to partner-logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'partner-logos');`
  },
  {
    name: 'Allow authenticated updates in partner-logos',
    sql: `CREATE POLICY "Allow authenticated updates in partner-logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'partner-logos') WITH CHECK (bucket_id = 'partner-logos');`
  },
  {
    name: 'Allow public read partner-logos',
    sql: `CREATE POLICY "Allow public read partner-logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'partner-logos');`
  }
];

async function run() {
  for (const p of policies) {
    const { error } = await supabase.rpc('exec_sql', { sql_text: p.sql });
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ ${p.name} (déjà existante)`);
      } else {
        console.log(`❌ ${p.name}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${p.name} créée`);
    }
  }
}

run();
