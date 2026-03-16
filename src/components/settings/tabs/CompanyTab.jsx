import { Building2, Mail, Eye, EyeOff, Globe } from 'lucide-react'
import { useState } from 'react'
import SettingInput from '../SettingInput'

export default function CompanyTab({ settings, updateSetting, saving }) {
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Building2 className="w-5 h-5 text-qgo-blue" />
        <h2 className="text-lg font-bold text-qgo-text">Company Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput
          label="Company Name"
          value={settings.company_name}
          onChange={v => updateSetting('company_name', v)}
          placeholder="Q'go Cargo"
        />
        <SettingInput
          label="Company Email"
          type="email"
          value={settings.company_email}
          onChange={v => updateSetting('company_email', v)}
          placeholder="info@qgocargo.com"
        />
        <SettingInput
          label="Company Phone"
          type="tel"
          value={settings.company_phone}
          onChange={v => updateSetting('company_phone', v)}
          placeholder="+965 XXXX XXXX"
        />
        <SettingInput
          label="Website"
          type="url"
          value={settings.company_website}
          onChange={v => updateSetting('company_website', v)}
          placeholder="https://qgocargo.com"
        />
        <div className="md:col-span-2">
          <SettingInput
            label="Company Address"
            value={settings.company_address}
            onChange={v => updateSetting('company_address', v)}
            placeholder="Full address"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pb-4 pt-6 border-t border-gray-100">
        <Mail className="w-5 h-5 text-qgo-blue" />
        <h2 className="text-lg font-bold text-qgo-text">Email (SMTP) Configuration</h2>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        💡 <strong>Gmail users:</strong> Use <code>smtp.gmail.com</code>, port <code>587</code>, and enable App Passwords in your Google account.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput
          label="SMTP Host"
          value={settings.smtp_host}
          onChange={v => updateSetting('smtp_host', v)}
          placeholder="smtp.gmail.com"
        />
        <SettingInput
          label="SMTP Port"
          type="number"
          value={settings.smtp_port}
          onChange={v => updateSetting('smtp_port', v)}
          placeholder="587"
        />
        <SettingInput
          label="SMTP Username"
          value={settings.smtp_user}
          onChange={v => updateSetting('smtp_user', v)}
          placeholder="you@gmail.com"
        />
        <div>
          <label className="label">SMTP Password / App Password</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPass ? 'text' : 'password'}
              value={settings.smtp_pass || ''}
              onChange={e => updateSetting('smtp_pass', e.target.value)}
              placeholder="App password"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <SettingInput
          label="From Email"
          type="email"
          value={settings.smtp_from}
          onChange={v => updateSetting('smtp_from', v)}
          placeholder="noreply@qgocargo.com"
        />
        <SettingInput
          label="From Name"
          value={settings.smtp_from_name}
          onChange={v => updateSetting('smtp_from_name', v)}
          placeholder="Q'go Cargo"
        />
      </div>
    </div>
  )
}
