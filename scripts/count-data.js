import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  // Compter exhibitors
  const { count: exhibCount } = await supabase
    .from('exhibitors')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total Exhibitors: ${exhibCount}`);
  
  // Compter projets
  const { count: projectCount } = await supabase
    .from('partner_projects')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Partner Projects: ${projectCount}`);
  
  // Compter mini sites
  const { count: miniSiteCount } = await supabase
    .from('mini_sites')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Mini Sites: ${miniSiteCount}`);
  
  // Compter produits
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total Products: ${productCount}\n`);
}

checkDB().catch(console.error);
