import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useGPSTracking(surveyorId, surveyRequestId, enabled = false) {
  const [location, setLocation]   = useState(null)
  const [error, setError]         = useState(null)
  const [tracking, setTracking]   = useState(false)
  const watchIdRef                = useRef(null)
  const intervalRef               = useRef(null)

  function startTracking() {
    if (!navigator.geolocation) { setError('GPS not supported'); return }
    setTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords
        setLocation({ latitude, longitude, accuracy })

        // Push to Supabase
        await supabase.from('gps_logs').insert([{
          surveyor_id: surveyorId,
          survey_request_id: surveyRequestId,
          latitude,
          longitude,
          accuracy,
          speed: speed || null,
          source: 'browser',
          timestamp: new Date().toISOString()
        }])

        // Also update surveyor's current_location
        await supabase.from('surveyors')
          .update({ current_location: { latitude, longitude, updated_at: new Date().toISOString() } })
          .eq('id', surveyorId)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTracking(false)
  }

  useEffect(() => {
    if (enabled) startTracking()
    return () => stopTracking()
  }, [enabled])

  return { location, error, tracking, startTracking, stopTracking }
}
