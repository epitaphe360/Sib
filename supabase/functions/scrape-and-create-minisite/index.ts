import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  userId: string;
  websiteUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    // Parse request body
    const { userId, websiteUrl }: RequestBody = await req.json();

    if (!userId || !websiteUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or websiteUrl' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🌐 Scraping website: ${websiteUrl} for user: ${userId}`);

    // Fetch website content
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SIPortBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();

    // Simple HTML parsing to extract useful information
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    
    // Extract basic info
    const companyName = titleMatch ? titleMatch[1].trim() : 'Mon Entreprise';
    const description = descMatch ? descMatch[1].trim() : h1Match ? h1Match[1].trim() : 'Description de l\'entreprise';

    // Get user and exhibitor info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, exhibitors(*)')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const exhibitor = Array.isArray(user.exhibitors) ? user.exhibitors[0] : user.exhibitors;
    
    if (!exhibitor) {
      throw new Error('Exhibitor profile not found');
    }

    // Create mini-site content
    const miniSiteData = {
      exhibitor_id: exhibitor.id,
      hero_title: companyName,
      hero_subtitle: description,
      about_title: `À propos de ${companyName}`,
      about_content: description,
      contact_email: user.email,
      website_url: websiteUrl,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if minisite already exists
    const { data: existingMinisite } = await supabase
      .from('mini_sites')
      .select('id')
      .eq('exhibitor_id', exhibitor.id)
      .single();

    let miniSiteResult;
    
    if (existingMinisite) {
      // Update existing minisite
      miniSiteResult = await supabase
        .from('mini_sites')
        .update(miniSiteData)
        .eq('exhibitor_id', exhibitor.id)
        .select()
        .single();
    } else {
      // Create new minisite
      miniSiteResult = await supabase
        .from('mini_sites')
        .insert(miniSiteData)
        .select()
        .single();
    }

    if (miniSiteResult.error) {
      throw miniSiteResult.error;
    }

    console.log('✅ Mini-site created/updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        miniSite: miniSiteResult.data,
        message: 'Mini-site créé avec succès'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error creating mini-site:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to create mini-site from website'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
