import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import QgoLogo from '@/components/common/QgoLogo'
import { MapPin, Navigation, Battery, Clock } from 'lucide-react'

// Custom marker icon
const surveyorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

export default function LiveTracking() {
  const { token } = useParams()
  const [survey, setSurvey]   = useState(null)
  const [logs, setLogs]       = useState([])
  const [latest, setLatest]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Get survey by tracking token OR reference number (for easier customer access)
      const { data: s } = await supabase.from('survey_requests')
        .select('id,reference_number,customer_name,status,assigned_surveyor_id,tracking_token,surveyors(name,phone)')
        .or(`tracking_token.eq.${token},reference_number.eq.${token}`)
        .single()
      setSurvey(s)
      if (s?.assigned_surveyor_id) {
        const { data: gl } = await supabase.from('gps_logs')
          .select('latitude,longitude,accuracy,battery_level,timestamp')
          .eq('surveyor_id', s.assigned_surveyor_id)
          .order('timestamp', { ascending: false })
          .limit(50)
        if (gl) {
          setLogs(gl.reverse())
          setLatest(gl[0])
        }
      }
      setLoading(false)
    }
    load()

    // Realtime subscription
    const channel = supabase.channel('tracking')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gps_logs' },
        (payload) => {
          setLatest(payload.new)
          setLogs(p => [...p.slice(-49), payload.new])
        })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-qgo-bg">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading tracking...</p>
      </div>
    </div>
  )

  const center = latest
    ? [parseFloat(latest.latitude), parseFloat(latest.longitude)]
    : [29.3759, 47.9774] // Kuwait default

  const polyline = logs.map(l => [parseFloat(l.latitude), parseFloat(l.longitude)])

  return (
    <div className="min-h-screen flex flex-col bg-qgo-bg">
      {/* Header */}
      <div className="bg-qgo-navy px-6 py-4">
        <QgoLogo white size="sm" />
        {survey && (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{survey.reference_number}</p>
              <p className="text-white/60 text-sm">Surveyor: {survey.surveyors?.name || 'En Route'}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              survey.status === 'in_progress' ? 'bg-green-500 text-white animate-pulse' : 'bg-white/20 text-white'
            }`}>
              {survey.status === 'in_progress' ? '🟢 Live' : survey.status}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '60vh' }}>
        <MapContainer center={center} zoom={13} className="w-full h-full" style={{ minHeight: '60vh' }}>
          <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='© <a href="https://maps.google.com">Google Maps</a>'
            maxZoom={20} />
          {polyline.length > 1 && <Polyline positions={polyline} color="#0D5C9E" weight={3} opacity={0.6} />}
          {latest && (
            <Marker position={center} icon={surveyorIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{survey?.surveyors?.name || 'Surveyor'}</p>
                  <p className="text-gray-500">{new Date(latest.timestamp).toLocaleTimeString()}</p>
                  {latest.battery_level && <p>🔋 {latest.battery_level}%</p>}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Info Card */}
      <div className="bg-white p-6 shadow-lg">
        {latest ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-qgo-blue" />
              <div>
                <p className="text-xs text-gray-400">Coordinates</p>
                <p className="font-medium">{parseFloat(latest.latitude).toFixed(4)}, {parseFloat(latest.longitude).toFixed(4)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-qgo-blue" />
              <div>
                <p className="text-xs text-gray-400">Last Update</p>
                <p className="font-medium">{new Date(latest.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            {latest.battery_level && (
              <div className="flex items-center gap-2">
                <Battery size={16} className="text-qgo-blue" />
                <div>
                  <p className="text-xs text-gray-400">Battery</p>
                  <p className="font-medium">{latest.battery_level}%</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-qgo-blue" />
              <div>
                <p className="text-xs text-gray-400">Points Logged</p>
                <p className="font-medium">{logs.length}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <MapPin size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Waiting for surveyor location...</p>
            <p className="text-xs text-gray-300 mt-1">The surveyor hasn't started sharing their location yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
