import { useState, useEffect } from 'react'
import { useGPSTracking } from '@/hooks/useGPS'
import { supabase } from '@/lib/supabase'
import { Navigation, NavigationOff, Signal, Smartphone, Battery, HelpCircle } from 'lucide-react'
import OwnTracksSetup from './OwnTracksSetup'

export default function GPSTracker({ surveyorId, surveyRequestId }) {
  const [enabled, setEnabled] = useState(false)
  const { location, error, tracking } = useGPSTracking(surveyorId, surveyRequestId, enabled)

  // OwnTracks status
  const [ownTracksActive, setOwnTracksActive] = useState(false)
  const [lastOwnTracksUpdate, setLastOwnTracksUpdate] = useState(null)
  const [showOwnTracksHelp, setShowOwnTracksHelp] = useState(false)

  // Check if OwnTracks is active (received update within last 2 minutes)
  useEffect(() => {
    if (!surveyorId) return

    async function checkOwnTracks() {
      const { data } = await supabase
        .from('gps_logs')
        .select('source, timestamp, accuracy, speed')
        .eq('surveyor_id', surveyorId)
        .eq('source', 'owntracks')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        const timeDiff = Date.now() - new Date(data.timestamp).getTime()
        const isActive = timeDiff < 120000 // 2 minutes
        setOwnTracksActive(isActive)
        setLastOwnTracksUpdate(data.timestamp)
      }
    }

    checkOwnTracks()
    const interval = setInterval(checkOwnTracks, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [surveyorId])

  // If OwnTracks is active, show that status instead of browser GPS controls
  if (ownTracksActive && !enabled) {
    return (
      <div className="rounded-xl p-4 border-2 bg-green-50 border-green-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                OwnTracks Active
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </p>
              <p className="text-xs text-green-600">
                Background GPS tracking enabled
              </p>
              {lastOwnTracksUpdate && (
                <p className="text-xs text-gray-400">
                  Last update: {new Date(lastOwnTracksUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowOwnTracksHelp(true)}
            className="text-green-600 hover:text-green-700"
          >
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Option to start browser GPS as backup */}
        <div className="mt-3 pt-3 border-t border-green-200">
          <button
            onClick={() => setEnabled(true)}
            className="text-xs text-green-700 hover:text-green-800 underline"
          >
            Start browser GPS as backup
          </button>
        </div>

        {showOwnTracksHelp && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <OwnTracksSetup onClose={() => setShowOwnTracksHelp(false)} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-4 border-2 transition-colors ${
      tracking ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tracking
            ? <Signal className="w-5 h-5 text-green-600 animate-pulse" />
            : <NavigationOff className="w-5 h-5 text-gray-400" />
          }
          <div>
            <p className={`text-sm font-bold ${tracking ? 'text-green-700' : 'text-gray-500'}`}>
              {tracking ? 'Browser GPS Active' : 'GPS Tracking Off'}
            </p>
            {location && (
              <p className="text-xs text-gray-400">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            {!tracking && !error && (
              <p className="text-xs text-gray-400">Screen must stay on</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOwnTracksHelp(true)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Setup background tracking"
          >
            <Smartphone size={18} />
          </button>
          <button
            onClick={() => setEnabled(v => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tracking
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-qgo-blue text-white hover:bg-qgo-navy'
            }`}>
            {tracking ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {showOwnTracksHelp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <OwnTracksSetup onClose={() => setShowOwnTracksHelp(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
