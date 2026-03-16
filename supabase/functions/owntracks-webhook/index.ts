import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Debug endpoint - shows all Device IDs in database
  if (req.method === 'GET' && new URL(req.url).searchParams.get('debug') === 'device-ids') {
    const { data: surveyors } = await supabase
      .from('surveyors')
      .select('id, name, employee_id, tracking_device_id')
      .order('name')

    return new Response(JSON.stringify({
      message: 'Available Device IDs in database',
      surveyors: surveyors?.map(s => ({
        name: s.name,
        employee_id: s.employee_id,
        tracking_device_id: s.tracking_device_id || 'NOT SET'
      })) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Health check endpoint
  if (req.method === 'GET' && !new URL(req.url).searchParams.has('debug')) {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'owntracks-webhook',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Only accept POST for data
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Log the FULL received payload for debugging
    console.log('=== WEBHOOK RECEIVED ===')
    console.log('Full body:', JSON.stringify(body))
    console.log('Is array:', Array.isArray(body))

    // OwnTracks can send single location or array of locations
    const updates = Array.isArray(body) ? body : [body]

    let processed = 0
    let errors = []

    // Get all Device IDs from database for debugging
    const { data: allSurveyors } = await supabase
      .from('surveyors')
      .select('id, tracking_device_id, name')
    console.log('All Device IDs in DB:', allSurveyors?.map(s => ({ id: s.tracking_device_id, name: s.name })))

    for (const update of updates) {
      console.log('--- Processing update ---')
      console.log('Full update:', JSON.stringify(update))

      // Log each update type and all fields
      console.log('_type:', update._type)
      console.log('tid:', update.tid)
      console.log('lat:', update.lat)
      console.log('lon:', update.lon)
      console.log('All keys:', Object.keys(update))

      if (update._type !== 'location') {
        console.log('SKIP: Non-location message type:', update._type)
        continue
      }

      const { lat, lon, tid, tst, acc, vel, alt, batt } = update

      if (!lat || !lon || !tid) {
        console.error('SKIP: Missing required fields:', {
          hasLat: !!lat,
          hasLon: !!lon,
          hasTid: !!tid
        })
        errors.push({ error: 'Missing required fields', update, tid })
        continue
      }

      // Find surveyor by tracking_device_id (case-insensitive)
      console.log('Searching for surveyor with tid:', tid, '(case-insensitive)')

      const { data: surveyor, error: surveyorError } = await supabase
        .from('surveyors')
        .select('id, user_id, name')
        .ilike('tracking_device_id', tid)
        .maybeSingle()

      console.log('Surveyor query result:', surveyor ? `FOUND: ${surveyor.name}` : 'NOT FOUND')
      console.log('Surveyor query error:', surveyorError)

      if (!surveyor) {
        console.error('FAIL: No surveyor found with tid:', tid)
        errors.push({
          error: 'Surveyor not found',
          tid,
          hint: 'Check if Device ID in app matches database exactly'
        })
        continue
      }

      console.log('SUCCESS: Found surveyor:', surveyor.name, surveyor.id)

      // Find active survey for this surveyor (in_progress status)
      const { data: activeSurvey } = await supabase
        .from('survey_requests')
        .select('id')
        .eq('assigned_surveyor_id', surveyor.id)
        .eq('status', 'in_progress')
        .maybeSingle()

      // Insert GPS log
      console.log('Inserting GPS log...')
      const { error: insertError } = await supabase.from('gps_logs').insert([{
        surveyor_id: surveyor.id,
        survey_request_id: activeSurvey?.id || null,
        latitude: lat,
        longitude: lon,
        accuracy: acc || null,
        speed: vel || null,
        altitude: alt || null,
        battery_level: batt || null,
        source: 'owntracks',
        timestamp: tst ? new Date(tst * 1000).toISOString() : new Date().toISOString()
      }])

      if (insertError) {
        console.error('FAIL: GPS log insert error:', insertError)
        errors.push({ error: 'Failed to insert GPS log', details: insertError.message, tid })
        continue
      }

      console.log('SUCCESS: GPS log inserted')

      // Update surveyor current_location
      await supabase
        .from('surveyors')
        .update({
          current_location: {
            latitude: lat,
            longitude: lon,
            accuracy: acc || null,
            updated_at: new Date().toISOString(),
            source: 'owntracks',
            battery_level: batt || null
          }
        })
        .eq('id', surveyor.id)

      console.log('SUCCESS: Surveyor location updated')
      processed++
    }

    const response = {
      success: true,
      processed,
      total: updates.length,
      errors: errors.length > 0 ? errors : undefined,
      message: processed > 0 ? 'GPS data saved!' : 'No location data processed'
    }

    console.log('=== WEBHOOK COMPLETE ===')
    console.log('Response:', JSON.stringify(response))

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('=== WEBHOOK ERROR ===')
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    return new Response(JSON.stringify({
      error: err.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
