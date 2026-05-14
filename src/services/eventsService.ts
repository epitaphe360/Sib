import { supabase } from '../lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  capacity: number | null;
  registered: number;
  is_featured: boolean;
  image_url: string | null;
  registration_url: string | null;
  tags: string[];
  created_at: string;
}

export class EventsService {
  // Colonnes réelles de la table events
  private static readonly EVENT_COLUMNS = 'id, title, description, event_type, start_date, end_date, location, capacity, registered, is_featured, image_url, registration_url, tags, created_at';

  static async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(this.EVENT_COLUMNS)
      .order('start_date', { ascending: false });

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
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

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
      .lt('start_date', new Date().toISOString())
      .order('start_date', { ascending: false });

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
      .eq('is_featured', true)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

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