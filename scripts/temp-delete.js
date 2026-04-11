import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://eqjoqgpbxhsfgcovipgu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo');

console.log('Suppression des partenaires...');
await supabase.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
console.log(' Partenaires supprimés');
