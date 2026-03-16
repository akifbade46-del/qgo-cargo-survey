import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Clock, Gauge, Battery, Route, Filter, Loader2, ClipboardList } from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'
import {
  calculateDistance,
  calculateTotalDistance,
  calculateAverageSpeed,
  calculateMaxSpeed,
  calculateAverageBattery,
  getMapBounds,
  calculateDuration,
  formatDuration,
  getCenterPoint
} from '@/utils/geoUtils'

// Component to auto-fit map bounds
function MapBounds({ gpsLogs, center }) {
  const map = useMap()

  useEffect(() => {
    if (gpsLogs.length > 0) {
      const bounds = getMapBounds(gpsLogs)
      if (bounds) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    } else if (center) {
      map.setView([center.latitude, center.longitude], 13)
    }
  }, [gpsLogs, map, center])

  return null
}

// Custom surveyor marker icon
const createSurveyorIcon = (color = '#0D5C9E') => {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M12 22V12"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

const startIcon = createSurveyorIcon('#10B981') // Green
const endIcon = createSurveyorIcon('#EF4444') // Red

export default function AdminTrackSurveyor() {
  // State
  const [surveyors, setSurveyors] = useState([])
  const [selectedSurveyor, setSelectedSurveyor] = useState(null)
  const [selectedSurveyorData, setSelectedSurveyorData] = useState(null)
  const [gpsLogs, setGpsLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingGps, setLoadingGps] = useState(false)
  const [dateRange, setDateRange] = useState('today')
  const [customStart, setCustomStart] = useState(null)
  const [customEnd, setCustomEnd] = useState(null)
  const [sourceFilter, setSourceFilter] = useState('all')
  const [showTimeline, setShowTimeline] = useState(true)
  const [surveysCompleted, setSurveysCompleted] = useState(0)

  // Load surveyors on mount
  useEffect(() => {
    loadSurveyors()
  }, [])

  // Load GPS logs when filters change
  useEffect(() => {
    if (selectedSurveyor) {
      loadGPSLogs()
    }
  }, [selectedSurveyor, dateRange, customStart, customEnd, sourceFilter])

  async function loadSurveyors() {
    setLoading(true)
    const { data, error } = await supabase
      .from('surveyors')
      .select('id, name, employee_id, tracking_device_id')
      .order('name')

    if (error) {
      toast.error('Failed to load surveyors')
    } else {
      setSurveyors(data || [])
    }
    setLoading(false)
  }

  async function loadGPSLogs() {
    if (!selectedSurveyor) return

    setLoadingGps(true)

    // Calculate date range
    let startDate, endDate
    const now = new Date()

    switch (dateRange) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case 'yesterday':
        const yesterday = subDays(now, 1)
        startDate = startOfDay(yesterday)
        endDate = endOfDay(yesterday)
        break
      case 'week':
        startDate = startOfDay(subDays(now, 7))
        endDate = endOfDay(now)
        break
      case 'month':
        startDate = startOfDay(subDays(now, 30))
        endDate = endOfDay(now)
        break
      case 'custom':
        startDate = customStart ? startOfDay(new Date(customStart)) : startOfDay(subDays(now, 7))
        endDate = customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now)
        break
      default:
        startDate = startOfDay(now)
        endDate = endOfDay(now)
    }

    // Build query
    let query = supabase
      .from('gps_logs')
      .select('*')
      .eq('surveyor_id', selectedSurveyor)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })

    // Apply source filter if not 'all'
    if (sourceFilter !== 'all') {
      query = query.eq('source', sourceFilter)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Failed to load GPS data')
      console.error(error)
      setGpsLogs([])
    } else {
      setGpsLogs(data || [])
    }

    // Fetch completed surveys count for the same period
    const { data: surveyData } = await supabase
      .from('survey_requests')
      .select('id')
      .eq('assigned_surveyor_id', selectedSurveyor)
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString())

    setSurveysCompleted(surveyData?.length || 0)

    setLoadingGps(false)
  }

  // Statistics calculations
  const stats = {
    totalDistance: calculateTotalDistance(gpsLogs),
    avgSpeed: calculateAverageSpeed(gpsLogs),
    maxSpeed: calculateMaxSpeed(gpsLogs),
    avgBattery: calculateAverageBattery(gpsLogs),
    pointCount: gpsLogs.length,
    duration: calculateDuration(gpsLogs),
    centerPoint: getCenterPoint(gpsLogs)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-qgo-text">Track Surveyor</h1>
        <p className="text-gray-500 mt-1">View location history, movement statistics, and GPS timeline</p>
      </div>

      {/* Filters Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Surveyor Selection */}
          <div>
            <label className="label">Select Surveyor</label>
            <select
              className="input"
              value={selectedSurveyor || ''}
              onChange={(e) => {
                setSelectedSurveyor(e.target.value)
                setSelectedSurveyorData(surveyors.find(s => s.id === e.target.value) || null)
              }}
            >
              <option value="">Choose surveyor...</option>
              {surveyors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.employee_id}){s.tracking_device_id ? ` - ${s.tracking_device_id}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="label">Date Range</label>
            <select
              className="input"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                if (e.target.value !== 'custom') {
                  setCustomStart(null)
                  setCustomEnd(null)
                }
              }}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="label">GPS Source</label>
            <select className="input" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="all">All Sources</option>
              <option value="owntracks">OwnTracks (Mobile)</option>
              <option value="browser">Browser GPS</option>
            </select>
          </div>

          {/* Toggle Timeline */}
          <div className="flex items-end">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showTimeline
                  ? 'bg-qgo-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showTimeline ? 'Timeline Visible' : 'Show Timeline'}
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">From Date</label>
              <input
                type="date"
                className="input"
                value={customStart || ''}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div>
              <label className="label">To Date</label>
              <input
                type="date"
                className="input"
                value={customEnd || ''}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {selectedSurveyor && !loadingGps && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Route size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Distance</p>
                <p className="text-lg font-bold text-qgo-text truncate">{stats.totalDistance.toFixed(2)} km</p>
              </div>
            </div>
          </div>

          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gauge size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Speed</p>
                <p className="text-lg font-bold text-qgo-text">{stats.avgSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </div>

          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">GPS Points</p>
                <p className="text-lg font-bold text-qgo-text">{stats.pointCount}</p>
              </div>
            </div>
          </div>

          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                <p className="text-lg font-bold text-qgo-text">{formatDuration(stats.duration)}</p>
              </div>
            </div>
          </div>

          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Battery size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Battery</p>
                <p className="text-lg font-bold text-qgo-text">
                  {stats.avgBattery !== null ? `${Math.round(stats.avgBattery)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="card !p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Surveys Done</p>
                <p className="text-lg font-bold text-qgo-text">{surveysCompleted}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map and Timeline */}
      {selectedSurveyor && loadingGps ? (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-qgo-blue animate-spin" />
          <span className="ml-3 text-gray-500">Loading GPS data...</span>
        </div>
      ) : selectedSurveyor && gpsLogs.length > 0 ? (
        <div className={`grid gap-6 ${showTimeline ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Map */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-qgo-text">
                {selectedSurveyorData?.name}'s Location Map
              </h2>
              <span className="text-xs text-gray-400">
                {gpsLogs.length} GPS points
              </span>
            </div>

            <div className="h-[450px] rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                style={{ height: '100%', width: '100%' }}
                center={[stats.centerPoint.latitude, stats.centerPoint.longitude]}
                zoom={13}
              >
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                  attribution='&copy; Google Maps'
                />
                <MapBounds gpsLogs={gpsLogs} center={stats.centerPoint} />

                {/* Polyline path */}
                {gpsLogs.length > 1 && (
                  <Polyline
                    positions={gpsLogs.slice().reverse().map(log => [
                      parseFloat(log.latitude),
                      parseFloat(log.longitude)
                    ])}
                    color="#0D5C9E"
                    weight={4}
                    opacity={0.7}
                    dashArray="5 5"
                  />
                )}

                {/* Start marker (last point = earliest) */}
                <Marker
                  position={[
                    parseFloat(gpsLogs[gpsLogs.length - 1].latitude),
                    parseFloat(gpsLogs[gpsLogs.length - 1].longitude)
                  ]}
                  icon={startIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>Start</strong><br />
                      {format(new Date(gpsLogs[gpsLogs.length - 1].timestamp), 'HH:mm:ss')}
                    </div>
                  </Popup>
                </Marker>

                {/* End marker (first point = latest) */}
                <Marker
                  position={[
                    parseFloat(gpsLogs[0].latitude),
                    parseFloat(gpsLogs[0].longitude)
                  ]}
                  icon={endIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>End</strong><br />
                      {format(new Date(gpsLogs[0].timestamp), 'HH:mm:ss')}
                      {gpsLogs[0].battery_level && (
                        <><br />Battery: {gpsLogs[0].battery_level}%</>
                      )}
                    </div>
                  </Popup>
                </Marker>

                {/* Show some intermediate markers if many points */}
                {gpsLogs.length > 10 && (
                  <>
                    <Marker
                      position={[
                        parseFloat(gpsLogs[Math.floor(gpsLogs.length / 2)].latitude),
                        parseFloat(gpsLogs[Math.floor(gpsLogs.length / 2)].longitude)
                      ]}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong>Midpoint</strong><br />
                          {format(new Date(gpsLogs[Math.floor(gpsLogs.length / 2)].timestamp), 'HH:mm:ss')}
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}
              </MapContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>End</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-900" style={{ borderStyle: 'dashed' }}></div>
                <span>Path</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {showTimeline && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-qgo-text">Timeline</h2>
                <button
                  onClick={() => {
                    // Export timeline data as JSON
                    const data = gpsLogs.map(log => ({
                      time: format(new Date(log.timestamp), 'HH:mm:ss'),
                      date: format(new Date(log.timestamp), 'MMM d, yyyy'),
                      lat: parseFloat(log.latitude).toFixed(6),
                      lon: parseFloat(log.longitude).toFixed(6),
                      accuracy: log.accuracy,
                      speed: log.speed,
                      altitude: log.altitude,
                      battery: log.battery_level,
                      source: log.source
                    }))
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `gps-timeline-${selectedSurveyorData?.name}-${Date.now()}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success('Timeline exported!')
                  }}
                  className="text-xs text-qgo-blue hover:underline"
                >
                  Export JSON
                </button>
              </div>

              <div className="h-[450px] overflow-y-auto pr-2 space-y-2">
                {gpsLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 mt-1.5 bg-qgo-blue rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-medium text-qgo-text text-sm">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(log.timestamp), 'MMM d, yyyy')}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            log.source === 'owntracks'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {log.source}
                        </span>
                      </div>

                      <div className="text-gray-500 text-xs mt-1 font-mono">
                        📍 {parseFloat(log.latitude).toFixed(6)}, {parseFloat(log.longitude).toFixed(6)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                        {log.accuracy != null && (
                          <span className="flex items-center gap-1">
                            Accuracy: {Math.round(log.accuracy)}m
                          </span>
                        )}
                        {log.speed != null && (
                          <span className="flex items-center gap-1">
                            <Gauge size={10} /> {log.speed.toFixed(1)} km/h
                          </span>
                        )}
                        {log.altitude != null && (
                          <span>Alt: {Math.round(log.altitude)}m</span>
                        )}
                        {log.battery_level != null && (
                          <span className="flex items-center gap-1">
                            <Battery size={10} /> {log.battery_level}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedSurveyor && !loadingGps ? (
        <div className="card text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No GPS data found</p>
          <p className="text-gray-400 text-sm">
            Try adjusting the date range or filters
          </p>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a surveyor above to view their tracking history</p>
          {loading && (
            <p className="text-gray-400 text-sm mt-2">Loading surveyors...</p>
          )}
        </div>
      )}
    </div>
  )
}
