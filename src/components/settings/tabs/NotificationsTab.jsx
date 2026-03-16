import { Bell, Mail, MessageCircle, Check } from 'lucide-react'
import SettingToggle from '../SettingToggle'

export default function NotificationsTab({ settings, updateSetting }) {
  const notificationTypes = [
    { key: 'notify_new_survey', label: 'New Survey Received', desc: 'When a customer submits a new survey request', icon: Mail },
    { key: 'notify_survey_assigned', label: 'Surveyor Assigned', desc: 'When a surveyor is assigned to a survey', icon: Check },
    { key: 'notify_survey_completed', label: 'Survey Completed', desc: 'When surveyor finishes the survey', icon: Check },
    { key: 'notify_quote_ready', label: 'Quote Ready', desc: 'When quote is generated and ready to send', icon: MessageCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Bell className="w-5 h-5 text-amber-600" />
        <h2 className="text-lg font-bold text-qgo-text">Notification Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notificationTypes.map(({ key, label, desc, icon: Icon }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings[`notify_${key}_email`] === 'true'}
                    onChange={e => updateSetting(`notify_${key}_email`, e.target.checked.toString())}
                    className="rounded"
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings[`notify_${key}_whatsapp`] === 'true'}
                    onChange={e => updateSetting(`notify_${key}_whatsapp`, e.target.checked.toString())}
                    className="rounded"
                  />
                  WhatsApp
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-700 mb-3">SMS Notifications (Twilio)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Twilio Account SID</label>
            <input
              className="input"
              value={settings.twilio_account_sid || ''}
              onChange={e => updateSetting('twilio_account_sid', e.target.value)}
              placeholder="ACxxxxxxxxxxxxx"
            />
          </div>
          <div>
            <label className="label">Twilio Auth Token</label>
            <input
              className="input"
              type="password"
              value={settings.twilio_auth_token || ''}
              onChange={e => updateSetting('twilio_auth_token', e.target.value)}
              placeholder="your_auth_token"
            />
          </div>
          <div>
            <label className="label">Twilio Phone Number</label>
            <input
              className="input"
              value={settings.twilio_phone_number || ''}
              onChange={e => updateSetting('twilio_phone_number', e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </div>
      </div>
    </div>
  )
}