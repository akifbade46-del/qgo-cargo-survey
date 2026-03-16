import { useState } from 'react'
import { Palette, Type, Image, Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import SettingInput from '../SettingInput'

export default function BrandingTab({ settings, updateSetting, onSave }) {
  const [uploading, setUploading] = useState(false)

  const colors = [
    { key: 'color_primary', label: 'Primary Color', default: '#0D5C9E' },
    { key: 'color_secondary', label: 'Secondary Color (Cyan)', default: '#90CCE0' },
    { key: 'color_navy', label: 'Navy Background', default: '#060E1E' },
  ]

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 500KB for base64)
    if (file.size > 500 * 1024) {
      toast.error('Image must be less than 500KB')
      return
    }

    setUploading(true)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Url = event.target?.result
      if (base64Url) {
        updateSetting('logo_url', base64Url)
        toast.success('Logo uploaded! Click "Save All" to apply.')

        // Auto-save if onSave is provided
        if (onSave) {
          setTimeout(() => {
            onSave()
          }, 100)
        }
      }
      setUploading(false)
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    updateSetting('logo_url', '')
    toast.success('Logo removed')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Palette className="w-5 h-5 text-pink-600" />
        <h2 className="text-lg font-bold text-qgo-text">Branding & Appearance</h2>
      </div>

      {/* Logo Upload Section */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Company Logo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div>
            <label className="label">Upload Logo</label>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="logo-upload"
              className={`
                mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6
                border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${uploading
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-qgo-blue hover:bg-blue-50'
                }
              `}
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 text-qgo-blue animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-gray-400" />
              )}
              <span className={`mt-2 text-sm font-medium ${uploading ? 'text-gray-400' : 'text-qgo-blue'}`}>
                {uploading ? 'Uploading...' : 'Click to upload logo'}
              </span>
              <span className="mt-1 text-xs text-gray-500">PNG, JPG, SVG (max 500KB)</span>
            </label>
          </div>

          {/* Preview Area */}
          <div>
            <label className="label">Current Logo</label>
            <div className="mt-1 border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[120px] flex items-center justify-center">
              {settings.logo_url ? (
                <div className="relative group">
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="max-h-20 max-w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <span className="hidden text-red-500 text-sm">Failed to load image</span>
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Image className="mx-auto h-12 w-12 mb-2" />
                  <p className="text-sm">No logo uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual URL Input */}
        <div className="mt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Or enter logo URL manually
            </summary>
            <div className="mt-2">
              <SettingInput
                label="Logo URL"
                value={settings.logo_url || ''}
                onChange={v => updateSetting('logo_url', v)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </details>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {colors.map(({ key, label, default: defaultColor }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings[key] || defaultColor}
                  onChange={e => updateSetting(key, e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  className="input flex-1 font-mono text-sm"
                  value={settings[key] || defaultColor}
                  onChange={e => updateSetting(key, e.target.value)}
                  placeholder={defaultColor}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          {colors.map(({ key, default: defaultColor }) => (
            <div key={key} className="flex-1 text-center">
              <div
                className="w-full h-12 rounded-lg mb-1"
                style={{ backgroundColor: settings[key] || defaultColor }}
              />
              <p className="text-xs text-gray-500">{key.replace('color_', '')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Favicon */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Favicon
        </h3>
        <SettingInput
          label="Favicon URL"
          value={settings.favicon_url || ''}
          onChange={v => updateSetting('favicon_url', v)}
          placeholder="https://example.com/favicon.ico"
        />
      </div>
    </div>
  )
}
