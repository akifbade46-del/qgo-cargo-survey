import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Crosshair, Home, MapPin } from 'lucide-react'

// Home location icon - using reliable blue marker from CDN
const homeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
})

// Secondary pin icon (for reference)
const pinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to control map view
function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 16, { animate: true, duration: 1 })
    }
  }, [center, zoom, map])
  return null
}

// Map click handler component
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    }
  })
  return null
}

// Reverse geocoding function (using Nominatim - free OpenStreetMap service)
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'QGO-Cargo-Survey' // Required by Nominatim policy
        }
      }
    )
    if (response.ok) {
      const data = await response.json()
      return data.display_name || data.address?.road || null
    }
  } catch (err) {
    console.error('Reverse geocoding error:', err)
  }
  return null
}

export default function LocationPicker({
  value = null,
  onChange,
  label = "Select Location on Map",
  placeholder = "Click on map or use current location",
  mapId = "location-picker" // Unique ID for multiple maps
}) {
  const [position, setPosition] = useState(value ? [value.lat, value.lng] : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [address, setAddress] = useState(null)
  const [mapKey, setMapKey] = useState(0) // Force remount when needed
  const abortControllerRef = useRef(null)

  // Default center (Kuwait)
  const center = position || [29.3759, 47.9774]
  const zoom = position ? 16 : 13

  useEffect(() => {
    if (value) {
      const newPos = [value.lat, value.lng]
      setPosition(newPos)
      // Fetch address when value changes from outside
      fetchAddress(value.lat, value.lng)
    }
  }, [value])

  // Fetch address from coordinates
  const fetchAddress = async (lat, lng) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const addr = await reverseGeocode(lat, lng)
      if (addr) {
        setAddress(addr)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Address fetch error:', err)
      }
    }
  }

  const handleMapClick = async (latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng }
    setPosition([latlng.lat, latlng.lng])
    onChange(newPos)
    setError(null)
    setAddress(null) // Clear old address immediately
    await fetchAddress(latlng.lat, latlng.lng)
  }

  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)
    setAddress(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const newPos = { lat: latitude, lng: longitude }
        setPosition([latitude, longitude])
        onChange(newPos)
        setLoading(false)
        setError(null)

        // Fetch address for current location
        await fetchAddress(latitude, longitude)

        // Force map update to zoom to new location
        setMapKey(prev => prev + 1)
      },
      (err) => {
        let errorMsg = 'Unable to get your location.'
        if (err.code === 1) {
          errorMsg = 'Location permission denied. Please enable location access.'
        } else if (err.code === 2) {
          errorMsg = 'Location unavailable. Please check your device settings.'
        } else if (err.code === 3) {
          errorMsg = 'Location request timed out. Please try again.'
        }
        setError(errorMsg)
        setLoading(false)
        console.error('Geolocation error:', err)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const openInGoogleMaps = () => {
    if (position) {
      const url = `https://www.google.com/maps?q=${position[0]},${position[1]}`
      window.open(url, '_blank')
    }
  }

  // Format address for display
  const formatDisplayAddress = (addr) => {
    if (!addr) return null
    // Split and get meaningful parts
    const parts = addr.split(',').map(p => p.trim()).filter(p => p)
    if (parts.length > 3) {
      return parts.slice(0, 3).join(',') + '...'
    }
    return addr
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label flex items-center gap-2">
          <Home size={16} className="text-qgo-blue" />
          {label}
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-qgo-blue text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          <Crosshair size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Detecting...' : '📍 Use My Location'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 hover:border-qgo-blue transition-all shadow-sm hover:shadow-md">
        <MapContainer
          key={`${mapKey}-${mapId}`}
          center={center}
          zoom={zoom}
          style={{ height: '280px', width: '100%' }}
          className="z-0"
        >
          {/* Map controller for auto-zoom */}
          <MapController center={position} zoom={16} />

          {/* Google Maps Tiles */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='© <a href="https://maps.google.com">Google Maps</a>'
            maxZoom={20}
          />

          {/* Click handler */}
          <MapClickHandler onClick={handleMapClick} />

          {/* Home Marker */}
          {position && (
            <Marker position={position} icon={homeIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="flex items-center gap-2 font-semibold text-qgo-blue mb-1">
                    <Home size={14} />
                    Survey Location
                  </div>
                  {address ? (
                    <p className="text-gray-600 text-xs max-w-[200px]">{formatDisplayAddress(address)}</p>
                  ) : (
                    <p className="text-gray-400 text-xs">Loading address...</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Instructions overlay */}
        {!position && (
          <div className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2.5 text-xs text-gray-700 text-center shadow-lg border border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <MapPin size={14} className="text-qgo-blue" />
              <span>Click on map or use "My Location" button</span>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-qgo-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-600 font-medium">Getting your location...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-xs text-red-600 flex items-center gap-2">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Selected Location Info */}
      {position && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Home size={12} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-green-700">Location Pinned</span>
              </div>

              {/* Address display */}
              {address ? (
                <div className="mb-2">
                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                    <MapPin size={11} className="text-green-600" />
                    Detected Address:
                  </p>
                  <p className="text-xs text-gray-700 font-medium bg-white rounded px-2 py-1.5 border border-green-100">
                    {formatDisplayAddress(address)}
                  </p>
                </div>
              ) : (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 italic">Fetching address...</p>
                </div>
              )}

              {/* Coordinates */}
              <p className="text-xs text-gray-500 font-mono">
                📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            </div>

            <button
              type="button"
              onClick={openInGoogleMaps}
              className="flex flex-col items-center gap-1 px-3 py-2 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group"
            >
              <Navigation size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-green-700">View</span>
            </button>
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <MapPin size={12} />
        {placeholder}
      </p>
    </div>
  )
}
