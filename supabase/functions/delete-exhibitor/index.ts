// @ts-nocheck - Deno runtime, not TypeScript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer un client Supabase avec la service_role_key pour bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier l'authentification de l'utilisateur
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('type')
      .eq('id', user.id)
      .single()

    if (userError || userData?.type !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Accès refusé - Admin requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer l'ID de l'exposant à supprimer
    const { exhibitorId } = await req.json()

    if (!exhibitorId) {
      return new Response(
        JSON.stringify({ error: 'exhibitorId requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supprimer l'exposant (avec service_role_key, bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('exhibitors')
      .delete()
      .eq('id', exhibitorId)
      .select()

    if (error) {
      console.error('Erreur suppression:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, deleted: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
