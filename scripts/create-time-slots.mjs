import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTimeSlots() {
  try {
    // Get the exhibitor we created
    const { data: exhibitor } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('user_id', '876d922a-0940-4428-b706-e9268ab77a7d')
      .single();

    if (!exhibitor) {
      throw new Error('Exhibitor not found');
    }

    console.log('Found exhibitor:', exhibitor.id);

    // Create time slots for the next few days
    const now = new Date();
    const timeSlots = [];

    // Create slots for the next 3 days
    for (let day = 1; day <= 3; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);

      // Create slots from 9 AM to 5 PM
      for (let hour = 9; hour <= 17; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);

        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          start_time: `${hour.toString().padStart(2, '0')}:00:00`, // HH:MM:SS format
          end_time: `${(hour + 1).toString().padStart(2, '0')}:00:00`, // HH:MM:SS format
          duration: 60, // 60 minutes
          type: 'in-person',
          max_bookings: 1,
          current_bookings: 0,
          available: true,
          location: 'Meeting Room A'
        });
      }
    }

    // Insert time slots
    const { data: slots, error } = await supabase
      .from('time_slots')
      .insert(timeSlots)
      .select('*');

    if (error) throw error;

    console.log(`Created ${slots.length} time slots for exhibitor`);

    // Show a few examples
    console.log('Example slots:');
    slots.slice(0, 3).forEach(slot => {
      console.log(`- ${slot.slot_date} ${slot.start_time} to ${slot.end_time} (${slot.available ? 'Available' : 'Booked'})`);
    });

  } catch (error) {
    console.error('Failed to create time slots:', error);
    throw error;
  }
}

createTimeSlots().catch(console.error);
