// @ts-nocheck - Deno runtime, not TypeScript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Vérifier que l'appelant est authentifié (exposant ou partenaire)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Token invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'appelant est exposant, partenaire ou admin
    const { data: callerData } = await supabaseAdmin
      .from('users')
      .select('type')
      .eq('id', caller.id)
      .single()

    const allowedTypes = ['exhibitor', 'admin']
    if (!callerData || !allowedTypes.includes(callerData.type)) {
      return new Response(
        JSON.stringify({ error: 'Accès refusé' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, password, first_name, last_name, company_name, stand_number, owner_id, exhibitor_id } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'email et password sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le compte auth via Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        company_name,
        stand_number,
        role: 'collaborator',
        owner_id,
        exhibitor_id,
      },
    })

    if (createError) {
      // Si l'utilisateur existe déjà, récupérer son ID
      if (createError.message?.includes('already registered') || createError.message?.includes('already been registered')) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existing = existingUsers?.users?.find((u) => u.email === email)
        if (existing) {
          return new Response(
            JSON.stringify({ user_id: existing.id, existing: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer l'entrée dans la table users (type exhibitor — le rôle collaborateur est dans user_metadata)
    const { error: userUpsertError } = await supabaseAdmin.from('users').upsert({
      id: newUser.user.id,
      email,
      name: `${first_name} ${last_name}`.trim(),
      type: 'exhibitor',
      status: 'active',
      profile: { company: company_name || null, role: 'collaborator' },
      created_at: new Date().toISOString(),
    }, { onConflict: 'id', ignoreDuplicates: true })

    if (userUpsertError) {
      console.error('users upsert:', userUpsertError)
      return new Response(
        JSON.stringify({ error: userUpsertError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ user_id: newUser.user.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
