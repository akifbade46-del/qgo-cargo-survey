/**
 * Geospatial utility functions for GPS tracking
 * Uses Haversine formula for accurate distance calculations on Earth
 */

const EARTH_RADIUS_KM = 6371

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

/**
 * Calculate total distance from an array of GPS points
 * @param {Array} gpsLogs - Array of GPS log objects with latitude/longitude
 * @returns {number} Total distance in kilometers
 */
export function calculateTotalDistance(gpsLogs) {
  if (!gpsLogs || gpsLogs.length < 2) return 0

  let total = 0
  for (let i = 1; i < gpsLogs.length; i++) {
    const prev = gpsLogs[i - 1]
    const curr = gpsLogs[i]

    total += calculateDistance(
      parseFloat(prev.latitude),
      parseFloat(prev.longitude),
      parseFloat(curr.latitude),
      parseFloat(curr.longitude)
    )
  }

  return total
}

/**
 * Calculate average speed from GPS logs
 * @param {Array} gpsLogs - Array of GPS log objects with speed field
 * @returns {number} Average speed in km/h
 */
export function calculateAverageSpeed(gpsLogs) {
  if (!gpsLogs || gpsLogs.length === 0) return 0

  const speeds = gpsLogs
    .filter(log => log.speed != null && log.speed > 0)
    .map(log => parseFloat(log.speed))

  if (speeds.length === 0) return 0

  return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
}

/**
 * Calculate max speed from GPS logs
 * @param {Array} gpsLogs - Array of GPS log objects with speed field
 * @returns {number} Max speed in km/h
 */
export function calculateMaxSpeed(gpsLogs) {
  if (!gpsLogs || gpsLogs.length === 0) return 0

  const speeds = gpsLogs
    .filter(log => log.speed != null && log.speed > 0)
    .map(log => parseFloat(log.speed))

  if (speeds.length === 0) return 0

  return Math.max(...speeds)
}

/**
 * Calculate average battery level from GPS logs
 * @param {Array} gpsLogs - Array of GPS log objects with battery_level field
 * @returns {number} Average battery percentage, or null if no data
 */
export function calculateAverageBattery(gpsLogs) {
  if (!gpsLogs || gpsLogs.length === 0) return null

  const batteryLevels = gpsLogs
    .filter(log => log.battery_level != null)
    .map(log => log.battery_level)

  if (batteryLevels.length === 0) return null

  return batteryLevels.reduce((sum, level) => sum + level, 0) / batteryLevels.length
}

/**
 * Get map bounds to fit all GPS points
 * @param {Array} gpsLogs - Array of GPS log objects with latitude/longitude
 * @returns {Array|null} [[minLat, minLng], [maxLat, maxLng]] or null
 */
export function getMapBounds(gpsLogs) {
  if (!gpsLogs || gpsLogs.length === 0) return null

  const lats = gpsLogs.map(log => parseFloat(log.latitude))
  const lngs = gpsLogs.map(log => parseFloat(log.longitude))

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ]
}

/**
 * Calculate time duration between first and last GPS point
 * @param {Array} gpsLogs - Array of GPS log objects with timestamp
 * @returns {number} Duration in milliseconds
 */
export function calculateDuration(gpsLogs) {
  if (!gpsLogs || gpsLogs.length < 2) return 0

  // gpsLogs are ordered descending, so last is earliest
  const first = new Date(gpsLogs[0].timestamp).getTime()
  const last = new Date(gpsLogs[gpsLogs.length - 1].timestamp).getTime()

  return first - last
}

/**
 * Format duration in human-readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2h 30m" or "45m")
 */
export function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds <= 0) return '0m'

  const seconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Calculate speed between two GPS points (if timestamps differ)
 * @param {Object} point1 - First GPS point
 * @param {Object} point2 - Second GPS point
 * @returns {number} Speed in km/h, or null if cannot calculate
 */
export function calculateSpeedBetweenPoints(point1, point2) {
  if (!point1 || !point2 || !point1.timestamp || !point2.timestamp) return null

  const time1 = new Date(point1.timestamp).getTime()
  const time2 = new Date(point2.timestamp).getTime()
  const timeDiffHours = (time2 - time1) / (1000 * 60 * 60)

  if (timeDiffHours <= 0) return null

  const distance = calculateDistance(
    parseFloat(point1.latitude),
    parseFloat(point1.longitude),
    parseFloat(point2.latitude),
    parseFloat(point2.longitude)
  )

  return distance / timeDiffHours
}

/**
 * Get center point of GPS logs
 * @param {Array} gpsLogs - Array of GPS log objects
 * @returns {Object|null} {latitude, longitude} center or null
 */
export function getCenterPoint(gpsLogs) {
  if (!gpsLogs || gpsLogs.length === 0) return null

  const sumLat = gpsLogs.reduce((sum, log) => sum + parseFloat(log.latitude), 0)
  const sumLng = gpsLogs.reduce((sum, log) => sum + parseFloat(log.longitude), 0)

  return {
    latitude: sumLat / gpsLogs.length,
    longitude: sumLng / gpsLogs.length
  }
}
