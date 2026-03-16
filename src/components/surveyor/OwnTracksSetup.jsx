import { useState } from 'react'
import { Smartphone, Check, Copy, Wifi, Battery, AlertCircle } from 'lucide-react'

export default function OwnTracksSetup({ onClose }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evxjnkoxupqkmewtuusv.supabase.co'
  const webhookUrl = `${supabaseUrl}/functions/v1/owntracks-webhook`

  const [copied, setCopied] = useState(false)

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold">Background GPS Tracking</p>
            <p className="text-sm text-white/70">Works even when phone is locked!</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800 font-medium mb-2">Why use OwnTracks?</p>
        <p className="text-sm text-blue-700">
          Browser GPS stops when your screen turns off. OwnTracks keeps tracking
          in the background, so customers can see your location even when your
          phone is in your pocket.
        </p>
      </div>

      {/* Complete Setup Guide */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">📱 Complete Setup Guide</h3>

        {/* All Fields Table */}
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
                <td className="px-4 py-2 text-xs">Webhook URL (copy below)</td>
                <td className="px-4 py-2 text-xs text-gray-500">see below</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 font-medium">Device ID</td>
                <td className="px-4 py-2">Your 2-char code</td>
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

        {/* Step by Step */}
        <div className="space-y-3">
          <p className="font-medium text-gray-700">Step-by-Step:</p>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-medium">Download OwnTracks</p>
                <p className="text-sm text-gray-500">iOS App Store or Android Play Store</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-medium">Open Settings → Connection</p>
                <p className="text-sm text-gray-500">Set Mode: <strong>HTTP</strong></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-medium">Copy & Paste Webhook URL</p>
                <div className="flex items-center gap-2 my-2">
                  <input
                    className="flex-1 text-xs font-mono bg-gray-100 px-3 py-2 rounded-lg border"
                    value={webhookUrl}
                    readOnly
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="p-2 bg-qgo-blue text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div className="flex-1">
                <p className="font-medium">Get Your 2-Character Code from Admin</p>
                <p className="text-sm text-gray-500">Ask admin for your unique code (e.g., "a1", "x7", "b2")</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
              <div className="flex-1">
                <p className="font-medium">Enter Device ID & Tracker ID</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium text-green-800 mb-1">⚠️ IMPORTANT</p>
                  <p className="text-xs text-green-700">
                    Enter the <strong>SAME 2-character code</strong> in BOTH fields:<br />
                    • Device ID: <code className="bg-green-100 px-1 rounded">your-code</code><br />
                    • Tracker ID: <code className="bg-green-100 px-1 rounded">your-code</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</div>
              <div className="flex-1">
                <p className="font-medium">Username & Password</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-red-700">
                    <strong>Leave BOTH fields BLANK!</strong><br />
                    These are NOT needed for HTTP mode.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</div>
              <div className="flex-1">
                <p className="font-medium">Enable Permissions</p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Allow location: <strong>"Always"</strong></li>
                  <li>Turn ON "Publish location"</li>
                  <li>Disable battery optimization</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</div>
              <div className="flex-1">
                <p className="font-medium text-red-700">⚠️ CRITICAL: Set locatorPriority to NULL</p>
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 mt-2">
                  <p className="text-xs text-red-800 font-medium mb-2">This is REQUIRED for the app to work!</p>
                  <p className="text-xs text-red-700 mb-2">
                    Go to: <strong>Settings → Preferences</strong>
                  </p>
                  <p className="text-xs text-red-700 mb-2">
                    Find: <strong>"locatorPriority"</strong>
                  </p>
                  <p className="text-xs text-red-700">
                    Set it to: <code className="bg-red-100 px-1 rounded font-bold">NULL</code> (leave empty or delete any value)
                  </p>
                  <p className="text-xs text-red-600 mt-2 italic">
                    If this has any value (like "gps,passive"), the app will NOT send location data!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-qgo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">9</div>
              <div className="flex-1">
                <p className="font-medium">Start Tracking</p>
                <p className="text-sm text-gray-500">Go back to main screen. You should see "connected" status!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div className="mt-4 p-4 bg-gray-100 rounded-xl border border-gray-300">
          <p className="font-semibold text-gray-800 mb-2">🔧 Still Not Working?</p>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
            <li>Check <strong>Settings → Connection</strong> - URL must be exactly correct</li>
            <li>Verify <strong>locatorPriority = NULL</strong> in Settings → Preferences</li>
            <li>Make sure location is set to <strong>"Always Allow"</strong></li>
            <li>Try force-closing and reopening the app</li>
            <li>Check phone has active internet connection</li>
            <li>On Android: Disable battery optimization for OwnTracks</li>
          </ul>
        </div>

        {/* Example */}
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Example Setup</p>
              <p className="text-amber-700 mt-1">
                If admin gives you code <strong>"x7"</strong>:
              </p>
              <div className="mt-2 bg-white rounded p-2 font-mono text-xs">
                Device ID: <span className="text-qgo-blue font-bold">x7</span><br />
                Tracker ID: <span className="text-qgo-blue font-bold">x7</span><br />
                Username: <span className="text-gray-400">(blank)</span><br />
                Password: <span className="text-gray-400">(blank)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {onClose && (
        <button onClick={onClose} className="btn-secondary w-full">
          Got it, I'm Ready!
        </button>
      )}
    </div>
  )
}
