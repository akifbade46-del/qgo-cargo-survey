import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Smartphone, Check, Copy, AlertCircle, RefreshCw, MapPin, Wifi, Clock, Satellite } from 'lucide-react'

export default function AdminOwnTracks() {
  const [surveyors, setSurveyors] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [deviceId, setDeviceId] = useState('')
  const [saving, setSaving] = useState(false)
  const [gpsLogs, setGpsLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Get the Supabase project URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evxjnkoxupqkmewtuusv.supabase.co'
  const webhookUrl = `${supabaseUrl}/functions/v1/owntracks-webhook`

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('surveyors')
      .select('id, name, employee_id, tracking_device_id, current_location')
      .order('name')
    setSurveyors(data ?? [])
    setLoading(false)
  }

  async function loadGpsLogs() {
    setLoadingLogs(true)
    const { data } = await supabase
      .from('gps_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20)
    setGpsLogs(data ?? [])
    setLoadingLogs(false)
    setShowLogs(true)
  }

  async function load() {
    const { data } = await supabase
      .from('surveyors')
      .select('id, name, employee_id, tracking_device_id, current_location')
      .order('name')
    setSurveyors(data ?? [])
    setLoading(false)
  }

  async function saveDeviceId(surveyorId) {
    if (!deviceId.trim()) {
      toast.error('Device ID is required')
      return
    }
    if (deviceId.trim().length !== 2) {
      toast.error('Device ID must be exactly 2 characters!')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('surveyors')
      .update({ tracking_device_id: deviceId.trim() })
      .eq('id', surveyorId)

    if (error) toast.error(error.message)
    else {
      toast.success('Device ID saved!')
      setSurveyors(p => p.map(s => s.id === surveyorId ? { ...s, tracking_device_id: deviceId.trim() } : s))
      setEditingId(null)
      setDeviceId('')
    }
    setSaving(false)
  }

  function startEdit(surveyor) {
    setEditingId(surveyor.id)
    setDeviceId(surveyor.tracking_device_id || generateDeviceId())
  }

  function generateDeviceId() {
    // Generate short 2-character code for OwnTracks Tracker ID
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 2; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-qgo-text">OwnTracks Setup</h1>
        <p className="text-gray-500 mt-1">Configure background GPS tracking for surveyors</p>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-qgo-navy to-blue-900 rounded-2xl p-6 text-white">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5" /> How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-qgo-cyan font-bold mb-1">1. Install App</div>
            <p className="text-white/70">Surveyor downloads OwnTracks app (iOS/Android)</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-qgo-cyan font-bold mb-1">2. Configure</div>
            <p className="text-white/70">Set webhook URL and Device ID below</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-qgo-cyan font-bold mb-1">3. Track 24/7</div>
            <p className="text-white/70">GPS works even with phone locked!</p>
          </div>
        </div>
      </div>

      {/* Webhook URL */}
      <div className="card">
        <label className="text-sm font-medium text-gray-700 block mb-2">Webhook URL</label>
        <div className="flex gap-2">
          <input
            className="input flex-1 font-mono text-sm bg-gray-50"
            value={webhookUrl}
            readOnly
          />
          <button
            onClick={() => copyToClipboard(webhookUrl)}
            className="btn-secondary flex items-center gap-2"
          >
            <Copy size={16} /> Copy
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Copy this URL into OwnTracks app → Settings → Connection → URL</p>
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800 font-medium">⚠️ Important: Device ID must be exactly 2 characters (e.g., a1, b2, x9)</p>
        </div>

        {/* Test Webhook Section */}
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-800">🔍 Not receiving data?</p>
              <p className="text-xs text-blue-600 mt-1">Test the webhook connection</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={async () => {
                  const tid = surveyors.find(s => s.tracking_device_id)?.tracking_device_id || 'A1'
                  const testPayload = [{
                    _type: 'location',
                    lat: 29.3759,
                    lon: 47.9774,
                    tid: tid,
                    tst: Math.floor(Date.now() / 1000),
                    acc: 10,
                    batt: 85
                  }]
                  try {
                    const res = await fetch(webhookUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(testPayload)
                    })
                    const result = await res.json()
                    toast.success(`Webhook test: ${result.success ? '✅ Working!' : '❌ Failed'}`)
                    if (result.errors?.length > 0) {
                      console.error('Webhook errors:', result.errors)
                      toast.error(`Errors: ${result.errors.map(e => e.error).join(', ')}`)
                    }
                    setTimeout(loadGpsLogs, 1000)
                  } catch (err) {
                    toast.error('Webhook connection failed!')
                    console.error(err)
                  }
                }}
                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Webhook
              </button>
              <button
                onClick={loadGpsLogs}
                className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Logs
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${webhookUrl}?debug=device-ids`)
                    const result = await res.json()
                    const deviceIds = result.surveyors?.map(s => `${s.name}: ${s.tracking_device_id}`).join('\n') || 'None'
                    alert(`Device IDs in Database:\n\n${deviceIds}\n\nMake sure OwnTracks app Device ID matches exactly!`)
                  } catch (err) {
                    toast.error('Failed to fetch Device IDs')
                  }
                }}
                className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Check Device IDs
              </button>
            </div>
          </div>
          <p className="text-xs text-blue-600">
            <strong>Test Webhook:</strong> Sends a test GPS point to verify connection<br />
            <strong>View Logs:</strong> Shows recent GPS data received
          </p>
        </div>
      </div>

      {/* Surveyor Configuration */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Surveyor Device IDs</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={loadGpsLogs}
              className="text-xs flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Satellite size={14} /> {showLogs ? 'Hide Logs' : 'View Logs'}
            </button>
            <button onClick={load} className="text-gray-400 hover:text-gray-600">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* GPS Logs Debug Section */}
        {showLogs && (
          <div className="mb-4 p-4 bg-gray-900 rounded-xl text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Satellite size={14} className="text-green-400" />
                Recent GPS Logs (Last 20)
              </h3>
              <button
                onClick={loadGpsLogs}
                disabled={loadingLogs}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
              >
                {loadingLogs ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            {gpsLogs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No GPS logs received yet</p>
                <p className="text-gray-500 text-xs mt-1">Waiting for OwnTracks app to send data...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gpsLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs bg-gray-800 p-2 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-qgo-cyan">{log.surveyor_id?.substring(0, 8)}...</span>
                        <span className={`px-1.5 py-0.5 rounded ${log.source === 'owntracks' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                          {log.source}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-0.5">
                        {log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}
                      </div>
                    </div>
                    <div className="text-right text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      {log.battery_level && (
                        <div className="text-gray-500">🔋 {log.battery_level}%</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                💡 If no logs appear, check: <br />
                1. OwnTracks app settings (Device ID must match exactly) <br />
                2. "Publish location" is turned ON <br />
                3. Location permission is set to "Always"<br />
                4. <strong className="text-red-400">locatorPriority = NULL</strong> in Preferences!
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-3">
            {surveyors.map(s => {
              const isActive = s.current_location?.source === 'owntracks' &&
                Date.now() - new Date(s.current_location?.updated_at).getTime() < 120000

              return (
                <div key={s.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-qgo-blue/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-qgo-blue" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-qgo-text">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.employee_id || 'No employee ID'}</p>
                  </div>

                  {editingId === s.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="input text-sm w-48"
                        value={deviceId}
                        onChange={e => setDeviceId(e.target.value)}
                        placeholder="2-char code (e.g., a1)"
                      />
                      <button
                        onClick={() => saveDeviceId(s.id)}
                        disabled={saving}
                        className="btn-primary text-sm px-3 py-2"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setDeviceId('') }}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {s.tracking_device_id ? (
                        <>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <p className={`text-lg font-bold font-mono tracking-widest ${
                                s.tracking_device_id.length === 2 ? 'text-qgo-blue' : 'text-red-500'
                              }`}>
                                {s.tracking_device_id.toUpperCase()}
                              </p>
                              {s.tracking_device_id.length !== 2 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                  Invalid
                                </span>
                              )}
                            </div>
                            {s.tracking_device_id.length !== 2 && (
                              <p className="text-xs text-red-500">Must be 2 characters</p>
                            )}
                            {isActive ? (
                              <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Active
                              </p>
                            ) : s.current_location?.source === 'owntracks' ? (
                              <p className="text-xs text-gray-400">Last: {new Date(s.current_location?.updated_at).toLocaleTimeString()}</p>
                            ) : (
                              <p className="text-xs text-gray-400">Not connected</p>
                            )}
                          </div>
                          <button
                            onClick={() => startEdit(s)}
                            className="text-qgo-blue hover:underline text-sm"
                          >
                            Edit
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(s)}
                          className="btn-secondary text-sm"
                        >
                          Set Device ID
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* App Setup Instructions */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">📱 Complete Setup Guide for Surveyors</h2>

        {/* All Fields Reference Table */}
        <div className="bg-gray-50 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-qgo-navy text-white">
              <tr>
                <th className="px-4 py-2 text-left">Field</th>
                <th className="px-4 py-2 text-left">What to Enter</th>
                <th className="px-4 py-2 text-left">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-4 py-2 font-medium">Mode</td>
                <td className="px-4 py-2">HTTP</td>
                <td className="px-4 py-2 font-mono text-xs">HTTP</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 font-medium">URL</td>
                <td className="px-4 py-2 text-xs">Webhook URL (above)</td>
                <td className="px-4 py-2 text-xs text-gray-500">copy from above</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 font-medium">Device ID</td>
                <td className="px-4 py-2">Admin-assigned code</td>
                <td className="px-4 py-2 font-mono text-xs text-qgo-blue font-bold">a1</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 font-medium">Tracker ID</td>
                <td className="px-4 py-2 text-green-700">SAME as Device ID!</td>
                <td className="px-4 py-2 font-mono text-xs text-qgo-blue font-bold">a1</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 font-medium">Username</td>
                <td className="px-4 py-2 text-red-600">Leave BLANK</td>
                <td className="px-4 py-2 text-gray-400">—</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 font-medium">Password</td>
                <td className="px-4 py-2 text-red-600">Leave BLANK</td>
                <td className="px-4 py-2 text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Platform Instructions */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">iOS</div>
            <div className="flex-1">
              <p className="font-medium">iPhone/iPad Setup</p>
              <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                <li>Download <strong>OwnTracks</strong> from App Store</li>
                <li>Open app → Settings (gear icon ⚙️)</li>
                <li>Connection → Mode: <strong>HTTP</strong></li>
                <li>URL: Paste the webhook URL from above</li>
                <li>Device ID: Enter the 2-char code you assigned</li>
                <li>Tracker ID: Enter the <strong>SAME</strong> 2-char code</li>
                <li>Username & Password: <strong>Leave BLANK</strong></li>
                <li>Turn ON "Publish location"</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">Android</div>
            <div className="flex-1">
              <p className="font-medium">Android Setup</p>
              <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                <li>Download <strong>OwnTracks</strong> from Play Store</li>
                <li>Open app → Preferences (≡ menu)</li>
                <li>Mode: <strong>HTTP</strong></li>
                <li>URL: Paste the webhook URL from above</li>
                <li>Device ID: Enter the 2-char code you assigned</li>
                <li>Tracker ID: Enter the <strong>SAME</strong> 2-char code</li>
                <li>Username & Password: <strong>Leave BLANK</strong></li>
                <li>Enable "Publish location"</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Example Box */}
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="font-medium text-green-800 mb-2">✅ Example: If you assigned code "x7"</p>
          <div className="bg-white rounded p-3 font-mono text-sm">
            Mode: HTTP<br />
            URL: (webhook URL from above)<br />
            Device ID: <span className="text-qgo-blue font-bold">x7</span><br />
            Tracker ID: <span className="text-qgo-blue font-bold">x7</span><br />
            Username: <span className="text-gray-400">(blank)</span><br />
            Password: <span className="text-gray-400">(blank)</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">⚠️ Important Reminders</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li><strong>Device ID = Tracker ID</strong> (must be SAME value)</li>
                <li>Device ID must be <strong>exactly 2 characters</strong></li>
                <li>Allow location permissions <strong>"Always"</strong> for background tracking</li>
                <li>Disable battery optimization for OwnTracks app</li>
                <li>Each surveyor must have a <strong>unique</strong> Device ID</li>
                <li>Username and Password are <strong>NOT required</strong> for HTTP mode</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CRITICAL: locatorPriority Setting */}
        <div className="mt-4 p-4 bg-red-50 rounded-xl border-2 border-red-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-red-800 text-base">🚨 CRITICAL: locatorPriority MUST be NULL</p>
              <p className="text-red-700 mt-2">
                If the OwnTracks app isn't sending location data, check this setting:
              </p>
              <div className="mt-2 bg-white rounded-lg p-3 border border-red-200">
                <p className="font-mono text-xs text-red-800 font-medium mb-1">Settings → Preferences → locatorPriority</p>
                <p className="text-red-700 text-sm">
                  Set this to <strong className="underline">NULL</strong> (empty value or delete any existing value)
                </p>
              </div>
              <p className="text-red-600 text-xs mt-2 italic">
                If locatorPriority has any value like "gps,passive" or "significant", the app will NOT report location!
              </p>
              <p className="text-red-700 text-sm mt-2">
                <strong>How to fix:</strong><br />
                • Go to: <span className="font-mono bg-red-100 px-1 rounded">Settings → Preferences</span><br />
                • Find: <span className="font-mono bg-red-100 px-1 rounded">locatorPriority</span><br />
                • <strong>Delete the value completely</strong> or set to empty<br />
                • Save and restart the app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
