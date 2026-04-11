import { supabase } from '../lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  capacity: number | null;
  registered: number;
  featured: boolean;
  category: string;
  virtual: boolean;
  meeting_link: string | null;
  tags: string[];
  created_at: string;
}

export class EventsService {
  // Optimized columns for events queries
  private static readonly EVENT_COLUMNS = 'id, title, description, event_date, start_time, end_time, location, capacity, registered, featured, category, virtual, type, tags, speakers, created_at';

  static async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(this.EVENT_COLUMNS)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    return data || [];
  }

  static async getUpcomingEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(this.EVENT_COLUMNS)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }

    return data || [];
  }

  static async getPastEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(this.EVENT_COLUMNS)
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }

    return data || [];
  }

  static async getFeaturedEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(this.EVENT_COLUMNS)
      .eq('featured', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }

    return data || [];
  }

  static async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(this.EVENT_COLUMNS)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data;
  }
}