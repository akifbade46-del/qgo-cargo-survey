import { Globe, Sparkles, Star, Check } from 'lucide-react'
import SettingInput from '../SettingInput'
import { useState } from 'react'

export default function LandingPageTab({ settings, updateSetting }) {
  const [features, setFeatures] = useState(() => {
    try {
      return JSON.parse(settings.landing_features || '[]')
    } catch {
      return [
        { icon: '🚢', title: 'Sea Freight', description: 'Reliable shipping worldwide' },
        { icon: '✈️', title: 'Air Freight', description: 'Fast delivery for urgent shipments' },
        { icon: '📦', title: 'Cargo Survey', description: 'Professional survey services' },
      ]
    }
  })

  const [socialProof, setSocialProof] = useState(() => {
    try {
      return JSON.parse(settings.landing_social_proof || '[]')
    } catch {
      return []
    }
  })

  const addFeature = () => {
    setFeatures([...features, { icon: '📦', title: '', description: '' }])
  }

  const updateFeature = (index, field, value) => {
    const newFeatures = [...features]
    newFeatures[index][field] = value
    setFeatures(newFeatures)
    updateSetting('landing_features', JSON.stringify(newFeatures))
  }

  const removeFeature = (index) => {
    const newFeatures = features.filter((_, i) => i !== index)
    setFeatures(newFeatures)
    updateSetting('landing_features', JSON.stringify(newFeatures))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Globe className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-qgo-text">Landing Page Content</h2>
      </div>

      {/* Hero Section */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Hero Section
        </h3>
        <div className="space-y-4">
          <SettingInput
            label="Headline"
            value={settings.landing_hero_headline}
            onChange={v => updateSetting('landing_hero_headline', v)}
            placeholder="Professional Cargo Survey Services"
          />
          <div>
            <label className="label">Subheadline</label>
            <textarea
              className="input min-h-[80px]"
              value={settings.landing_hero_subheadline || ''}
              onChange={e => updateSetting('landing_hero_subheadline', e.target.value)}
              placeholder="Accurate surveys for seamless shipping experiences"
            />
          </div>
          <SettingInput
            label="CTA Button Text"
            value={settings.landing_hero_cta}
            onChange={v => updateSetting('landing_hero_cta', v)}
            placeholder="Get Free Quote"
          />
          <SettingInput
            label="Background Video URL (optional)"
            value={settings.landing_hero_video_url}
            onChange={v => updateSetting('landing_hero_video_url', v)}
            placeholder="https://example.com/video.mp4"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Features Section
          </h3>
          <button
            onClick={addFeature}
            className="btn-secondary text-sm py-1 px-3"
          >
            + Add Feature
          </button>
        </div>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <input
                className="w-16 text-center text-2xl bg-white border border-gray-300 rounded"
                value={feature.icon}
                onChange={e => updateFeature(index, 'icon', e.target.value)}
                maxLength={2}
              />
              <div className="flex-1 space-y-2">
                <input
                  className="input text-sm"
                  value={feature.title}
                  onChange={e => updateFeature(index, 'title', e.target.value)}
                  placeholder="Feature title"
                />
                <input
                  className="input text-sm"
                  value={feature.description}
                  onChange={e => updateFeature(index, 'description', e.target.value)}
                  placeholder="Short description"
                />
              </div>
              <button
                onClick={() => removeFeature(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          Social Proof / Client Logos
        </h3>
        <div>
          <label className="label">Client Names (comma separated)</label>
          <textarea
            className="input min-h-[60px]"
            value={socialProof.map(s => s.name).join(', ')}
            onChange={e => {
              const names = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              const newProof = names.map(name => ({ name }))
              setSocialProof(newProof)
              updateSetting('landing_social_proof', JSON.stringify(newProof))
            }}
            placeholder="Company A, Company B, Company C"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add client names to display as trusted partners
          </p>
        </div>
        {socialProof.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {socialProof.map((client, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {client.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
