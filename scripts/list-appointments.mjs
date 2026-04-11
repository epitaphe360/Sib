import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAppointments() {
    console.log('Fetching appointments...');
    const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          visitor:users!visitor_id(id, name, email),
          exhibitor_user:users!exhibitor_id(
             id, 
             profile:exhibitor_profiles(company_name, logo_url)
          )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data.length} appointments.`);
        if (data.length > 0) console.log(JSON.stringify(data[0], null, 2));
    }
}

listAppointments();
