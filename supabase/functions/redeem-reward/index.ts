import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Brak autoryzacji' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // User client for auth
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nieautoryzowany' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin client for operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { reward_id, salon_id } = await req.json()
    if (!reward_id || !salon_id) {
      return new Response(JSON.stringify({ error: 'Brak reward_id lub salon_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch reward
    const { data: reward, error: rewardErr } = await adminClient
      .from('loyalty_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('salon_id', salon_id)
      .eq('is_active', true)
      .single()

    if (rewardErr || !reward) {
      return new Response(JSON.stringify({ error: 'Nagroda nie istnieje lub jest nieaktywna' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate user's total points for this salon
    const { data: stamps } = await adminClient
      .from('loyalty_stamps')
      .select('points')
      .eq('user_id', user.id)
      .eq('salon_id', salon_id)

    const totalPoints = (stamps || []).reduce((sum: number, s: { points: number }) => sum + (s.points || 0), 0)

    // Calculate already spent points (pending/confirmed redemptions)
    const { data: existingRedemptions } = await adminClient
      .from('loyalty_redemptions')
      .select('points_spent')
      .eq('user_id', user.id)
      .eq('salon_id', salon_id)
      .in('status', ['pending', 'confirmed'])

    const spentPoints = (existingRedemptions || []).reduce((sum: number, r: { points_spent: number }) => sum + r.points_spent, 0)
    const availablePoints = totalPoints - spentPoints

    if (availablePoints < reward.points_required) {
      return new Response(JSON.stringify({ error: 'Niewystarczająca liczba punktów', available: availablePoints, required: reward.points_required }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate unique code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'REW-'
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }

    // Insert redemption
    const { data: redemption, error: insertErr } = await adminClient
      .from('loyalty_redemptions')
      .insert({
        user_id: user.id,
        salon_id,
        reward_id,
        points_spent: reward.points_required,
        redemption_code: code,
        status: 'pending',
      })
      .select()
      .single()

    if (insertErr) {
      // Handle unique code collision
      if (insertErr.code === '23505') {
        return new Response(JSON.stringify({ error: 'Spróbuj ponownie' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      throw insertErr
    }

    return new Response(JSON.stringify({
      success: true,
      redemption,
      remaining_points: availablePoints - reward.points_required,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
