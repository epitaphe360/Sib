import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
