import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Phone, Clock, ChevronRight, Crosshair } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'

// Custom marker icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const blueIcon = createIcon('blue')
const greenIcon = createIcon('green')
const orangeIcon = createIcon('orange')
const redIcon = createIcon('red')

// Component to handle map centering
function MapController({ center, userLocation }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 0.5 })
    }
  }, [center, map])

  return null
}

// Component to get user location
function LocationMarker({ onLocationFound }) {
  useMapEvents({
    locationfound(e) {
      onLocationFound(e.latlng)
    }
  })
  return null
}

export default function SurveyorMap() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [mapCenter, setMapCenter] = useState([29.3759, 47.9774]) // Kuwait default

  useEffect(() => {
    loadSurveys()
  }, [user])

  async function loadSurveys() {
    setLoading(true)
    try {
      // Get surveyor ID
      const { data: surveyor } = await supabase
        .from('surveyors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!surveyor) {
        setLoading(false)
        return
      }

      // Load surveys with location data
      const { data } = await supabase
        .from('survey_requests')
        .select(`
          id,
          reference_number,
          customer_name,
          customer_phone,
          from_address,
          from_city,
          from_country,
          from_lat,
          from_lng,
          preferred_date,
          status
        `)
        .eq('assigned_surveyor_id', surveyor.id)
        .in('status', ['assigned', 'in_progress'])
        .not('from_lat', 'is', null)
        .order('preferred_date', { ascending: true })

      setSurveys(data || [])

      // Center map on first survey if available
      if (data && data.length > 0 && data[0].from_lat && data[0].from_lng) {
        setMapCenter([parseFloat(data[0].from_lat), parseFloat(data[0].from_lng)])
      }
    } catch (err) {
      console.error('Failed to load surveys:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMarkerIcon = (status) => {
    switch (status) {
      case 'in_progress': return orangeIcon
      case 'surveyed': return greenIcon
      case 'cancelled': return redIcon
      default: return blueIcon
    }
  }

  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  const openPhone = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self')
    }
  }

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
    }
  }

  // Get today's surveys for the list
  const today = new Date()
  const todaySurveys = surveys.filter(s => {
    if (!s.preferred_date) return false
    const surveyDate = new Date(s.preferred_date)
    return surveyDate.toDateString() === today.toDateString()
  })

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps'
            maxZoom={20}
          />

          <MapController center={mapCenter} userLocation={userLocation} />
          <LocationMarker onLocationFound={setUserLocation} />

          {/* Survey Markers */}
          {surveys.map(survey => {
            if (!survey.from_lat || !survey.from_lng) return null
            const position = [parseFloat(survey.from_lat), parseFloat(survey.from_lng)]

            return (
              <Marker
                key={survey.id}
                position={position}
                icon={getMarkerIcon(survey.status)}
                eventHandlers={{
                  click: () => setSelectedSurvey(survey)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                      {survey.reference_number}
                    </p>
                    <p className="font-medium">{survey.customer_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{survey.from_address}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openInGoogleMaps(survey.from_lat, survey.from_lng)}
                        className="flex-1 bg-blue-500 text-white text-xs py-1 rounded flex items-center justify-center gap-1"
                      >
                        <Navigation size={12} /> Navigate
                      </button>
                      {survey.customer_phone && (
                        <button
                          onClick={() => openPhone(survey.customer_phone)}
                          className="flex-1 bg-green-500 text-white text-xs py-1 rounded flex items-center justify-center gap-1"
                        >
                          <Phone size={12} /> Call
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: '<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            />
          )}
        </MapContainer>

        {/* Map Controls */}
        <button
          onClick={centerOnUser}
          className="absolute top-4 right-4 z-10 p-3 rounded-xl shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <Crosshair size={20} style={{ color: 'var(--color-primary)' }} />
        </button>
      </div>

      {/* Survey List Panel */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="rounded-t-3xl shadow-lg overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Today's Surveys ({todaySurveys.length})
            </h3>
            <Link
              to="/surveyor/surveys"
              className="text-xs font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              View All
            </Link>
          </div>

          {todaySurveys.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {todaySurveys.map(survey => (
                <div
                  key={survey.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                  onClick={() => {
                    if (survey.from_lat && survey.from_lng) {
                      setMapCenter([parseFloat(survey.from_lat), parseFloat(survey.from_lng)])
                      setSelectedSurvey(survey)
                    }
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {survey.customer_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {survey.from_address}
                    </p>
                  </div>
                  <StatusBadge status={survey.status} />
                  <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No surveys scheduled for today</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
